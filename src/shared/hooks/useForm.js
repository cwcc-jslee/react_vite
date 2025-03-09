// /src/shared/hooks/useForm.js
import { useState, useEffect } from 'react';
import { notification } from '../services/notification';

export const useForm = (initialState) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(initialState);
  // 에러 상태 관리
  const [errors, setErrors] = useState({});

  // 개발 모드에서 폼 데이터 변경 로깅 (디버깅용)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Form Data Changed:', formData);
    }
  }, [formData]);

  /**
   * 입력값 변경 핸들러
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
   */
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateFormField,
    setFormData,
    setErrors,
    resetForm,
  };
};
