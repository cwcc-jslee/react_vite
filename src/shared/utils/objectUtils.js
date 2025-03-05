// src/shared/utils/objectUtils.js

/**
 * 두 객체 또는 값의 깊은 비교를 수행하는 함수
 * @param {any} obj1 - 비교할 첫 번째 값
 * @param {any} obj2 - 비교할 두 번째 값
 * @returns {boolean} 두 값이 같으면 true, 그렇지 않으면 false
 */
export const isEqual = (obj1, obj2) => {
  // 기본 타입 또는 null/undefined 비교
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (obj1 === undefined || obj2 === undefined) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  // 배열 비교
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;

    // ID 기반 비교 (객체 배열인 경우)
    if (
      obj1.length > 0 &&
      typeof obj1[0] === 'object' &&
      obj1[0] !== null &&
      'id' in obj1[0]
    ) {
      // ID 기준으로 정렬
      const sortById = (a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0);
      const sortedArr1 = [...obj1].sort(sortById);
      const sortedArr2 = [...obj2].sort(sortById);

      // 각 항목 비교
      for (let i = 0; i < sortedArr1.length; i++) {
        if (!isEqual(sortedArr1[i], sortedArr2[i])) return false;
      }
      return true;
    }

    // 일반 배열 비교
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // 객체 비교
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * 객체에서 실제로 변경된 필드만 추출하는 함수
 * @param {Object} original - 원본 객체
 * @param {Object} updated - 업데이트된 객체
 * @param {Object} [fieldMapping={}] - 필드명 매핑 (프론트엔드 필드명 -> 백엔드 필드명)
 * @returns {Object} 변경된 필드와 값만 포함한 객체
 */
export const extractChanges = (original, updated, fieldMapping = {}) => {
  const changes = {};

  // 변경된 필드 추출
  Object.keys(updated).forEach((key) => {
    const apiKey = fieldMapping[key] || key;

    if (!isEqual(updated[key], original[key])) {
      changes[apiKey] = updated[key];
    }
  });

  return changes;
};

/**
 * 객체에서 특정 필드만 추출하는 함수
 * @param {Object} obj - 객체
 * @param {Array<string>} fields - 추출할 필드명 배열
 * @returns {Object} 지정된 필드만 포함한 새 객체
 */
export const pickFields = (obj, fields) => {
  return fields.reduce((result, field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
    return result;
  }, {});
};

/**
 * 객체 데이터를 API 형식으로 변환하는 함수
 * @param {Object} data - 변환할 객체 데이터
 * @param {Object} fieldMapping - 필드명 매핑 객체
 * @returns {Object} API 형식에 맞게 변환된 객체
 */
export const transformToApiFormat = (data, fieldMapping = {}) => {
  const result = {};

  Object.keys(data).forEach((key) => {
    const apiKey = fieldMapping[key] || key;

    // ID 기반 필드 처리 (Select 필드 등)
    if (
      ['coClassification', 'businessScale', 'employee', 'region'].includes(
        key,
      ) &&
      data[key]
    ) {
      result[apiKey] = { id: data[key] };
    } else {
      result[apiKey] = data[key];
    }
  });

  return result;
};
