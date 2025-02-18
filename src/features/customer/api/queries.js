// src/features/customer/api/queries.js
import qs from 'qs';

/**
 * CUSTOMER 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildCustomerListQuery = (params) => {
  const {
    pagination = { start: 0, limit: 25 },
    filters = {},
    dateRange,
  } = params;

  // 기본 필터 구성
  const baseFilters = [{ is_deleted: { $eq: false } }];

  // 쿼리 구성
  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: [
      'name',
      'funnel',
      'business_type',
      'business_item',
      'city',
      'createdAt',
    ],
    populate: {
      co_classification: {
        fields: ['name'],
      },
      business_scale: {
        fields: ['name'],
      },
      region: {
        fields: ['name'],
      },
    },
    pagination: {
      start: pagination.current
        ? (pagination.current - 1) * pagination.pageSize
        : pagination.start,
      limit: pagination.pageSize || pagination.limit,
    },
    sort: ['id:desc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};
