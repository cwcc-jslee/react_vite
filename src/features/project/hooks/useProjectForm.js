// src/features/project/hooks/useProjectForm.js
/**
 * 프로젝트 폼 관리를 위한 커스텀 훅
 *
 * 주요 역할:
 * 1. 프로젝트 폼 상태 관리 (데이터, 에러, 유효성)
 * 2. 폼 필드 값 변경 및 유효성 검사
 * 3. 폼 제출 처리 (생성/수정)
 * 4. 폼 초기화 및 리셋
 * 5. 폼 진행 상태 관리
 *
 * 사용 예시:
 * - 프로젝트 생성 폼
 * - 프로젝트 수정 폼
 * - 프로젝트 상세 정보 입력
 */

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initForm,
  updateFormField,
  updateFormFields,
  resetForm,
  setFormErrors,
  clearFormErrors,
  setFormSubmitting,
  setFormIsValid,
  setFormMode,
  setEditingId,
} from '../../../store/slices/projectSlice';
import { createProject } from '../../../store/slices/projectSlice';

/**
 * 프로젝트 폼 관리를 위한 커스텀 훅
 * 폼 상태 관리, 유효성 검사, 제출 처리 등 기능 제공
 */
export const useProjectForm = () => {
  const dispatch = useDispatch();
  const [formProgress, setFormProgress] = useState(0);

  // 폼 상태 선택자
  const formData = useSelector((state) => state.project.form.data);
  const formErrors = useSelector((state) => state.project.form.errors);
  const isSubmitting = useSelector((state) => state.project.form.isSubmitting);
  const formMode = useSelector((state) => state.project.form.mode);
  const isFormValid = useSelector((state) => state.project.form.isValid);
  const editingId = useSelector((state) => state.project.form.editingId);
  const isDirty = useSelector((state) => state.project.form.isDirty);

  // 핵심 폼 초기화 함수 (저수준 API)
  const initializeForm = useCallback(
    ({ data = {}, mode = 'create', id = null }) => {
      dispatch(
        initForm({
          data,
          mode,
          id,
        }),
      );
      setFormProgress(0);
    },
    [dispatch],
  );

  // 폼 리셋 함수
  const resetFormState = useCallback(() => {
    dispatch(resetForm());
    setFormProgress(0);
  }, [dispatch]);

  // 편의 메서드들 (고수준 API)
  const createForm = useCallback(
    (initialData = {}) => {
      initializeForm({ data: initialData, mode: 'create' });
    },
    [initializeForm],
  );

  const editForm = useCallback(
    (project) => {
      if (!project?.id) return;
      initializeForm({
        data: project,
        mode: 'edit',
        id: project.id,
      });
    },
    [initializeForm],
  );

  // 폼 필드 변경 핸들러
  const updateField = useCallback(
    (nameOrEvent, valueOrNothing) => {
      let name, value;

      // 이벤트 객체인 경우 처리
      if (typeof nameOrEvent === 'string') {
        name = nameOrEvent;
        value = valueOrNothing;
      } else if (nameOrEvent && nameOrEvent.target) {
        name = nameOrEvent.target.name;
        value = nameOrEvent.target.value;
      } else {
        console.warn('Invalid arguments passed to updateField');
        return;
      }

      // Redux action dispatch
      dispatch(updateFormField({ name, value }));

      // 필드 변경 시 폼 진행률 업데이트
      setFormProgress((prev) => {
        const increment = prev < 40 ? 5 : prev < 70 ? 3 : 2;
        return Math.min(prev + increment, 90); // 제출하기 전까지 최대 90%
      });
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

    if (!formData.customer) {
      errors.customer = '고객사를 선택하세요';
      isValid = false;
    }

    if (!formData.sfa && formData.projectType === 'revenue') {
      errors.sfa = 'SFA를 선택하세요';
      isValid = false;
    }

    if (!formData.planStartDate) {
      errors.planStartDate = '계획 시작일을 선택하세요';
      isValid = false;
    }

    if (!formData.planEndDate) {
      errors.planEndDate = '계획 종료일을 선택하세요';
      isValid = false;
    }

    if (!formData.service) {
      errors.service = '서비스를 선택하세요';
      isValid = false;
    }

    if (!formData.team) {
      errors.team = '사업부를 선택하세요';
      isValid = false;
    }

    if (!formData.fy) {
      errors.fy = '사업년도를 선택하세요';
      isValid = false;
    }

    // 에러 상태 업데이트
    if (!isValid) {
      dispatch(setFormErrors(errors));
    } else {
      dispatch(clearFormErrors());
    }

    dispatch(setFormIsValid(isValid));
    return isValid;
  }, [dispatch, formData]);

  // 프로젝트 생성 처리
  const handleCreateProject = useCallback(async () => {
    if (!validateForm()) return false;

    dispatch(setFormSubmitting(true));

    try {
      // 프로젝트 생성 액션 디스패치
      const resultAction = await dispatch(createProject(formData));

      if (createProject.fulfilled.match(resultAction)) {
        setFormProgress(100);
        return true;
      } else {
        // 서버 에러 처리
        const errorData = resultAction.payload || {
          global: '프로젝트 생성 실패',
        };
        dispatch(setFormErrors(errorData));
        return false;
      }
    } catch (error) {
      // 예외 처리
      dispatch(
        setFormErrors({
          global: error.message || '프로젝트 생성 중 오류가 발생했습니다',
        }),
      );
      return false;
    }
  }, [dispatch, formData, validateForm]);

  // 프로젝트 수정 처리
  // const handleUpdateProject = useCallback(async () => {
  //   if (!validateForm() || !editingId) return false;

  //   dispatch(submitFormStart());

  //   try {
  //     // 폼 데이터 전처리
  //     const preparedData = prepareFormData(formData);

  //     // 프로젝트 수정 액션 디스패치
  //     const resultAction = await dispatch(
  //       updateProject({
  //         itemId: editingId,
  //         data: preparedData,
  //       }),
  //     );

  //     if (updateProject.fulfilled.match(resultAction)) {
  //       dispatch(submitFormSuccess());
  //       return true;
  //     } else {
  //       // 서버 에러 처리
  //       const errorData = resultAction.payload || {
  //         global: '프로젝트 수정 실패',
  //       };
  //       dispatch(submitFormFailure(errorData));
  //       return false;
  //     }
  //   } catch (error) {
  //     // 예외 처리
  //     dispatch(
  //       submitFormFailure({
  //         global: error.message || '프로젝트 수정 중 오류가 발생했습니다',
  //       }),
  //     );
  //     return false;
  //   }
  // }, [dispatch, formData, validateForm, editingId]);

  // 폼 제출 처리 (생성 또는 수정)
  const handleSubmit = useCallback(async () => {
    if (formMode === 'edit') {
      // return handleUpdateProject();
    } else {
      return handleCreateProject();
    }
  }, [formMode, handleCreateProject]);

  // 진행 상태 색상 계산
  const getProgressColor = useCallback(() => {
    return formProgress < 30
      ? 'bg-red-500'
      : formProgress < 70
      ? 'bg-amber-500'
      : 'bg-green-500';
  }, [formProgress]);

  // 필수 필드 입력 완료 여부 확인
  const checkRequiredFields = useCallback(() => {
    const requiredFields = [
      'name',
      'customer',
      'planStartDate',
      'planEndDate',
      'service',
      'team',
      'fy',
    ];

    // 모든 필수 필드가 값을 가지고 있는지 확인
    return requiredFields.every((field) => {
      const value = formData[field];
      // 값이 존재하고, 문자열인 경우 공백이 아닌지 확인
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      // 객체나 다른 타입의 경우 null/undefined가 아닌지 확인
      return value != null;
    });
  }, [formData]);

  // 필수 필드 입력 완료 상태
  const isRequiredFieldsFilled = checkRequiredFields();

  return {
    // 상태
    formData,
    formErrors,
    isSubmitting,
    formMode,
    isFormValid,
    editingId,
    isDirty,
    formProgress,
    isRequiredFieldsFilled,

    // 액션 메서드
    initForm: initializeForm, // 저수준 API (이름 충돌 방지를 위해 별칭 사용)
    createForm, // 고수준 API
    editForm, // 고수준 API
    resetForm: resetFormState, // 이름 충돌 방지를 위해 별칭 사용
    updateField,
    updateFields,
    setErrors,
    clearErrors,
    validateForm,
    handleCreateProject,
    // handleUpdateProject,
    handleSubmit,
    getProgressColor,
  };
};

export default useProjectForm;
