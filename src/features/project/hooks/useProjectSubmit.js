// src/features/project/hooks/useProjectSubmit.js
/**
 * 프로젝트 폼 제출 관련 로직을 관리하는 커스텀 훅
 * 모든 제출 과정을 단계별로 처리하여 명확한 흐름을 제공합니다.
 */

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProject,
  updateProject,
  setFormErrors,
  setSubmitting,
} from '../store/projectSlice';
import { notification } from '../../../shared/services/notification';
import {
  validateProjectForm,
  validateProjectTaskForm,
} from '../utils/validateProjectForm';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
import { projectBucketService } from '../services/projectBucketService';
import { projectTaskService } from '../services/projectTaskService';

/**
 * 프로젝트 제출 관련 기능을 제공하는 커스텀 훅
 * 버킷 단위로 순차적으로 처리하는 방식으로 구현
 *
 * @returns {Object} 프로젝트 제출 관련 함수 및 상태
 */
export const useProjectSubmit = () => {
  const dispatch = useDispatch();
  const { data: formData, isSubmitting } = useSelector(
    (state) => state.project.form,
  );
  const [progress, setProgress] = useState(0);
  const [currentBucketIndex, setCurrentBucketIndex] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  /**
   * 프로젝트 폼 제출 처리 함수
   * 버킷 단위로 순차적으로 처리
   *
   * 처리 단계:
   * 1. 유효성 검사
   * 2. 데이터 전처리
   * 3. 프로젝트 생성
   * 4. 각 버킷별로 순차적으로 처리 (버킷 생성 -> 해당 버킷의 태스크 생성)
   *
   * @param {Event} e - 이벤트 객체 (선택적)
   * @param {Array} projectBuckets - 버킷/태스크 데이터
   * @returns {Promise<Object|boolean>} 제출 결과 또는 성공 여부
   */
  const handleFormSubmit = useCallback(
    async (e, projectBuckets) => {
      if (e && e.preventDefault) e.preventDefault();

      // 진행 상태 초기화
      setProgress(0);
      setCurrentBucketIndex(0);
      setProcessingStep('유효성 검사');

      // 1-1. 기본 폼 유효성 검사
      const { isValid, errors: validationErrors } =
        validateProjectForm(formData);

      if (!isValid) {
        dispatch(setFormErrors(validationErrors));
        const formError = Object.values(validationErrors)[0];
        notification.error({
          message: '기본폼 등록 오류',
          description: formError,
        });
        return false;
      }

      // 1-2. 버킷/태스크 유효성 검사
      if (!projectBuckets || projectBuckets.length === 0) {
        // 버킷이 없어도 프로젝트만 생성 가능
        console.log('No buckets provided, will create project only.');
      } else {
        const { isValid: isTasksValid, errors: validationTasksErrors } =
          validateProjectTaskForm(projectBuckets);

        if (!isTasksValid) {
          const tasksError = Object.values(validationTasksErrors)[0];
          notification.error({
            message: 'TASK 등록 오류',
            description: tasksError,
          });
          return false;
        }
      }

      try {
        setProgress(5);
        setProcessingStep('데이터 전처리');

        // 2. 데이터 전처리
        const cleanBaseFormData = prepareCleanData(formData);
        const cleanProjectBuckets =
          projectBuckets && projectBuckets.length > 0
            ? JSON.parse(JSON.stringify(projectBuckets))
            : [];

        console.log(`>>> 전처리된 프로젝트 데이터:`, cleanBaseFormData);
        console.log(`>>> 전처리된 버킷 데이터:`, cleanProjectBuckets);

        setProgress(10);

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(cleanBaseFormData);
        const snakeCaseProjectBuckets =
          cleanProjectBuckets.length > 0
            ? convertKeysToSnakeCase(cleanProjectBuckets)
            : [];

        setProgress(15);
        setProcessingStep('프로젝트 생성');

        // 4. 프로젝트 API 제출
        dispatch(setSubmitting(true));
        const resultAction = await dispatch(createProject(snakeCaseBaseForm));

        // 제출 실패 시 종료
        if (!createProject.fulfilled.match(resultAction)) {
          dispatch(setSubmitting(false));
          setProgress(0);
          return false;
        }

        // 생성된 프로젝트 정보
        const createdProject = resultAction.payload;
        const projectId = createdProject.id;

        setProgress(20);

        // 5. 버킷이 없는 경우 종료
        if (snakeCaseProjectBuckets.length === 0) {
          notification.error({
            message: '버킷 등록 실패',
            description: '버킷 정보가 없습니다.',
          });
          setProgress(100);
          dispatch(setSubmitting(false));
          return createdProject;
        }

        // 6. 각 버킷과 해당 태스크를 순차적으로 처리
        let finalProject = createdProject;
        const totalBuckets = snakeCaseProjectBuckets.length;

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

            // 버킷 생성 API 호출
            const bucketResponse = await projectBucketService.createBucket(
              bucketPayload,
            );
            const bucketId = bucketResponse.id;

            // 버킷별 첫 단계 진행률 업데이트
            setProgress(20 + bucketIndex * progressPerBucket);

            // 6-2. 태스크가 없으면 다음 버킷으로
            if (!bucket.tasks || bucket.tasks.length === 0) {
              continue;
            }

            // 6-3. 각 태스크 순차적 또는 병렬 생성
            setProcessingStep(`버킷 "${bucket.bucket}"의 태스크 생성 중`);
            const tasks = bucket.tasks;
            const tasksCount = tasks.length;

            // 태스크가 많을 경우 병렬 처리, 적을 경우 순차 처리
            if (tasksCount > 10) {
              // 병렬 처리 (태스크가 많은 경우)
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
              // 순차 처리 (태스크가 적은 경우)
              const progressPerTask = progressPerBucket / (tasksCount || 1);

              for (let taskIndex = 0; taskIndex < tasksCount; taskIndex++) {
                const task = tasks[taskIndex];
                const taskPayload = createTaskPayload(
                  projectId,
                  bucketId,
                  task,
                );

                await projectTaskService.createTask(taskPayload);

                // 태스크별 진행률 업데이트
                setProgress(
                  20 +
                    bucketIndex * progressPerBucket +
                    taskIndex * progressPerTask,
                );
              }
            }

            // 버킷 완료 진행률 업데이트
            setProgress(20 + (bucketIndex + 1) * progressPerBucket);
          }

          setProgress(90);
          setProcessingStep('최종 프로젝트 데이터 조회');

          // 7. 최종 프로젝트 데이터 조회 --> document id 로 전환 필요..
          // const finalProjectData =
          //   await projectBucketService.getProjectWithStructure(projectId);
          // finalProject = finalProjectData;

          setProgress(100);

          notification.success({
            message: '프로젝트 등록 성공',
            description:
              '프로젝트와 모든 버킷/태스크가 성공적으로 등록되었습니다.',
          });

          return finalProject;
        } catch (structureError) {
          console.error('Structure creation error:', structureError);
          notification.warning({
            message: '구조 등록 부분 오류',
            description: `버킷 ${
              currentBucketIndex + 1
            }/${totalBuckets}에서 오류가 발생했습니다. 프로젝트는 생성되었습니다.`,
          });

          // 프로젝트는 생성되었으므로 프로젝트 정보 반환
          return finalProject;
        }
      } catch (error) {
        console.error('Project submission error:', error);
        notification.error({
          message: '프로젝트 등록 실패',
          description: error.message || '프로젝트 등록 중 오류가 발생했습니다.',
        });
        return false;
      } finally {
        dispatch(setSubmitting(false));
        setProcessingStep('');
      }
    },
    [formData, dispatch],
  );

  /**
   * 태스크 데이터로 API 제출용 페이로드 생성
   *
   * @param {string|number} projectId - 프로젝트 ID
   * @param {string|number} bucketId - 버킷 ID
   * @param {Object} task - 태스크 데이터
   * @returns {Object} API 제출용 태스크 페이로드
   */
  const createTaskPayload = (projectId, bucketId, task) => {
    return {
      project: projectId,
      project_task_bucket: bucketId,
      name: task.name,
      position: task.position,
      priority_level: task.priority_level,
      task_progress: task.task_progress,
      task_schedule_type: task.task_schedule_type,
      // 일정 타입이 true인 경우 계획 시간 데이터 포함
      ...(task.task_schedule_type &&
        task.planning_time_data && {
          planning_time_data: task.planning_time_data,
        }),
      // 날짜 정보가 있는 경우 포함
      ...(task.plan_start_date && { plan_start_date: task.plan_start_date }),
      ...(task.plan_end_date && { plan_end_date: task.plan_end_date }),
      ...(task.due_date && { due_date: task.due_date }),
    };
  };

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
   * 프로젝트 업데이트 함수
   * @param {string|number} projectId - 프로젝트 ID
   * @param {Object} projectData - 업데이트할 프로젝트 데이터
   * @param {Array} projectBuckets - 버킷/태스크 데이터 (선택적)
   * @returns {Promise<Object|null>} 업데이트된 프로젝트 또는 null
   */
  const updateProjectData = useCallback(
    async (projectId, projectData, projectBuckets) => {
      try {
        dispatch(setSubmitting(true));
        setProgress(10);
        setProcessingStep('프로젝트 업데이트 중');

        // 1. 데이터 분리 및 전처리
        const baseFormData = projectData || formData;

        // 2. 데이터 전처리 (빈 값 제거)
        const cleanBaseFormData = prepareCleanData(baseFormData);
        const cleanProjectBuckets =
          projectBuckets && projectBuckets.length > 0
            ? JSON.parse(JSON.stringify(projectBuckets))
            : [];

        setProgress(20);

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(cleanBaseFormData);
        const snakeCaseProjectBuckets =
          cleanProjectBuckets.length > 0
            ? convertKeysToSnakeCase(cleanProjectBuckets)
            : [];

        setProgress(30);

        // 전체 제출 데이터 통합
        const submitData = {
          ...snakeCaseBaseForm,
        };

        // 칸반 보드 데이터가 있으면 포함
        if (snakeCaseProjectBuckets.length > 0) {
          submitData.structure = snakeCaseProjectBuckets;
        }

        setProgress(40);

        // 4. API 제출
        const resultAction = await dispatch(
          updateProject({
            projectId,
            data: submitData,
          }),
        );

        setProgress(100);
        setProcessingStep('');

        return updateProject.fulfilled.match(resultAction)
          ? resultAction.payload
          : null;
      } catch (error) {
        console.error('Project update error:', error);
        notification.error({
          message: '프로젝트 수정 실패',
          description: error.message || '프로젝트 수정 중 오류가 발생했습니다.',
        });
        return null;
      } finally {
        dispatch(setSubmitting(false));
        setProgress(0);
        setProcessingStep('');
      }
    },
    [formData, dispatch, prepareCleanData],
  );

  return {
    isSubmitting,
    progress,
    processingStep,
    currentBucketIndex,
    handleFormSubmit,
    updateProjectData,
    prepareCleanData,
  };
};

export default useProjectSubmit;
