// src/features/contact/hooks/useFormValidation.js
/**
 * Contact 폼 데이터 유효성 검사 모듈
 * 담당자 정보의 유효성을 검증하는 기능을 제공
 */

/**
 * 이메일 형식 검증
 * @param {string} email - 검사할 이메일 주소
 * @returns {boolean} 유효한 이메일인지 여부
 */
const isValidEmail = (email) => {
  if (!email) return true; // 빈 값은 허용 (필수 아님)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 전화번호 형식 검증
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 유효한 전화번호인지 여부
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // 빈 값은 허용 (필수 아님)

  // 숫자, -, 공백만 허용하는 정규식
  const phoneRegex = /^[\d\s-]+$/;
  return phoneRegex.test(phone);
};

/**
 * Contact 폼 데이터 전체 유효성 검사
 * @param {Object} formData - 검사할 폼 데이터
 * @returns {Object} { isValid, errors } - 유효성 결과와 오류 메시지
 */
export const validateContactForm = (formData) => {
  const errors = {};
  let isValid = true;

  // 필수 필드 검증
  if (!formData.lastName?.trim()) {
    errors.lastName = '성을 입력해주세요';
    isValid = false;
  }

  if (!formData.firstName?.trim()) {
    errors.firstName = '이름을 입력해주세요';
    isValid = false;
  }

  // 이메일 형식 검증
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = '유효한 이메일 형식이 아닙니다';
    isValid = false;
  }

  // 전화번호 형식 검증
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = '유효한 전화번호 형식이 아닙니다';
    isValid = false;
  }

  if (formData.mobile && !isValidPhone(formData.mobile)) {
    errors.mobile = '유효한 전화번호 형식이 아닙니다';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * 개별 필드 유효성 검사
 * @param {string} fieldName - 필드 이름
 * @param {*} value - 필드 값
 * @returns {string|null} 오류 메시지 또는 null
 */
export const validateField = (fieldName, value) => {
  switch (fieldName) {
    case 'lastName':
      return !value?.trim() ? '성을 입력해주세요' : null;

    case 'firstName':
      return !value?.trim() ? '이름을 입력해주세요' : null;

    case 'email':
      return value && !isValidEmail(value)
        ? '유효한 이메일 형식이 아닙니다'
        : null;

    case 'phone':
      return value && !isValidPhone(value)
        ? '유효한 전화번호 형식이 아닙니다'
        : null;

    case 'mobile':
      return value && !isValidPhone(value)
        ? '유효한 전화번호 형식이 아닙니다'
        : null;

    default:
      return null;
  }
};

export default {
  validateContactForm,
  validateField,
  isValidEmail,
  isValidPhone,
};
