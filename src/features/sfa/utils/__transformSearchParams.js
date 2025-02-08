/**
 * 검색 파라미터를 API 요청 형식으로 변환
 * - 페이지네이션, 필터 등의 파라미터를 API 형식에 맞게 변환
 *
 * @filename src/features/sfa/utils/transformSearchParams.js
 */

import qs from 'qs';

// ... 기존 상수 정의 ...

/**
 * 페이지네이션 파라미터 변환
 */
const transformPagination = (pagination) => {
  console.group('transformPagination');
  console.log('Input pagination:', pagination);

  const { current = 1, pageSize = 20 } = pagination;
  const result = {
    start: (current - 1) * pageSize,
    limit: pageSize,
  };

  console.log('Transformed pagination:', result);
  console.groupEnd();
  return result;
};

/**
 * 검색 파라미터 변환
 */
export const transformSearchParams = (params) => {
  console.group('transformSearchParams');
  console.log('Input params:', params);

  const {
    pagination = { current: 1, pageSize: 20 },
    filters = {},
    dateRange,
    probability,
  } = params;

  // 기본 필터 설정
  const baseFilters = {
    $and: [{ is_deleted: { $eq: false } }],
  };

  // 날짜 범위 필터 추가
  if (dateRange) {
    baseFilters.$and.push(createDateRangeFilter(dateRange));
  }

  // 확률 필터 추가
  if (probability) {
    baseFilters.$and.push({ probability: { $eq: probability } });
  }

  // 기타 필터 추가
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      baseFilters.$and.push({ [key]: { $eq: value } });
    }
  });

  // 쿼리 파라미터 구성
  const queryParams = {
    filters: baseFilters,
    fields: DEFAULT_FIELDS,
    populate: DEFAULT_POPULATE,
    pagination: transformPagination(pagination),
    sort: ['recognition_date:asc'],
  };

  console.log('Final query params:', queryParams);

  // 쿼리 스트링으로 변환
  const queryString = qs.stringify(queryParams, { encodeValuesOnly: true });
  console.log('Generated query string:', queryString);

  console.groupEnd();
  return queryString;
};
