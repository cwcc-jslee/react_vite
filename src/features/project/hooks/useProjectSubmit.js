// src/features/project/hooks/useProjectSubmit.js
/**
 * 프로젝트 폼 제출 관련 로직을 관리하는 커스텀 훅
 * 모든 제출 과정을 단계별로 처리하여 명확한 흐름을 제공합니다.
 */

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProject,
  setFormErrors,
  // setSubmitting,
  resetForm,
} from '../store/projectStoreActions';
// import { resetBuckets } from '../store/projectTaskSlice';
import { notification } from '../../../shared/services/notification';
import {
  validateProjectForm,
  validateProjectTaskForm,
} from '../utils/validateProjectForm';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
import { projectTaskService } from '../services/projectTaskService';
import { projectApiService } from '../services/projectApiService';
import { processRelationFields } from '../../../shared/utils/relationFieldUtils';

/**
 * 프로젝트 제출 관련 기능을 제공하는 커스텀 훅
 * 버킷 단위로 순차적으로 처리하는 방식으로 구현
 *
 * @returns {Object} 프로젝트 제출 관련 함수 및 상태
 */
export const useProjectSubmit = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.project.form.data || {});
  const buckets = useSelector((state) => state.projectBucket.buckets);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBucketIndex, setCurrentBucketIndex] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  /**
   * 데이터 정리 함수 (빈 값, 임시 데이터 제거)
   * @param {Object} data - 처리할 데이터
   * @returns {Object} 정리된 데이터
   */
  const prepareCleanData = useCallback((data) => {
    // 깊은 복사로 원본 데이터 유지
    const clonedData = JSON.parse(JSON.stringify(data));

    // 불필요한 임시 필드 제거
    const { __temp, ...cleanData } = clonedData;

    // null이나 빈 문자열인 경우 해당 키 삭제
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    return cleanData;
  }, []);

  /**
   * 버킷/태스크 데이터 정리 함수
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Array} 정리된 버킷 데이터 배열
   */
  const cleanProjectBucketData = useCallback(
    (buckets) => {
      if (!buckets || !Array.isArray(buckets)) return [];

      return buckets.map((bucket) => ({
        bucket: bucket.bucket,
        position: bucket.position,
        tasks:
          bucket.tasks?.map((task) => {
            const cleanedTask = prepareCleanData(task);

            // isScheduled값이  false 인 경우 특정 키 삭제
            if (!cleanedTask.isScheduled) {
              // 키가 없을 수 있으므로 기본값 undefined로 설정
              const {
                planningTimeData = undefined,
                planStartDate = undefined,
                planEndDate = undefined,
                ...restTask
              } = cleanedTask;
              return restTask;
            }

            return cleanedTask;
          }) || [],
      }));
    },
    [prepareCleanData],
  );

  /**
   * 프로젝트 폼 제출 처리 함수
   * 버킷 단위로 순차적으로 처리
   *
   * 처리 단계:
   * 1. 유효성 검사
   * 2. 데이터 전처리
   * 3. 프로젝트 생성
   * 4. 각 버킷별로 순차적으로 처리 (버킷 생성 -> 해당 버킷의 태스크 생성)
   * 7. 최종 프로젝트 데이터 조회 및 리덕스 상태 초기화
   *
   * @param {Event} e - 이벤트 객체 (선택적)
   * @param {Array} projectBuckets - 버킷/태스크 데이터
   * @returns {Promise<Object|boolean>} 제출 결과 또는 성공 여부
   */
  const handleFormSubmit = useCallback(
    async (e, projectBuckets) => {
      if (e && e.preventDefault) e.preventDefault();

      const startTime = Date.now();
      let totalBuckets = 0;
      let totalTasks = 0;

      // 진행 상태 초기화
      setProgress(0);
      setCurrentBucketIndex(0);
      setProcessingStep('유효성 검사');

      // 최신 buckets 상태 확인
      const currentBuckets = projectBuckets || buckets;

      // 1-1. 기본 폼 유효성 검사
      const { isValid, errors: validationErrors } =
        validateProjectForm(formData);

      if (!isValid) {
        return {
          success: false,
          project: null,
          error: {
            message: Object.values(validationErrors)[0],
            code: 'VALIDATION_ERROR',
            details: validationErrors,
          },
          metadata: {
            totalBuckets: 0,
            totalTasks: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      // 1-2. 버킷/태스크 유효성 검사
      if (!currentBuckets || currentBuckets.length === 0) {
        return {
          success: false,
          project: null,
          error: {
            message: '최소 1개 이상의 버킷이 필요합니다.',
            code: 'BUCKET_REQUIRED',
            details: { buckets: currentBuckets },
          },
          metadata: {
            totalBuckets: 0,
            totalTasks: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      // Task 유효성 검사
      const hasTasks = currentBuckets.some(
        (bucket) => bucket.tasks && bucket.tasks.length > 0,
      );
      if (!hasTasks) {
        return {
          success: false,
          project: null,
          error: {
            message: '최소 1개 이상의 Task가 필요합니다.',
            code: 'TASK_REQUIRED',
            details: { buckets: currentBuckets },
          },
          metadata: {
            totalBuckets: currentBuckets.length,
            totalTasks: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      // 버킷별 Task 유효성 검사
      const emptyBuckets = currentBuckets.filter(
        (bucket) => !bucket.tasks || bucket.tasks.length === 0,
      );
      if (emptyBuckets.length > 0) {
        return {
          success: false,
          project: null,
          error: {
            message: `'${emptyBuckets
              .map((b) => b.bucket)
              .join(', ')}' 버킷에 Task가 없습니다.`,
            code: 'EMPTY_BUCKET',
            details: { emptyBuckets },
          },
          metadata: {
            totalBuckets: currentBuckets.length,
            totalTasks: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      const { isValid: isTasksValid, errors: validationTasksErrors } =
        validateProjectTaskForm(currentBuckets);

      if (!isTasksValid) {
        return {
          success: false,
          project: null,
          error: {
            message: Object.values(validationTasksErrors)[0],
            code: 'TASK_VALIDATION_ERROR',
            details: validationTasksErrors,
          },
          metadata: {
            totalBuckets: currentBuckets.length,
            totalTasks: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      try {
        setProgress(5);
        setProcessingStep('데이터 전처리');

        // 2. 데이터 전처리
        const cleanBaseFormData = prepareCleanData(formData);
        const cleanProjectBuckets = cleanProjectBucketData(currentBuckets);

        // 프로젝트 기본 데이터의 관계 필드 처리 (users 등)
        const processedFormData = processRelationFields(cleanBaseFormData);

        // 버킷/태스크 데이터 전처리 (관계 필드 처리 및 데이터 형식 변환)
        const processedProjectBuckets =
          processProjectBuckets(cleanProjectBuckets);

        setProgress(10);

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(processedFormData);
        const snakeCaseProjectBuckets =
          processedProjectBuckets.length > 0
            ? convertKeysToSnakeCase(processedProjectBuckets)
            : [];

        setProgress(15);
        setProcessingStep('프로젝트 생성');

        // 4. 프로젝트 API 제출
        setIsSubmitting(true);
        const resultAction = await projectApiService.createProject(
          snakeCaseBaseForm,
        );

        // 제출 실패 시 종료
        if (!resultAction?.data) {
          return {
            success: false,
            project: null,
            error: {
              message: '프로젝트 생성 중 오류가 발생했습니다.',
              code: 'PROJECT_CREATION_FAILED',
              details: { resultAction },
            },
            metadata: {
              totalBuckets: 0,
              totalTasks: 0,
              processingTime: Date.now() - startTime,
            },
          };
        }

        // 생성된 프로젝트 정보
        const createdProject = resultAction.data;
        const projectId = createdProject.id;

        setProgress(20);

        // 5. 버킷이 없는 경우 종료
        if (snakeCaseProjectBuckets.length === 0) {
          return {
            success: false,
            project: createdProject,
            error: {
              message: '버킷 정보가 없습니다.',
              code: 'NO_BUCKETS',
              details: { projectId },
            },
            metadata: {
              totalBuckets: 0,
              totalTasks: 0,
              processingTime: Date.now() - startTime,
            },
          };
        }

        // 6. 각 버킷과 해당 태스크를 순차적으로 처리
        let finalProject = createdProject;
        totalBuckets = snakeCaseProjectBuckets.length;

        // 각 버킷당 할당된 진행률 (20%~90% 사이에서 분배)
        const progressPerBucket = 70 / totalBuckets;

        try {
          for (let bucketIndex = 0; bucketIndex < totalBuckets; bucketIndex++) {
            const bucket = snakeCaseProjectBuckets[bucketIndex];
            setCurrentBucketIndex(bucketIndex);

            // 6-1. 버킷 생성 단계
            setProcessingStep(`버킷 "${bucket.bucket}" 생성 중`);
            const bucketPayload = {
              project: projectId,
              name: bucket.bucket,
              position: bucket.position,
            };

            let bucketResponse;
            try {
              bucketResponse = await projectTaskService.createBucket(
                bucketPayload,
              );
            } catch (error) {
              throw new Error(
                `버킷 "${bucket.bucket}" 생성 중 오류 발생: ${
                  error.message || '알 수 없는 오류'
                }`,
              );
            }

            let bucketId;
            if (bucketResponse && bucketResponse.id) {
              bucketId = bucketResponse.id;
            } else if (
              bucketResponse &&
              bucketResponse.data &&
              bucketResponse.data.id
            ) {
              bucketId = bucketResponse.data.id;
            } else {
              throw new Error('버킷 ID를 찾을 수 없습니다.');
            }

            setProgress(20 + bucketIndex * progressPerBucket);

            if (!bucket.tasks || bucket.tasks.length === 0) {
              continue;
            }

            setProcessingStep(`버킷 "${bucket.bucket}"의 태스크 생성 중`);
            const tasks = bucket.tasks;
            const tasksCount = tasks.length;
            totalTasks += tasksCount;

            if (tasksCount > 10) {
              if (!bucketId) {
                continue;
              }

              const taskPromises = tasks.map((task) => {
                const taskPayload = createTaskPayload(
                  projectId,
                  bucketId,
                  task,
                );
                return projectTaskService.createTask(taskPayload);
              });

              await Promise.all(taskPromises);
            } else {
              const progressPerTask = progressPerBucket / (tasksCount || 1);

              for (let taskIndex = 0; taskIndex < tasksCount; taskIndex++) {
                const task = tasks[taskIndex];
                if (!bucketId) {
                  continue;
                }

                const taskPayload = createTaskPayload(
                  projectId,
                  bucketId,
                  task,
                );

                await projectTaskService.createTask(taskPayload);

                setProgress(
                  20 +
                    bucketIndex * progressPerBucket +
                    taskIndex * progressPerTask,
                );
              }
            }

            setProgress(20 + (bucketIndex + 1) * progressPerBucket);
          }

          setProgress(90);
          setProcessingStep('최종 프로젝트 데이터 조회');

          return {
            success: true,
            project: finalProject,
            error: null,
            metadata: {
              totalBuckets,
              totalTasks,
              processingTime: Date.now() - startTime,
            },
          };
        } catch (structureError) {
          return {
            success: false,
            project: finalProject,
            error: {
              message: `버킷 ${
                currentBucketIndex + 1
              }/${totalBuckets}에서 오류가 발생했습니다. 프로젝트는 생성되었습니다.`,
              code: 'STRUCTURE_CREATION_ERROR',
              details: {
                error: structureError,
                currentBucketIndex,
                totalBuckets,
              },
            },
            metadata: {
              totalBuckets,
              totalTasks,
              processingTime: Date.now() - startTime,
            },
          };
        }
      } catch (error) {
        return {
          success: false,
          project: null,
          error: {
            message: error.message || '프로젝트 등록 중 오류가 발생했습니다.',
            code: 'UNKNOWN_ERROR',
            details: { error },
          },
          metadata: {
            totalBuckets,
            totalTasks,
            processingTime: Date.now() - startTime,
          },
        };
      } finally {
        setIsSubmitting(false);
        setProcessingStep('');
      }
    },
    [formData, buckets, dispatch],
  );

  /**
   * 버킷과 태스크 데이터 전처리 함수
   * 관계 필드 처리 및 데이터 형식 변환
   *
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Array} 처리된 버킷 데이터 배열
   */
  const processProjectBuckets = (buckets) => {
    if (!buckets || !Array.isArray(buckets) || buckets.length === 0) {
      return [];
    }

    // 깊은 복사로 원본 데이터 유지
    const processedBuckets = JSON.parse(JSON.stringify(buckets));

    // 각 버킷과 태스크 처리
    processedBuckets.forEach((bucket) => {
      // 태스크 데이터 처리
      if (bucket.tasks && Array.isArray(bucket.tasks)) {
        bucket.tasks = bucket.tasks.map((task) => {
          // 1. task.users 필드 처리 (객체 배열 -> ID 배열)
          if (
            task.users &&
            Array.isArray(task.users) &&
            task.users.length > 0
          ) {
            if (
              typeof task.users[0] === 'object' &&
              task.users[0].id !== undefined
            ) {
              task.users = task.users.map((user) => user.id);
            }
          }

          // isScheduled는 boolean 값으로 그대로 유지

          // 3. 필요없는 필드 정리 및 데이터 형식 준비
          // planning_time_data, plan_start_date, plan_end_date, due_date 등은 그대로 유지

          return task;
        });
      }
    });

    return processedBuckets;
  };

  /**
   * 태스크 데이터로 API 제출용 페이로드 생성
   * 이미 전처리된 태스크 데이터에 프로젝트 ID와 버킷 ID만 추가
   *
   * @param {string|number} projectId - 프로젝트 ID
   * @param {string|number} bucketId - 버킷 ID
   * @param {Object} task - 전처리된 태스크 데이터
   * @returns {Object} API 제출용 태스크 페이로드
   */
  const createTaskPayload = (projectId, bucketId, task) => {
    // 유효한 bucketId 확인
    if (!bucketId) {
      console.error('Error: bucketId is required for task creation', {
        projectId,
        bucketId,
        task,
      });
      throw new Error('버킷 ID가 없어 태스크를 생성할 수 없습니다.');
    }

    // 프로젝트 ID와 버킷 ID 추가 (나머지 필드는 전처리된 상태 그대로 사용)
    return {
      ...task,
      project: projectId,
      project_task_bucket: bucketId,
    };
  };

  return {
    isSubmitting,
    progress,
    processingStep,
    currentBucketIndex,
    handleFormSubmit,
    prepareCleanData,
  };
};

export default useProjectSubmit;
