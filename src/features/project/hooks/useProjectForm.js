// src/features/project/hooks/useProjectForm.js
/**
 * 프로젝트 폼 관리를 위한 커스텀 훅
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
} from '../../../store/slices/projectSlice';
import { createProject } from '../../../store/slices/projectSlice';

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

  const initializeForm = useCallback(
    ({ data = {}, mode = 'create', id = null }) => {
      dispatch(initForm({ data, mode, id }));
      setFormProgress(0);
    },
    [dispatch],
  );

  const resetFormState = useCallback(() => {
    dispatch(resetForm());
    setFormProgress(0);
  }, [dispatch]);

  const createForm = useCallback(
    (initialData = {}) => {
      initializeForm({ data: initialData, mode: 'create' });
    },
    [initializeForm],
  );

  const updateField = useCallback(
    (nameOrEvent, valueOrNothing) => {
      let name, value;
      if (typeof nameOrEvent === 'string') {
        name = nameOrEvent;
        value = valueOrNothing;
      } else if (nameOrEvent && nameOrEvent.target) {
        name = nameOrEvent.target.name;
        value = nameOrEvent.target.value;
      } else {
        return;
      }
      dispatch(updateFormField({ name, value }));
      setFormProgress((prev) => Math.min(prev + 5, 90));
    },
    [dispatch],
  );

  const updateFields = useCallback(
    (fieldsData) => {
      dispatch(updateFormFields(fieldsData));
    },
    [dispatch],
  );

  // 필수 필드 입력 완료 여부 확인 (1단계 기준)
  const checkRequiredFields = useCallback(() => {
    // 1단계 공통 필수 필드
    const baseRequiredFields = [
      'projectType',
      'workType',
      'name',
      'customer',
      'service',
      'team',
      'fy',
    ];

    // 1. 공통 필수 필드 체크
    const isBaseValid = baseRequiredFields.every((field) => {
      const value = formData[field];
      if (!value) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });

    if (!isBaseValid) return false;

    // 2. 조건부 필수 필드 (매출 유형일 때 SFA 필수)
    if (formData.projectType === 'revenue') {
      if (!formData.sfa || formData.sfa === '') return false;
    }

    // 3. 프로젝트명 길이 체크 (최소 3자)
    if (!formData.name || formData.name.trim().length < 3) return false;

    return true;
  }, [formData]);

  const isRequiredFieldsFilled = checkRequiredFields();

  const getProgressColor = useCallback(() => {
    return formProgress < 30 ? 'bg-red-500' : formProgress < 70 ? 'bg-amber-500' : 'bg-green-500';
  }, [formProgress]);

  return {
    formData,
    formErrors,
    isSubmitting,
    formMode,
    isFormValid,
    editingId,
    isDirty,
    formProgress,
    isRequiredFieldsFilled,
    createForm,
    resetForm: resetFormState,
    updateField,
    updateFields,
    getProgressColor,
  };
};

export default useProjectForm;