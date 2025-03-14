// src/features/project/api/queries.js
import qs from 'qs';

/**
 * CUSTOMER 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildProjectListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 기본 필터 구성
  const baseFilters = [{ is_deleted: { $eq: false } }];

  // 쿼리 구성
  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: [
      'name',
      'plan_start_date',
      'plan_end_date',
      'start_date',
      'end_date',
      'last_workupdate_date',
      'is_completed',
      'createdAt',
    ],
    populate: {
      customer: {
        fields: ['name'],
      },
      pjt_status: {
        fields: ['name'],
      },
      fy: {
        fields: ['name'],
      },
      sfa: {
        fields: ['name'],
        populate: {
          customer: {
            fields: ['name'],
          },
        },
      },
      service: {
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
