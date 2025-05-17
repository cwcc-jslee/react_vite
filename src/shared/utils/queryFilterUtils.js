/**
 * @file filterUtils.js
 * @description API 요청용 필터 관련 유틸리티 함수 모음
 * - 필터 검증, 변환, 결합 등의 기능 제공
 * - Strapi 필터 형식 호환성 보장
 */

/**
 * 기본 필터(삭제되지 않은 항목)가 포함되어 있는지 확인하고, 없으면 추가
 * @param {Object} filters - 필터 객체
 * @returns {Object} 기본 필터가 포함된 필터 객체
 */
export const ensureBaseFilter = (filters = {}) => {
  // 기본 삭제 필터
  const baseFilter = { is_deleted: { $eq: false } };

  // 필터가 없는 경우 기본 필터만 반환
  if (!filters || Object.keys(filters).length === 0) {
    return { $and: [baseFilter] };
  }

  // $and가 없는 경우 생성
  if (!filters.$and) {
    return {
      $and: [baseFilter, filters],
    };
  }

  // 기본 필터 확인
  const hasBaseFilter = filters.$and.some(
    (filter) => filter.is_deleted?.$eq === false,
  );

  // 기본 필터가 없으면 추가
  if (!hasBaseFilter) {
    return {
      $and: [baseFilter, ...filters.$and],
    };
  }

  // 이미 기본 필터가 있으면 그대로 반환
  return filters;
};

/**
 * 중첩된 $and 구조를 평탄화하는 함수
 * @param {Object} filters - 필터 객체
 * @returns {Object} 평탄화된 필터 객체
 */
export const normalizeFilters = (filters) => {
  if (!filters || !filters.$and) return filters;

  // 결과 배열
  const normalizedAnd = [];

  // $and 배열의 각 항목을 순회
  filters.$and.forEach((item) => {
    // 항목에 중첩된 $and가 있는 경우
    if (item.$and) {
      // 중첩된 $and의 모든 항목을 결과 배열에 추가
      normalizedAnd.push(...item.$and);
    } else {
      // 중첩된 $and가 없는 경우 항목을 그대로 추가
      normalizedAnd.push(item);
    }
  });

  return { $and: normalizedAnd };
};

/**
 * 두 필터 객체를 결합하는 함수
 * @param {Object} baseFilters - 기본 필터 객체
 * @param {Object} additionalFilters - 추가 필터 객체
 * @returns {Object} 결합된 필터 객체
 */
export const combineFilters = (baseFilters = {}, additionalFilters = {}) => {
  // 두 필터 모두 비어있는 경우
  if (
    (!baseFilters || Object.keys(baseFilters).length === 0) &&
    (!additionalFilters || Object.keys(additionalFilters).length === 0)
  ) {
    return { $and: [{ is_deleted: { $eq: false } }] };
  }

  // baseFilters만 있고 additionalFilters가 없는 경우
  if (!additionalFilters || Object.keys(additionalFilters).length === 0) {
    return ensureBaseFilter(baseFilters);
  }

  // baseFilters가 없고 additionalFilters만 있는 경우
  if (!baseFilters || Object.keys(baseFilters).length === 0) {
    return ensureBaseFilter(additionalFilters);
  }

  // 두 필터 모두 있는 경우, $and 배열 결합
  const baseAnd = baseFilters.$and || [baseFilters];
  const additionalAnd = additionalFilters.$and || [additionalFilters];

  // 결합된 필터 (중복 제거 없이 단순 결합)
  const combinedFilter = {
    $and: [...baseAnd, ...additionalAnd],
  };

  // 기본 필터 확인 및 정규화
  return normalizeFilters(ensureBaseFilter(combinedFilter));
};
