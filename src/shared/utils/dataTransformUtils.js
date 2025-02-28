// src/shared/utils/dataTransformUtils.js
/**
 * 데이터 변환 관련 유틸리티 함수 모음
 * 애플리케이션 전체에서 공통으로 사용 가능한 변환 기능 제공
 */

/**
 * 빈 값 검사 (undefined, null, 빈 문자열)
 * @param {*} value - 검사할 값
 * @returns {boolean} 빈 값 여부
 */
export const isEmpty = (value) => {
  return value === undefined || value === null || value === '';
};

/**
 * 숫자 문자열을 숫자로 변환
 * 앞부분 공백 제거 및 빈 값 처리
 * @param {*} value - 변환할 값
 * @returns {number|string} 변환된 숫자 또는 빈 문자열
 */
export const parseNumber = (value) => {
  // 값이 없는 경우 빈 문자열 반환
  if (value === undefined || value === null) {
    return '';
  }

  // 문자열로 변환하고 앞부분 공백/스페이스 제거
  const trimmedValue = String(value).trimStart();

  // 변환 후 값이 없으면 빈 문자열 반환
  if (trimmedValue === '') {
    return '';
  }

  // 숫자로 변환
  const num = Number(trimmedValue);
  const result = isNaN(num) ? 0 : num;

  return result;
};

/**
 * 객체에서 빈 값을 가진 키를 제거
 * @param {Object} obj - 처리할 객체
 * @returns {Object} 빈 값이 제거된 새 객체
 */
export const removeEmptyFields = (obj) => {
  const result = { ...obj };

  Object.keys(result).forEach((key) => {
    const value = result[key];

    if (isEmpty(value) || (typeof value === 'string' && value.trim() === '')) {
      delete result[key];
    }
  });

  return result;
};

/**
 * 중첩된 객체에서도 빈 값을 가진 키를 제거
 * @param {Object} obj - 처리할 객체
 * @returns {Object} 빈 값이 제거된 새 객체
 */
export const removeEmptyFieldsDeep = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  // 배열인 경우
  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeEmptyFieldsDeep(item)) // 각 항목 재귀적으로 처리
      .filter((item) => {
        // 객체인 경우 모든 속성이 제거되었는지 확인
        if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
          return Object.keys(item).length > 0;
        }
        // 객체가 아닌 경우 비어있지 않은지 확인
        return !isEmpty(item);
      });
  }

  // 객체인 경우
  const result = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = removeEmptyFieldsDeep(obj[key]); // 중첩된 값 재귀적으로 처리

      // 중첩된 객체가 비어있지 않거나, 값이 비어있지 않은 경우만 포함
      if (
        (typeof value === 'object' &&
          value !== null &&
          Object.keys(value).length > 0) ||
        (Array.isArray(value) && value.length > 0) ||
        (!isEmpty(value) && !(typeof value === 'string' && value.trim() === ''))
      ) {
        result[key] = value;
      }
    }
  }

  return result;
};

/**
 * camelCase 키를 snake_case로 변환
 * @param {Object} obj - camelCase 키를 가진 객체
 * @returns {Object} snake_case 키를 가진 객체
 */
export const camelToSnakeCase = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeCase(item));
  }

  const result = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // camelCase를 snake_case로 변환
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // 값이 객체인 경우 재귀적으로 처리
      const value = obj[key];
      result[snakeKey] =
        typeof value === 'object' && value !== null
          ? camelToSnakeCase(value)
          : value;
    }
  }

  return result;
};

/**
 * snake_case 키를 camelCase로 변환
 * @param {Object} obj - snake_case 키를 가진 객체
 * @returns {Object} camelCase 키를 가진 객체
 */
export const snakeToCamelCase = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelCase(item));
  }

  const result = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // snake_case를 camelCase로 변환
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );

      // 값이 객체인 경우 재귀적으로 처리
      const value = obj[key];
      result[camelKey] =
        typeof value === 'object' && value !== null
          ? snakeToCamelCase(value)
          : value;
    }
  }

  return result;
};

export default {
  isEmpty,
  parseNumber,
  removeEmptyFields,
  removeEmptyFieldsDeep,
  camelToSnakeCase,
  snakeToCamelCase,
};
