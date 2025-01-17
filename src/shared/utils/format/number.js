// src/shared/utils/format/number.js
// 숫자 입력 처리를 위한 함수이며 정수만 허용용
export const ensureNumericAmount = (value) => {
  const numberOnly = value.replace(/[^\d]/g, '');
  return numberOnly === '' || !isNaN(numberOnly) ? numberOnly : '';
};

/**
 * 화면 표시를 위한 숫자 포맷팅
 * @param {number|string} value - 포맷할 숫자 값
 * @returns {string} 포맷된 문자열
 * @example
 * formatDisplayNumber(1000) // "1,000"
 * formatDisplayNumber("1000000") // "1,000,000"
 * formatDisplayNumber() // ""
 * formatDisplayNumber(null) // ""
 */
export const formatDisplayNumber = (value) => {
  if (!value) return '';
  return Number(value).toLocaleString();
};
