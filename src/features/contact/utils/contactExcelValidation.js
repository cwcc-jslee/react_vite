// src/features/contact/utils/contactExcelValidation.js
/**
 * 담당자 Excel 데이터 유효성 검사 유틸리티
 * Excel에서 업로드된 담당자 데이터의 유효성을 검증하는 함수 제공
 */

/**
 * 이메일 형식 검증
 * @param {string} email - 검사할 이메일 주소
 * @returns {boolean} 유효한 이메일인지 여부
 */
export const isValidEmail = (email) => {
  if (!email) return true; // 빈 값은 허용 (필수 아님)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 전화번호 형식 검증
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 유효한 전화번호인지 여부
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // 빈 값은 허용 (필수 아님)

  // 숫자, -, 공백만 허용하는 정규식
  const phoneRegex = /^[\d\s-]+$/;
  return phoneRegex.test(phone);
};

/**
 * Excel에서 업로드한 담당자 데이터 유효성 검사
 * @param {Array} contactsData - 검증할 담당자 데이터 배열
 * @returns {Object} { valid: boolean, errors: Array } - 유효성 결과와 오류 메시지
 */
export const validateExcelData = (contactsData) => {
  const errors = [];

  // 데이터가 없는 경우
  if (!contactsData || contactsData.length === 0) {
    return {
      valid: false,
      errors: [{ rowNumber: '전체', message: '등록할 데이터가 없습니다.' }],
    };
  }

  // 각 행 데이터 검증
  contactsData.forEach((contact) => {
    const rowNum = contact._rowIndex || '알 수 없음';

    // 1. 필수 필드 검증
    if (!contact.lastName || !contact.lastName.trim()) {
      errors.push({
        rowNumber: rowNum,
        message: '성(lastName)은 필수 입력 항목입니다.',
      });
    }

    if (!contact.firstName || !contact.firstName.trim()) {
      errors.push({
        rowNumber: rowNum,
        message: '이름(firstName)은 필수 입력 항목입니다.',
      });
    }

    // 2. 이메일 형식 검증
    if (contact.email && !isValidEmail(contact.email)) {
      errors.push({
        rowNumber: rowNum,
        message: `유효한 이메일 형식이 아닙니다: ${contact.email}`,
      });
    }

    // 3. 전화번호 형식 검증
    if (contact.phone && !isValidPhone(contact.phone)) {
      errors.push({
        rowNumber: rowNum,
        message: `유효한 전화번호 형식이 아닙니다: ${contact.phone}`,
      });
    }

    // 4. 휴대폰 번호 형식 검증
    if (contact.mobile && !isValidPhone(contact.mobile)) {
      errors.push({
        rowNumber: rowNum,
        message: `유효한 휴대폰 번호 형식이 아닙니다: ${contact.mobile}`,
      });
    }

    // 추가 검증 로직은 필요에 따라 구현
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Excel 데이터 중복 검사
 * @param {Array} contactsData - 검사할 담당자 데이터 배열
 * @returns {Object} { hasDuplicates: boolean, duplicates: Array } - 중복 여부와 중복 항목
 */
export const checkDuplicates = (contactsData) => {
  const duplicates = [];
  const seen = new Map();

  contactsData.forEach((contact, index) => {
    // 이메일을 기준으로 중복 검사 (필요에 따라 다른 필드 조합도 가능)
    if (contact.email) {
      const key = contact.email.toLowerCase();

      if (seen.has(key)) {
        duplicates.push({
          rowNumber: contact._rowIndex,
          field: 'email',
          value: contact.email,
          duplicateWith: seen.get(key),
        });
      } else {
        seen.set(key, contact._rowIndex);
      }
    }
  });

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
};

export default {
  validateExcelData,
  checkDuplicates,
  isValidEmail,
  isValidPhone,
};
