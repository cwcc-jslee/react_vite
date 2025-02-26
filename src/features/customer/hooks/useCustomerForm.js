import { useState, useEffect, useCallback } from 'react';
import { initialFormState } from '../constants/initialFormState';
/**
 * Customer Form 관련 로직을 관리하는 Custom Hook
 */
export const useCustomerForm = () => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(initialFormState);
  // 에러 상태 관리
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Form Data Changed:', {
      previous: initialFormState,
      current: formData,
      changes: Object.keys(formData).reduce((diff, key) => {
        if (formData[key] !== initialFormState[key]) {
          diff[key] = {
            from: initialFormState[key],
            to: formData[key],
          };
        }
        return diff;
      }, {}),
    });
  }, [formData]);

  /**
   * 입력값 변경 핸들러
   * @param {Object} e - 이벤트 객체
   */
  const updateFormField = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 상태 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  /**
   * 폼 초기화 함수
   * 모든 필드를 초기 상태로 리셋
   */
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return {
    // 폼 상태관리
    formData,
    errors,
    updateFormField, // 기존 handleChange
    setFormData, //확인후 삭제
    setErrors,
    //
    isSubmitting,
    setIsSubmitting,
    //
    resetForm,
  };
};
