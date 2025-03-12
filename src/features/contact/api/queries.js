// src/features/contact/api/queries.js
import qs from 'qs';

/**
 * Contact목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildContactListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 기본 필터 구성
  const baseFilters = [{ is_deleted: { $eq: false } }];

  // Contact관련 필터 처리
  const contactFilters = {};

  // 이름 필터
  if (filters.fullName) {
    contactFilters.full_name = { $contains: filters.fullName };
  }
  // 고객사 필터
  if (filters.customer) {
    contactFilters.customer = { $eq: filters.customer };
  }

  // Contact필터가 있는 경우 baseFilters에 추가
  if (Object.keys(contactFilters).length > 0) {
    baseFilters.push({ ...contactFilters });
  }

  // 쿼리 구성
  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: [
      'full_name',
      'last_name',
      'first_name',
      'mobile',
      'email',
      'createdAt',
    ],
    populate: {
      customer: {
        fields: ['name'],
      },
      contact_type: {
        fields: ['name'],
      },
      relationship_status: {
        fields: ['name'],
      },
    },
    pagination: {
      start: pagination.current
        ? (pagination.current - 1) * pagination.pageSize
        : pagination.start,
      limit: pagination.pageSize || pagination.limit,
    },
    sort: ['full_name:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};
