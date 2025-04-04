// src/features/project/hooks/useProjectForm.js
/**
 * 프로젝트 폼 관리를 위한 커스텀 훅
 * pageFormSlice를 사용하여 프로젝트 폼 상태를 관리합니다.
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initForm,
  resetForm,
  updateFormField,
  updateFormFields,
  setFormErrors,
  clearFormErrors,
  setFormMode,
  setEditingId,
  prepareFormData,
  submitFormStart,
  submitFormSuccess,
  submitFormFailure,
  selectFormData,
  selectFormErrors,
  selectFormSubmitting,
  selectFormMode,
  selectFormValidity,
  selectEditingId,
  selectFormDirty,
} from '../../../store/slices/pageFormSlice';
import {
  createProject,
  updateProject,
  PROJECT_PAGE_TYPE,
} from '../store/projectPageActions';

/**
 * 프로젝트 폼 관리를 위한 커스텀 훅
 * 폼 상태 관리, 유효성 검사, 제출 처리 등 기능 제공
 */
export const useProjectForm = () => {
  const dispatch = useDispatch();

  // 폼 상태 선택자
  const formData = useSelector(selectFormData);
  const formErrors = useSelector(selectFormErrors);
  const isSubmitting = useSelector(selectFormSubmitting);
  const formMode = useSelector(selectFormMode);
  const isFormValid = useSelector(selectFormValidity);
  const editingId = useSelector(selectEditingId);
  const isDirty = useSelector(selectFormDirty);

  // 페이지 타입 설정 (컴포넌트 마운트 시 호출)
  useEffect(() => {
    dispatch(setCurrentPath(PROJECT_PAGE_TYPE));

    // 언마운트 시 정리
    return () => {
      // 필요한 정리 작업 수행
    };
  }, [dispatch]);

  // 폼 초기화 (새 프로젝트 생성)
  const initCreateForm = useCallback(
    (initialData = {}) => {
      dispatch(
        initForm({
          data: initialData,
          mode: 'create',
          id: null,
        }),
      );
    },
    [dispatch],
  );

  // 폼 초기화 (기존 프로젝트 수정)
  const initEditForm = useCallback(
    (project) => {
      if (!project) return;

      dispatch(
        initForm({
          data: project,
          mode: 'edit',
          id: project.id,
        }),
      );

      dispatch(setFormMode('edit'));
      dispatch(setEditingId(project.id));
    },
    [dispatch],
  );

  // 폼 초기화 (모드에 따라 다르게 처리)
  const initProjectForm = useCallback(
    (project = null) => {
      if (project && project.id) {
        initEditForm(project);
      } else {
        initCreateForm(project || {});
      }
    },
    [initCreateForm, initEditForm],
  );

  // 폼 리셋
  const resetProjectForm = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  // 필드 값 변경 처리
  const updateField = useCallback(
    (name, value) => {
      dispatch(updateFormField({ name, value }));
    },
    [dispatch],
  );

  // 여러 필드 값 일괄 변경
  const updateFields = useCallback(
    (fieldsData) => {
      dispatch(updateFormFields(fieldsData));
    },
    [dispatch],
  );

  // 에러 설정
  const setErrors = useCallback(
    (errors) => {
      dispatch(setFormErrors(errors));
    },
    [dispatch],
  );

  // 에러 초기화
  const clearErrors = useCallback(() => {
    dispatch(clearFormErrors());
  }, [dispatch]);

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    // 필수 필드 검사
    if (!formData.name) {
      errors.name = '프로젝트명을 입력하세요';
      isValid = false;
    }

    if (!formData.customerId) {
      errors.customerId = '고객사를 선택하세요';
      isValid = false;
    }

    if (!formData.startDate) {
      errors.startDate = '시작일을 선택하세요';
      isValid = false;
    }

    if (!formData.status) {
      errors.status = '상태를 선택하세요';
      isValid = false;
    }

    // 에러 상태 업데이트
    if (!isValid) {
      dispatch(setFormErrors(errors));
    }

    return isValid;
  }, [dispatch, formData]);

  // 프로젝트 생성 처리
  const handleCreateProject = useCallback(async () => {
    if (!validateForm()) return false;

    dispatch(submitFormStart());

    try {
      // 폼 데이터 전처리
      const preparedData = prepareFormData(formData);

      // 프로젝트 생성 액션 디스패치
      const resultAction = await dispatch(createProject(preparedData));

      if (createProject.fulfilled.match(resultAction)) {
        dispatch(submitFormSuccess());
        return true;
      } else {
        // 서버 에러 처리
        const errorData = resultAction.payload || {
          global: '프로젝트 생성 실패',
        };
        dispatch(submitFormFailure(errorData));
        return false;
      }
    } catch (error) {
      // 예외 처리
      dispatch(
        submitFormFailure({
          global: error.message || '프로젝트 생성 중 오류가 발생했습니다',
        }),
      );
      return false;
    }
  }, [dispatch, formData, validateForm]);

  // 프로젝트 수정 처리
  const handleUpdateProject = useCallback(async () => {
    if (!validateForm() || !editingId) return false;

    dispatch(submitFormStart());

    try {
      // 폼 데이터 전처리
      const preparedData = prepareFormData(formData);

      // 프로젝트 수정 액션 디스패치
      const resultAction = await dispatch(
        updateProject({
          itemId: editingId,
          data: preparedData,
        }),
      );

      if (updateProject.fulfilled.match(resultAction)) {
        dispatch(submitFormSuccess());
        return true;
      } else {
        // 서버 에러 처리
        const errorData = resultAction.payload || {
          global: '프로젝트 수정 실패',
        };
        dispatch(submitFormFailure(errorData));
        return false;
      }
    } catch (error) {
      // 예외 처리
      dispatch(
        submitFormFailure({
          global: error.message || '프로젝트 수정 중 오류가 발생했습니다',
        }),
      );
      return false;
    }
  }, [dispatch, formData, validateForm, editingId]);

  // 폼 제출 처리 (생성 또는 수정)
  const handleSubmit = useCallback(async () => {
    if (formMode === 'edit') {
      return handleUpdateProject();
    } else {
      return handleCreateProject();
    }
  }, [formMode, handleCreateProject, handleUpdateProject]);

  return {
    // 상태
    formData,
    formErrors,
    isSubmitting,
    formMode,
    isFormValid,
    editingId,
    isDirty,

    // 액션 메서드
    initProjectForm,
    initCreateForm,
    initEditForm,
    resetProjectForm,
    updateField,
    updateFields,
    setErrors,
    clearErrors,
    validateForm,
    handleCreateProject,
    handleUpdateProject,
    handleSubmit,
  };
};

export default useProjectForm;
