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
  resetForm,
  resetBuckets,
} from '../store/projectSlice';
import { notification } from '../../../shared/services/notification';
import {
  validateProjectForm,
  validateProjectTaskForm,
} from '../utils/validateProjectForm';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
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
    (state) => state.pageForm,
  );
  const buckets = useSelector((state) => state.projectTask.buckets);
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
   * 7. 최종 프로젝트 데이터 조회 및 리덕스 상태 초기화
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

      // 최신 buckets 상태 확인
      const currentBuckets = projectBuckets || buckets;
      console.log('>>> Current buckets state:', currentBuckets);

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
      if (!currentBuckets || currentBuckets.length === 0) {
        // 버킷이 없을 경우 에러 처리
        notification.error({
          message: '버킷 등록 오류',
          description: '최소 1개 이상의 버킷이 필요합니다.',
        });
        return false;
      }

      // Task 유효성 검사
      const hasTasks = currentBuckets.some(
        (bucket) => bucket.tasks && bucket.tasks.length > 0,
      );
      if (!hasTasks) {
        notification.error({
          message: 'Task 등록 오류',
          description: '최소 1개 이상의 Task가 필요합니다.',
        });
        return false;
      }

      // 버킷별 Task 유효성 검사
      const emptyBuckets = currentBuckets.filter(
        (bucket) => !bucket.tasks || bucket.tasks.length === 0,
      );
      if (emptyBuckets.length > 0) {
        notification.error({
          message: 'Task 등록 오류',
          description: `'${emptyBuckets
            .map((b) => b.bucket)
            .join(', ')}' 버킷에 Task가 없습니다.`,
        });
        return false;
      }

      const { isValid: isTasksValid, errors: validationTasksErrors } =
        validateProjectTaskForm(currentBuckets);

      if (!isTasksValid) {
        const tasksError = Object.values(validationTasksErrors)[0];
        notification.error({
          message: 'TASK 등록 오류',
          description: tasksError,
        });
        return false;
      }

      try {
        setProgress(5);
        setProcessingStep('데이터 전처리');

        // 2. 데이터 전처리
        const cleanBaseFormData = prepareCleanData(formData);
        let cleanProjectBuckets =
          currentBuckets && currentBuckets.length > 0
            ? JSON.parse(JSON.stringify(currentBuckets))
            : [];

        // 프로젝트 기본 데이터의 관계 필드 처리 (users 등)
        const processedFormData = processRelationFields(cleanBaseFormData);

        // 버킷/태스크 데이터 전처리 (관계 필드 처리 및 데이터 형식 변환)
        cleanProjectBuckets = processProjectBuckets(cleanProjectBuckets);

        console.log(`>>> 전처리된 프로젝트 데이터:`, processedFormData);
        console.log(`>>> 전처리된 버킷 데이터:`, cleanProjectBuckets);

        setProgress(10);

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(processedFormData);
        const snakeCaseProjectBuckets =
          cleanProjectBuckets.length > 0
            ? convertKeysToSnakeCase(cleanProjectBuckets)
            : [];

        console.log(
          `>>> 관계 필드 및 스네이크케이스 변환 후 데이터:`,
          snakeCaseBaseForm,
        );

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
          // 폼과 버킷 상태 초기화
          dispatch(resetForm());
          dispatch(resetBuckets());

          notification.error({
            message: '버킷 정보 등록 실패',
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

            // 버킷 생성 API 호출 - async/await로 응답을 확실히 기다림
            console.log(`>>> 버킷 생성 요청 시작: "${bucket.bucket}"`);

            let bucketResponse;
            try {
              bucketResponse = await projectTaskService.createBucket(
                bucketPayload,
              );
              console.log(`>>> 버킷 생성 응답 수신:`, bucketResponse);
            } catch (error) {
              console.error(`>>> 버킷 생성 오류:`, error);
              throw new Error(
                `버킷 "${bucket.bucket}" 생성 중 오류 발생: ${
                  error.message || '알 수 없는 오류'
                }`,
              );
            }

            // 버킷 응답에서 bucketId 추출 확인
            let bucketId;
            if (bucketResponse && bucketResponse.id) {
              bucketId = bucketResponse.id;
            } else if (
              bucketResponse &&
              bucketResponse.data &&
              bucketResponse.data.id
            ) {
              // 응답 구조가 다른 경우 data.id에서 추출 시도
              bucketId = bucketResponse.data.id;
            } else {
              console.error(
                '버킷 생성 응답에서 ID를 찾을 수 없습니다:',
                bucketResponse,
              );
              throw new Error('버킷 ID를 찾을 수 없습니다.');
            }

            console.log(`>>> 생성된 버킷 ID: ${bucketId}`);

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
              // bucketId 확인 후 병렬 처리
              console.log(
                `>>>>>> 태스크 병렬 처리 시작 - 버킷 ID: ${bucketId}`,
              );
              if (!bucketId) {
                console.error('버킷 ID가 없어 태스크 생성을 건너뜁니다');
                continue; // 다음 버킷으로 이동
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
              // 순차 처리 (태스크가 적은 경우)
              const progressPerTask = progressPerBucket / (tasksCount || 1);

              for (let taskIndex = 0; taskIndex < tasksCount; taskIndex++) {
                const task = tasks[taskIndex];
                // bucketId가 유효한지 확인 후 태스크 페이로드 생성
                console.log(
                  `>>>>>> 태스크 생성 준비 - 사용 버킷 ID: ${bucketId}`,
                );
                if (!bucketId) {
                  console.error('버킷 ID가 없어 태스크 생성을 건너뜁니다', {
                    task,
                  });
                  continue; // 이 태스크를 건너뜀
                }

                const taskPayload = createTaskPayload(
                  projectId,
                  bucketId,
                  task,
                );
                console.log(`>>>>>> createTaskPayload : `, taskPayload);

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

          // 7. 최종 프로젝트 데이터 조회
          // strapi 5.x 버전부터 documentId로 쿼리 필요
          // const finalProjectData =
          //   await projectBucketService.getProjectWithStructure(projectId);
          // finalProject = finalProjectData;

          // 폼과 버킷 상태 초기화
          dispatch(resetForm());
          dispatch(resetBuckets());

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
    [formData, buckets, dispatch],
  );

  /**
   * 관계 필드를 처리하는 함수
   * 객체 배열을 ID 배열로 변환 (예: users배열)
   *
   * @param {Object} data - 처리할 데이터
   * @returns {Object} 관계 필드가 처리된 데이터
   */
  const processRelationFields = (data) => {
    // 깊은 복사로 원본 데이터 유지
    const processedData = JSON.parse(JSON.stringify(data));

    // templateId 삭제
    if ('templateId' in processedData) {
      delete processedData.templateId;
    }

    // users 필드 처리 - 객체 배열을 ID 배열로 변환 (선택적)
    if (
      processedData.users &&
      Array.isArray(processedData.users) &&
      processedData.users.length > 0
    ) {
      // 객체 배열 형태인지 확인 (첫 번째 항목이 객체이고 id 필드가 있는지)
      if (
        typeof processedData.users[0] === 'object' &&
        processedData.users[0].id !== undefined
      ) {
        console.log(
          '>>> users 필드를 ID 배열로 변환합니다:',
          processedData.users,
        );
        // id 필드만 추출하여 새 배열 생성
        processedData.users = processedData.users.map((user) => user.id);
        console.log('>>> 변환된 users 필드:', processedData.users);
      }
    }

    // 특정 키들의 id 값 추출
    const idExtractionKeys = [
      'importanceLevel',
      'fy',
      'pjtStatus',
      'service',
      'team',
    ];
    idExtractionKeys.forEach((key) => {
      if (
        processedData[key] &&
        typeof processedData[key] === 'object' &&
        processedData[key].id !== undefined
      ) {
        processedData[key] = processedData[key].id;
      }
    });

    return processedData;
  };

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

          // 2. task_schedule_type 변환 (boolean -> string)
          if (task.task_schedule_type !== undefined) {
            task.task_schedule_type =
              task.task_schedule_type === true ? 'scheduled' : 'ongoing';
          }

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
        let cleanProjectBuckets =
          projectBuckets && projectBuckets.length > 0
            ? JSON.parse(JSON.stringify(projectBuckets))
            : [];

        // 관계 필드 처리 (users 등)
        const processedFormData = processRelationFields(cleanBaseFormData);

        // 버킷/태스크 데이터 전처리
        cleanProjectBuckets = processProjectBuckets(cleanProjectBuckets);

        setProgress(20);

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(processedFormData);
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

        // 폼과 버킷 상태 초기화
        if (updateProject.fulfilled.match(resultAction)) {
          dispatch(resetForm());
          dispatch(resetBuckets());
        }

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
