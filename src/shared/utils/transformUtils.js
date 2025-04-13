// src/shared/utils/transformUtils.js
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
 * 카멜케이스(camelCase)를 스네이크케이스(snake_case)로 변환하는 함수
 *
 * @param {string} str - 변환할 카멜케이스 문자열
 * @returns {string} 스네이크케이스로 변환된 문자열
 */
export const camelToSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * 스네이크케이스(snake_case)를 카멜케이스(camelCase)로 변환하는 함수
 *
 * @param {string} str - 변환할 스네이크케이스 문자열
 * @returns {string} 카멜케이스로 변환된 문자열
 */
export const snakeToCamelCase = (str) => {
  // 첫 글자가 _ 인 경우 특별 처리 (예: _private_field -> _privateField)
  if (str.startsWith('_')) {
    return (
      '_' +
      str
        .substring(1)
        .replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase())
    );
  }

  return str.replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());
};

/**
 * 객체의 모든 키를 카멜케이스에서 스네이크케이스로 재귀적으로 변환하는 함수
 *
 * @param {Object|Array} data - 변환할 객체 또는 배열
 * @returns {Object|Array} 키가 스네이크케이스로 변환된 객체 또는 배열
 */
export const convertKeysToCamelCase = (data) => {
  // 기본 타입 또는 null/undefined 처리
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToCamelCase(item));
  }

  // 특수 객체 타입 처리 (Date, RegExp 등)
  if (
    data instanceof Date ||
    data instanceof RegExp ||
    data instanceof Map ||
    data instanceof Set
  ) {
    return data;
  }

  // 일반 객체 처리
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const camelKey = snakeToCamelCase(key);
      const transformedValue = convertKeysToCamelCase(value);
      return [camelKey, transformedValue];
    }),
  );
};

/**
 * 객체의 모든 키를 카멜케이스에서 스네이크케이스로 재귀적으로 변환하는 함수
 *
 * @param {Object|Array} data - 변환할 객체 또는 배열
 * @returns {Object|Array} 키가 스네이크케이스로 변환된 객체 또는 배열
 */
export const convertKeysToSnakeCase = (data) => {
  // 기본 타입 또는 null/undefined 처리
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToSnakeCase(item));
  }

  // 특수 객체 타입 처리 (Date, RegExp 등)
  if (
    data instanceof Date ||
    data instanceof RegExp ||
    data instanceof Map ||
    data instanceof Set
  ) {
    return data;
  }

  // 일반 객체 처리
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const snakeKey = camelToSnakeCase(key);
      const transformedValue = convertKeysToSnakeCase(value);
      return [snakeKey, transformedValue];
    }),
  );
};

/**
 * 다중 선택 데이터를 JSON 형태로 변환
 * @param {Array} items - 변환할 항목 배열
 * @returns {string} JSON 문자열
 */
export const transformMultiSelect = (items) => {
  if (!items || !Array.isArray(items)) {
    return JSON.stringify([]);
  }

  // 입력값 로깅 (개발 모드에서만)
  if (process.env.NODE_ENV === 'development') {
    console.group('다중선택 항목 변환');
    console.log('Input:', {
      type: typeof items,
      value: items,
    });
  }

  const transformed = items.map((item) => ({
    id: item.id || '',
    name: item.name || '',
  }));

  // JSON 문자열로 변환
  const jsonResult = JSON.stringify(transformed);

  // 개발 모드에서 출력값 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('Output:', {
      type: typeof transformed,
      value: transformed,
      isArray: Array.isArray(transformed),
    });
    console.groupEnd();
  }

  return jsonResult;
};

/**
 * 객체의 키를 DB 필드명으로 변환
 * @param {Object} data - 변환할 데이터
 * @param {Object} fieldMap - 필드 매핑 객체 (예: {firstName: 'first_name'})
 * @returns {Object} 변환된 객체
 */
export const mapFieldsToDB = (data, fieldMap) => {
  const result = {};

  Object.entries(data).forEach(([key, value]) => {
    const dbField = fieldMap[key] || key;
    result[dbField] = value;
  });

  return result;
};

/**
 * 모든 변환 함수를 포함하는 객체
 * 이전 코드와의 호환성을 위해 제공
 */
export const transformUtils = {
  isEmpty,
  parseNumber,
  removeEmptyFields,
  removeEmptyFieldsDeep,
  camelToSnakeCase,
  snakeToCamelCase,
  transformMultiSelect,
  mapFieldsToDB,
};

// 기본 내보내기
export default transformUtils;
