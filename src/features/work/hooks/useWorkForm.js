/**
 * 작업(Work) 폼 관리를 위한 커스텀 훅
 *
 * 주요 기능:
 * 1. 폼 상태 관리 (useWorkStore와 연동)
 * 2. 폼 필드 유효성 검사
 * 3. 폼 필드 업데이트 및 에러 처리
 * 4. 폼 제출 상태 관리
 *
 * 사용 예시:
 * const { form, errors, updateFormField, validateForm } = useWorkForm();
 */

import { useState, useCallback } from 'react';
import { useWorkStore } from './useWorkStore';
import { validateWorkForm } from '../utils/validateWorkForm';

export const useWorkForm = () => {
  const { form, updateFormField, processSubmit } = useWorkStore();
  const [errors, setErrors] = useState({});

  /**
   * 폼 필드 업데이트 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleUpdateFormField = useCallback(
    (e) => {
      const { name, value } = e.target;
      updateFormField({ target: { name, value } });
      // 필드 업데이트 시 해당 필드의 에러를 제거
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [updateFormField, errors],
  );

  /**
   * 폼 유효성 검사
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  const validateForm = useCallback(() => {
    const validationResult = validateWorkForm(form.data);
    setErrors(validationResult.errors);
    return validationResult;
  }, [form.data]);

  /**
   * 폼 제출 처리
   * @returns {Promise<void>}
   */
  const handleSubmit = useCallback(async () => {
    try {
      await processSubmit();
    } catch (error) {
      console.error('작업 등록 중 오류 발생:', error);
      throw error;
    }
  }, [processSubmit]);

  return {
    form,
    errors,
    updateFormField: handleUpdateFormField,
    validateForm,
    processSubmit: handleSubmit,
    setErrors,
  };
};
