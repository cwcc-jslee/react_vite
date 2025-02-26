// src/features/customer/hooks/useFormValidation.js
/**
 * 폼 유효성 검사를 위한 훅
 * 입력 필드의 유효성 검사 규칙을 정의하고 검증 결과를 반환
 */
import { useState, useCallback } from 'react';
import { isValidBusinessNumber } from '../../../shared/services/businessNumberUtils';

/**
 * 폼 유효성 검사를 위한 커스텀 훅
 * @param {Object} initialErrors - 초기 오류 상태
 * @returns {Object} 유효성 검사 관련 메서드 및 상태
 */
export const useFormValidation = (initialErrors = {}) => {
  // 유효성 검사 오류 메시지 상태 관리
  const [validationErrors, setValidationErrors] = useState(initialErrors);

  /**
   * 유효성 검사 오류 메시지 초기화
   */
  const clearErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  /**
   * 특정 필드의 오류 설정
   * @param {string} field - 필드명
   * @param {string} message - 오류 메시지
   */
  const setFieldError = useCallback((field, message) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * 특정 필드의 유효성 검사 수행
   * @param {string} field - 필드명
   * @param {*} value - 필드 값
   * @param {Object} rules - 검사 규칙
   * @returns {boolean} 유효성 검사 통과 여부
   */
  const validateField = useCallback(
    (field, value, rules = {}) => {
      // 필수 필드 검사
      if (
        rules.required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        setFieldError(field, rules.requiredMessage || '필수 입력 항목입니다.');
        return false;
      }

      // 최소 길이 검사
      if (field === 'name' && value) {
        const trimmedValue = value.trim();
        if (trimmedValue.length < 3) {
          setFieldError(field, '고객명은 최소 3자 이상 입력해야 합니다.');
          return false;
        }
      }

      // 사업자 번호 검사 (000-00-00000 형식)
      if (field === 'businessNumber' && value) {
        const regex = /^\d{3}-\d{2}-\d{5}$/;
        if (!regex.test(value)) {
          setFieldError(
            field,
            '올바른 사업자 번호 형식이 아닙니다. (000-00-00000)',
          );
          return false;
        }
      }

      // URL 형식 검사
      if (field === 'homepage' && value) {
        try {
          new URL(value);
        } catch (e) {
          setFieldError(field, '올바른 URL 형식이 아닙니다.');
          return false;
        }
      }

      // 해당 필드의 오류가 있으면 제거
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      return true;
    },
    [validationErrors, setFieldError],
  );

  /**
   * 전체 폼 데이터 유효성 검사 (하이브리드 방식)
   * 검증 결과를 즉시 반환하면서도 UI 업데이트를 위한 상태도 설정
   * @param {Object} formData - 폼 데이터
   * @param {Object} validationRules - 각 필드별 유효성 검사 규칙
   * @returns {boolean} 유효성 검사 통과 여부
   */
  const validateForm = (formData, validationRules = {}) => {
    // 새로운 오류 객체 생성
    const errors = {};
    let isValid = true;

    // 고객명 필수 검사 및 최소 길이 검사
    if (!formData.name || formData.name.trim() === '') {
      errors.name = '고객명은 필수 입력 항목입니다.';
      isValid = false;
    } else {
      const trimmedName = formData.name.trim();
      if (trimmedName.length < 3) {
        errors.name = '고객명은 최소 3자 이상 입력해야 합니다.';
        isValid = false;
      }
    }

    // 기업분류 필수 검사
    if (!formData.coClassification) {
      errors.coClassification = '기업분류는 필수 선택 항목입니다.';
      isValid = false;
    }

    // 사업자번호 형식 검사 (입력된 경우에만)
    if (
      formData.businessNumber &&
      !isValidBusinessNumber(formData.businessNumber)
    ) {
      errors.businessNumber =
        '올바른 사업자 번호 형식이 아닙니다. (10자리 숫자)';
      isValid = false;
    }

    // 홈페이지 URL 형식 검사 (입력된 경우)
    if (formData.homepage) {
      try {
        new URL(formData.homepage);
      } catch (e) {
        errors.homepage = '올바른 URL 형식이 아닙니다.';
        isValid = false;
      }
    }

    // 추가적인 유효성 검사 규칙 적용
    Object.entries(validationRules).forEach(([field, rules]) => {
      // 이미 해당 필드에 오류가 있으면 건너뜀
      if (errors[field]) return;

      // 필수 필드 검사
      if (
        rules.required &&
        (!formData[field] ||
          (typeof formData[field] === 'string' &&
            formData[field].trim() === ''))
      ) {
        errors[field] = rules.requiredMessage || '필수 입력 항목입니다.';
        isValid = false;
        return;
      }

      // 추가 필드별 검증 로직
      if (field === 'name' && formData[field]) {
        const trimmedValue = formData[field].trim();
        if (trimmedValue.length < 3) {
          errors[field] = '고객명은 최소 3자 이상 입력해야 합니다.';
          isValid = false;
          return;
        }
      }
    });

    // UI 업데이트를 위한 상태 설정
    setValidationErrors(errors);

    // 검증 결과와 오류 정보 즉시 반환
    return {
      isValid,
      errors,
    };
  };

  return {
    validationErrors,
    validateForm,
    validateField,
    clearErrors,
    setValidationErrors,
    setFieldError,
  };
};

export default useFormValidation;
