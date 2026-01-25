/**
 * 프로젝트 태스크 제출 처리를 위한 커스텀 훅
 *
 * 주요 기능:
 * 1. 버킷 및 태스크 데이터 추출 및 처리
 * 2. id/documentId 유무에 따라 생성(CREATE) 또는 수정(UPDATE) 처리
 * 3. API 호출 및 응답 처리
 * 4. 에러 처리 및 복구
 */

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { notification } from '@shared/services/notification';
import { projectTaskService } from '../services/projectTaskService';
import { projectApiService } from '../services/projectApiService';
import { STATUS_CHANGE_TYPE_CODES } from '../constants/statusChangeTypeConstants';
import dayjs from 'dayjs';

export const useProjectTaskSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentUser = useSelector((state) => state.auth.user);

  /**
   * 버킷 데이터 전처리
   * @param {Object} bucket - 처리할 버킷 데이터
   * @param {number} projectId - 프로젝트 ID
   * @param {number} position - 버킷 위치
   * @returns {Object} 처리된 버킷 데이터
   */
  const prepareBucketData = useCallback((bucket, projectId, position) => {
    const {
      documentId,
      id,
      isModified, // API 전송 시 제외
      tasks, // tasks는 별도 처리
      ...cleanBucket
    } = bucket;

    const bucketData = {
      ...cleanBucket,
      project: projectId,
      position,
    };

    return {
      documentId,
      id,
      isNew: !id && !documentId,
      data: bucketData,
    };
  }, []);

  /**
   * 태스크 데이터 전처리
   * @param {Object} task - 처리할 태스크 데이터
   * @param {number} projectId - 프로젝트 ID
   * @param {string} bucketDocumentId - 버킷 documentId
   * @param {number} position - 태스크 위치
   * @returns {Object} 처리된 태스크 데이터
   */
  const prepareTaskData = useCallback((task, projectId, bucketDocumentId, position) => {
    // 깊은 복사로 원본 데이터 유지
    const processedTask = JSON.parse(JSON.stringify(task));

    // documentId 분리 및 불필요한 필드 제거
    const {
      documentId,
      id,
      isModified,
      bucketId,
      bucketName,
      _bucketIndex,
      _taskIndex,
      ...cleanTask
    } = processedTask;

    // users 필드 처리
    if (cleanTask.users && Array.isArray(cleanTask.users)) {
      cleanTask.users = cleanTask.users.map((user) =>
        typeof user === 'object' ? user.id : user,
      );
    }

    // taskProgress 처리
    if (cleanTask.taskProgress && typeof cleanTask.taskProgress === 'object') {
      cleanTask.taskProgress = cleanTask.taskProgress.id;
    }

    // priorityLevel 처리
    if (cleanTask.priorityLevel && typeof cleanTask.priorityLevel === 'object') {
      cleanTask.priorityLevel = cleanTask.priorityLevel.id;
    }

    // isScheduled가 false인 경우 관련 필드 제거
    if (!cleanTask.isScheduled) {
      delete cleanTask.planStartDate;
      delete cleanTask.planEndDate;
      delete cleanTask.planningTimeData;
    }

    const taskData = {
      ...cleanTask,
      project: projectId,
      projectTaskBucket: bucketDocumentId,
      position,
    };

    return {
      documentId,
      id,
      isNew: !id && !documentId,
      data: taskData,
    };
  }, []);

  /**
   * 버킷 및 태스크 데이터 유효성 검사
   * - 버킷 이름 필수
   * - 태스크 이름 필수
   * - isScheduled가 true인 경우: 날짜, 인원수, 투입률, 작업일 검사
   *
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  const validateBucketsAndTasks = useCallback((buckets) => {
    const errors = [];

    if (!buckets || buckets.length === 0) {
      errors.push('최소 1개 이상의 버킷이 필요합니다.');
      return { isValid: false, errors };
    }

    // 수정된 항목만 검사
    buckets.forEach((bucket, bucketIndex) => {
      const bucketName = bucket.name || `버킷 ${bucketIndex + 1}`;

      // 버킷 이름 검사 (수정된 버킷만)
      if (bucket.isModified) {
        if (!bucket.name || bucket.name.trim() === '') {
          errors.push(`버킷 ${bucketIndex + 1}의 이름이 비어있습니다.`);
        }
      }

      // 태스크 검사
      if (bucket.tasks && bucket.tasks.length > 0) {
        bucket.tasks.forEach((task, taskIndex) => {
          // 수정된 태스크만 검사
          if (!task.isModified) return;

          const taskName = task.name || `작업 ${taskIndex + 1}`;

          // 작업명 필수
          if (!task.name || task.name.trim() === '') {
            errors.push(`"${bucketName}"의 작업 ${taskIndex + 1}에 작업명이 없습니다.`);
          }

          // isScheduled가 false가 아닌 경우 추가 검사 (undefined도 true로 취급 - 모달과 동일한 로직)
          if (task.isScheduled !== false) {
            // 계획 시작일, 종료일 필수
            if (!task.planStartDate || !task.planEndDate) {
              errors.push(`"${bucketName}"의 "${taskName}"에 계획 시작/종료일이 없습니다.`);
            }

            // 시작일이 종료일보다 늦으면 오류
            if (task.planStartDate && task.planEndDate) {
              const startDate = new Date(task.planStartDate);
              const endDate = new Date(task.planEndDate);
              if (startDate > endDate) {
                errors.push(`"${bucketName}"의 "${taskName}"의 종료일이 시작일보다 빠릅니다.`);
              }
            }

            // 시간 관리 데이터 검사
            const planningTimeData = task.planningTimeData || {};
            const personnelCount = parseInt(planningTimeData.personnelCount);
            const allocationRate = parseFloat(planningTimeData.allocationRate);
            const workDays = parseFloat(planningTimeData.workDays);

            // 인원수 검사 (1~100)
            if (isNaN(personnelCount) || personnelCount < 1 || personnelCount > 100) {
              errors.push(`"${bucketName}"의 "${taskName}"의 인원 수가 유효하지 않습니다. (1~100)`);
            }

            // 투입률 검사 (0~1, 소수점 1자리)
            if (isNaN(allocationRate) || allocationRate <= 0 || allocationRate > 1) {
              errors.push(`"${bucketName}"의 "${taskName}"의 투입률이 유효하지 않습니다. (0.1~1)`);
            }

            // 작업일 검사 (0.1~30, 소수점 1자리)
            if (isNaN(workDays) || workDays < 0.1 || workDays > 30) {
              errors.push(`"${bucketName}"의 "${taskName}"의 작업일이 유효하지 않습니다. (0.1~30)`);
            }
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  /**
   * 버킷 및 태스크 저장 처리
   * - 유효성 검사 후 저장
   * - isModified === true 인 항목만 처리
   * - id/documentId 있음: UPDATE
   * - id/documentId 없음: CREATE
   *
   * @param {Array} buckets - 버킷 데이터 배열
   * @param {number} projectId - 프로젝트 ID
   * @returns {Promise<Object>} 처리 결과
   */
  const handleSaveAll = useCallback(
    async (buckets, projectId) => {
      if (!buckets || !Array.isArray(buckets) || buckets.length === 0) {
        notification.info({
          message: '저장 알림',
          description: '저장할 데이터가 없습니다.',
        });
        return { success: true, buckets: [], tasks: [] };
      }

      if (!projectId) {
        notification.error({
          message: '저장 실패',
          description: '프로젝트 ID가 없습니다.',
        });
        return { success: false, error: 'Missing projectId' };
      }

      // 수정된 버킷과 태스크 필터링
      const modifiedBuckets = buckets.filter((bucket) => bucket.isModified);
      const modifiedTasks = [];
      buckets.forEach((bucket, bucketIndex) => {
        if (bucket.tasks && Array.isArray(bucket.tasks)) {
          bucket.tasks.forEach((task, taskIndex) => {
            if (task.isModified) {
              modifiedTasks.push({
                task,
                bucketIndex,
                taskIndex,
                bucketDocumentId: bucket.documentId,
              });
            }
          });
        }
      });

      // 수정된 항목이 없으면 알림
      if (modifiedBuckets.length === 0 && modifiedTasks.length === 0) {
        notification.info({
          message: '저장 알림',
          description: '수정된 항목이 없습니다.',
        });
        return { success: true, buckets: [], tasks: [] };
      }

      // 유효성 검사
      const { isValid, errors: validationErrors } = validateBucketsAndTasks(buckets);
      if (!isValid) {
        notification.error({
          message: '유효성 검사 실패',
          description: validationErrors[0], // 첫 번째 오류 메시지 표시
        });
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationErrors[0],
            details: validationErrors,
          },
        };
      }

      try {
        setIsSubmitting(true);
        setProgress(0);

        // 0단계: 현재 프로젝트 정보 및 수정 전 총 공수 조회
        let projectData = null;
        let oldTotalHours = 0;
        try {
          const projectResponse = await projectApiService.getProjectDetail(projectId);
          projectData = Array.isArray(projectResponse?.data)
            ? projectResponse.data[0]
            : projectResponse?.data;

          if (projectData?.projectTasks) {
            oldTotalHours = projectData.projectTasks.reduce(
              (sum, task) =>
                sum + (Number(task.planningTimeData?.totalPlannedHours) || 0),
              0,
            );
          }
        } catch (e) {
          console.error('Failed to fetch project detail', e);
        }

        // 수정 후 총 공수 계산
        let newTotalHours = 0;
        buckets.forEach((bucket) => {
          if (bucket.tasks) {
            newTotalHours += bucket.tasks.reduce(
              (sum, task) =>
                sum + (Number(task.planningTimeData?.totalPlannedHours) || 0),
              0,
            );
          }
        });

        const bucketResults = [];
        const taskResults = [];
        const bucketIdMap = new Map(); // 버킷 인덱스 → documentId 매핑

        // 기존 버킷의 documentId를 미리 매핑
        buckets.forEach((bucket, index) => {
          if (bucket.documentId) {
            bucketIdMap.set(index, bucket.documentId);
          }
        });

        // 1단계: 수정된 버킷만 처리 (30%)
        setProgress(10);
        let newBucketsCount = 0;
        let updatedBucketsCount = 0;

        for (let i = 0; i < buckets.length; i++) {
          const bucket = buckets[i];

          // isModified가 true인 버킷만 처리
          if (!bucket.isModified) continue;

          const prepared = prepareBucketData(bucket, projectId, i);

          let result;
          if (prepared.isNew) {
            // CREATE
            result = await projectTaskService.createBucket(prepared.data);
            const newDocumentId = result.data?.documentId || result.documentId;
            bucketIdMap.set(i, newDocumentId);
            newBucketsCount++;
          } else {
            // UPDATE
            result = await projectTaskService.updateBucket(prepared.documentId, prepared.data);
            bucketIdMap.set(i, prepared.documentId);
            updatedBucketsCount++;
          }
          bucketResults.push(result);
        }
        setProgress(30);

        // 2단계: 수정된 태스크만 처리 (90%)
        const totalModifiedTasks = modifiedTasks.length;
        let processedTasks = 0;
        let newTasksCount = 0;
        let updatedTasksCount = 0;

        for (const { task, bucketIndex, taskIndex } of modifiedTasks) {
          const bucketDocumentId = bucketIdMap.get(bucketIndex);

          if (!bucketDocumentId) {
            console.warn(`Bucket documentId not found for index ${bucketIndex}`);
            continue;
          }

          const prepared = prepareTaskData(task, projectId, bucketDocumentId, taskIndex);

          let result;
          if (prepared.isNew) {
            // CREATE
            result = await projectTaskService.createTask(prepared.data);
            newTasksCount++;
          } else {
            // UPDATE
            result = await projectTaskService.updateTask(prepared.documentId, prepared.data);
            updatedTasksCount++;
          }
          taskResults.push(result);

          processedTasks++;
          if (totalModifiedTasks > 0) {
            setProgress(30 + Math.floor((processedTasks / totalModifiedTasks) * 60));
          }
        }

        setProgress(95);

        // 3단계: 성공 메시지
        notification.success({
          message: '저장 완료',
          description: `버킷: ${newBucketsCount}개 생성, ${updatedBucketsCount}개 수정 | 태스크: ${newTasksCount}개 생성, ${updatedTasksCount}개 수정`,
        });

        // 4단계: 프로젝트 승인 상태 변경 및 이력 생성
        try {
          if (projectData) {
            // 승인 상태 'pending'으로 변경
            // Strapi v5에서는 업데이트 시 documentId가 필요함
            const updateId = projectData.documentId || projectId;

            await projectApiService.updateProject(updateId, {
              currentApprovalStatus: 'pending',
            });

            // 상태 변경 이력 생성
            const statusChangeData = {
              project: projectId,
              name: STATUS_CHANGE_TYPE_CODES.TASK_UPDATE,
              fromStatus: projectData.pjtStatus?.id,
              toStatus: projectData.pjtStatus?.id, // 상태는 유지
              statusDetail: `작업/일정 변경에 따른 재승인 요청 (계획공수: ${oldTotalHours}h → ${newTotalHours}h)`,
              requestedBy: currentUser?.user?.id || null,
              requestedAt: dayjs().toISOString(),
              approvalStatus: 'pending',
            };

            await projectApiService.createProjectStatusChange(statusChangeData);
            console.log('프로젝트 승인 상태 변경 및 이력 생성 완료');
          }
        } catch (statusError) {
          console.error('프로젝트 상태 업데이트 중 오류 발생:', statusError);
          // 저장 자체는 성공했으므로 에러를 throw하지 않고 경고만 표시하거나 무시
          notification.warning({
            message: '상태 업데이트 실패',
            description: '작업은 저장되었으나 승인 상태 변경에 실패했습니다.',
          });
        }

        setProgress(100);
        return {
          success: true,
          buckets: bucketResults,
          tasks: taskResults,
        };
      } catch (error) {
        console.error('Save error:', error);
        notification.error({
          message: '저장 실패',
          description: error.message || '저장 중 오류가 발생했습니다.',
        });
        return { success: false, error };
      } finally {
        setIsSubmitting(false);
        setProgress(0);
      }
    },
    [prepareBucketData, prepareTaskData, validateBucketsAndTasks],
  );

  /**
   * 수정된 태스크만 업데이트 (기존 기능 유지)
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Promise<Object>} 처리 결과
   */
  const handleTaskUpdate = useCallback(
    async (buckets) => {
      if (!buckets || !Array.isArray(buckets)) return { success: true, updatedTasks: [] };

      try {
        setIsSubmitting(true);
        setProgress(0);

        // 수정된 태스크 추출
        const modifiedTasks = [];
        buckets.forEach((bucket) => {
          if (bucket.tasks && Array.isArray(bucket.tasks)) {
            bucket.tasks.forEach((task) => {
              if (task.isModified) {
                modifiedTasks.push({ ...task });
              }
            });
          }
        });

        if (modifiedTasks.length === 0) {
          notification.info({
            message: '업데이트 알림',
            description: '수정된 태스크가 없습니다.',
          });
          return { success: true, updatedTasks: [] };
        }

        setProgress(20);

        // 각 태스크 데이터 전처리 및 업데이트
        const processedTasks = modifiedTasks.map((task) => {
          const processedTask = JSON.parse(JSON.stringify(task));
          const { documentId, id, isModified, bucketId, bucketName, ...cleanTask } = processedTask;

          if (cleanTask.users && Array.isArray(cleanTask.users)) {
            cleanTask.users = cleanTask.users.map((user) =>
              typeof user === 'object' ? user.id : user,
            );
          }
          if (cleanTask.taskProgress && typeof cleanTask.taskProgress === 'object') {
            cleanTask.taskProgress = cleanTask.taskProgress.id;
          }
          if (cleanTask.priorityLevel && typeof cleanTask.priorityLevel === 'object') {
            cleanTask.priorityLevel = cleanTask.priorityLevel.id;
          }
          if (!cleanTask.isScheduled) {
            delete cleanTask.planStartDate;
            delete cleanTask.planEndDate;
            delete cleanTask.planningTimeData;
          }

          return { documentId, data: cleanTask };
        });

        setProgress(40);

        const updatePromises = processedTasks.map(({ documentId, data }) =>
          projectTaskService.updateTask(documentId, data),
        );
        setProgress(60);

        const results = await Promise.all(updatePromises);
        setProgress(80);

        notification.success({
          message: '태스크 업데이트 성공',
          description: `${results.length}개의 태스크가 성공적으로 업데이트되었습니다.`,
        });

        setProgress(100);
        return { success: true, updatedTasks: results };
      } catch (error) {
        console.error('Task update error:', error);
        notification.error({
          message: '태스크 업데이트 실패',
          description: error.message || '태스크 업데이트 중 오류가 발생했습니다.',
        });
        return { success: false, error };
      } finally {
        setIsSubmitting(false);
        setProgress(0);
      }
    },
    [],
  );

  return {
    isSubmitting,
    progress,
    handleSaveAll,
    handleTaskUpdate,
  };
};

export default useProjectTaskSubmit;
