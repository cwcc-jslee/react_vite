// src/shared/utils/businessNumberUtils.js
/**
 * 사업자 번호 처리를 위한 유틸리티 함수 모음
 */

/**
 * 사업자 번호 형식 변환 (입력용: 하이픈 자동 추가)
 * @param {string} value - 입력된 사업자 번호 값
 * @returns {string} 하이픈이 추가된 형식의 사업자 번호
 */
export const formatBusinessNumber = (value) => {
  if (!value) return '';

  // 숫자와 하이픈만 남기고 모두 제거
  const numbers = value.replace(/[^\d-]/g, '');

  // 하이픈 제거
  const digitsOnly = numbers.replace(/-/g, '');

  // 길이에 따라 하이픈 추가
  if (digitsOnly.length <= 3) {
    return digitsOnly;
  } else if (digitsOnly.length <= 5) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  } else {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      5,
    )}-${digitsOnly.slice(5, 10)}`;
  }
};

/**
 * 사업자 번호 유효성 검사
 * @param {string} value - 검사할 사업자 번호
 * @returns {boolean} 유효한 사업자 번호 여부
 */
export const isValidBusinessNumber = (value) => {
  if (!value) return false;

  // 하이픈 포함 여부에 관계없이 검사
  const digitsOnly = value.replace(/-/g, '');

  // 사업자 번호는 10자리
  if (digitsOnly.length !== 10) return false;

  // 숫자로만 구성되어 있는지 검사
  if (!/^\d+$/.test(digitsOnly)) return false;

  // 국세청 사업자번호 유효성 검사 알고리즘
  // https://www.nts.go.kr/info/info_01_01.asp
  const checkID = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += checkID[i] * parseInt(digitsOnly.charAt(i));
  }

  sum += parseInt((parseInt(digitsOnly.charAt(8)) * 5) / 10);
  const lastDigit = (10 - (sum % 10)) % 10;

  return lastDigit === parseInt(digitsOnly.charAt(9));
};

/**
 * 사업자 번호 형식 변환 (표시용: 하이픈 추가)
 * @param {string} value - 저장된 사업자 번호 값 (숫자만)
 * @returns {string} 표시용 형식으로 변환된 사업자 번호
 */
export const displayBusinessNumber = (value) => {
  if (!value) return '';

  // 하이픈 제거하고 숫자만 남김
  const digitsOnly = value.replace(/-/g, '');

  // 10자리가 아니면 그대로 반환
  if (digitsOnly.length !== 10) return value;

  // 하이픈 추가하여 반환
  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
    3,
    5,
  )}-${digitsOnly.slice(5)}`;
};

/**
 * 사업자 번호 저장용 형식으로 변환 (하이픈 제거)
 * @param {string} value - 입력된 사업자 번호
 * @returns {string} 저장용 형식의 사업자 번호 (하이픈 제거)
 */
export const normalizeBusinessNumber = (value) => {
  if (!value) return '';
  return value.replace(/-/g, '');
};
