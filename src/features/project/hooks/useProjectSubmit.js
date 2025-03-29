// src/features/project/hooks/useProjectSubmit.js
/**
 * 프로젝트 폼 제출 관련 로직을 관리하는 커스텀 훅
 * 모든 제출 과정을 단계별로 처리하여 명확한 흐름을 제공합니다.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProject,
  updateProject,
  setFormErrors,
} from '../store/projectSlice';
import { notification } from '../../../shared/services/notification';
import {
  validateProjectForm,
  validateProjectTaskForm,
} from '../utils/validateProjectForm';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';

/**
 * 프로젝트 제출 관련 기능을 제공하는 커스텀 훅
 * processSubmit과 handleFormSubmit을 통합하여 제공
 *
 * @returns {Object} 프로젝트 제출 관련 함수 및 상태
 */
export const useProjectSubmit = () => {
  const dispatch = useDispatch();
  const { data: formData, isSubmitting } = useSelector(
    (state) => state.project.form,
  );

  /**
   * 프로젝트 폼 제출 처리 함수 (통합 버전)
   * 기존의 processSubmit과 handleFormSubmit의 기능을 통합
   *
   * 처리 단계:
   * 1. 유효성 검사
   * 2. 데이터 분리 (기본폼, 칸반 데이터)
   * 3. 데이터 전처리 (빈 값 제거 등)
   * 4. 키 정보 스네이크케이스로 변환
   * 5. API 제출 (기본폼 + 칸반폼)
   *
   * @param {Event} e - 이벤트 객체 (선택적)
   * @param {Array} projectBuckets - 칸반 보드 데이터
   * @returns {Promise<Object|boolean>} 제출 결과 또는 성공 여부
   */
  const handleFormSubmit = useCallback(
    async (e, projectBuckets) => {
      if (e && e.preventDefault) e.preventDefault();

      // 1. 기본 폼 유효성 검사
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

      // 칸반 보드 데이터가 있는 경우 유효성 검사
      if (projectBuckets && projectBuckets.length > 0) {
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
        // 2. 데이터 분리
        const baseFormData = { ...formData };

        // 3. 데이터 전처리 (빈 값 제거)
        const cleanBaseFormData = prepareCleanData(baseFormData);
        const cleanProjectBuckets = projectBuckets
          ? JSON.parse(JSON.stringify(projectBuckets))
          : null;

        // 4. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(cleanBaseFormData);
        const snakeCaseProjectBuckets = cleanProjectBuckets
          ? convertKeysToSnakeCase(cleanProjectBuckets)
          : null;

        // 전체 제출 데이터 통합
        const submitData = {
          ...snakeCaseBaseForm,
        };

        // 칸반 보드 데이터가 있으면 포함
        if (snakeCaseProjectBuckets) {
          submitData.structure = snakeCaseProjectBuckets;
        }

        // 5. API 제출
        const resultAction = await dispatch(createProject(submitData));

        // 성공 시
        if (createProject.fulfilled.match(resultAction)) {
          notification.success({
            message: '프로젝트 등록 성공',
            description: '프로젝트가 성공적으로 등록되었습니다.',
          });
          return resultAction.payload;
        }

        return false;
      } catch (error) {
        console.error('Project submission error:', error);
        notification.error({
          message: '프로젝트 등록 실패',
          description: error.message || '프로젝트 등록 중 오류가 발생했습니다.',
        });
        return false;
      }
    },
    [formData, dispatch],
  );

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
   * @param {Array} projectBuckets - 칸반 보드 데이터 (선택적)
   */
  const updateProjectData = useCallback(
    async (projectId, projectData, projectBuckets) => {
      try {
        // 1. 데이터 분리 및 전처리
        const baseFormData = projectData || formData;

        // 2. 데이터 전처리 (빈 값 제거)
        const cleanBaseFormData = prepareCleanData(baseFormData);
        const cleanProjectBuckets = projectBuckets
          ? JSON.parse(JSON.stringify(projectBuckets))
          : null;

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseBaseForm = convertKeysToSnakeCase(cleanBaseFormData);
        const snakeCaseProjectBuckets = cleanProjectBuckets
          ? convertKeysToSnakeCase(cleanProjectBuckets)
          : null;

        // 전체 제출 데이터 통합
        const submitData = {
          ...snakeCaseBaseForm,
        };

        // 칸반 보드 데이터가 있으면 포함
        if (snakeCaseProjectBuckets) {
          submitData.structure = snakeCaseProjectBuckets;
        }

        // 4. API 제출
        const resultAction = await dispatch(
          updateProject({
            projectId,
            data: submitData,
          }),
        );

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
      }
    },
    [formData, dispatch, prepareCleanData],
  );

  return {
    isSubmitting,
    handleFormSubmit,
    updateProjectData,
    prepareCleanData,
  };
};

export default useProjectSubmit;
