// src/features/customer/api/queries.js
import qs from 'qs';

/**
 * CUSTOMER 목록 조회를 위한 쿼리 파라미터 생성
 * @param {Object} params - 쿼리 파라미터
 * @param {Object} params.pagination - 페이지네이션 정보
 * @param {Object} params.filters - 필터 조건
 */
export const buildCustomerListQuery = (params) => {
  const {
    pagination = { start: 0, limit: 25 },
    filters = {},
  } = params;

  // 기본 필터 구성
  const queryFilters = [{ is_deleted: { $eq: false } }];

  // 텍스트 검색 필터 (부분 일치)
  if (filters.name) {
    queryFilters.push({ name: { $containsi: filters.name } });
  }

  if (filters.businessType) {
    queryFilters.push({ business_type: { $containsi: filters.businessType } });
  }

  if (filters.city) {
    queryFilters.push({ city: { $containsi: filters.city } });
  }

  if (filters.address) {
    queryFilters.push({ address: { $containsi: filters.address } });
  }

  // 관계 필드 필터 (정확히 일치)
  if (filters.coClassification) {
    queryFilters.push({
      co_classification: { id: { $eq: filters.coClassification } },
    });
  }

  if (filters.businessScale) {
    queryFilters.push({
      business_scale: { id: { $eq: filters.businessScale } },
    });
  }

  if (filters.region) {
    queryFilters.push({
      region: { id: { $eq: filters.region } },
    });
  }

  if (filters.employee) {
    queryFilters.push({
      employee: { id: { $eq: filters.employee } },
    });
  }

  // funnel - JSON 필드 (id로 필터링)
  if (filters.funnel) {
    queryFilters.push({
      funnel: { $containsi: `"id":${filters.funnel}` },
    });
  }

  // 날짜 범위 필터 (선택사항)
  if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
    queryFilters.push({
      createdAt: {
        $gte: filters.dateRange.startDate,
        $lte: filters.dateRange.endDate,
      },
    });
  }

  // 쿼리 구성
  const query = {
    filters: {
      $and: queryFilters,
    },
    fields: [
      'name',
      'business_number',
      'business_type',
      'business_item',
      'city',
      'representative_name',
      'funnel',
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
      employee: {
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

export const buildCustomerDetailQuery = (id) => {
  return qs.stringify(
    {
      filters: {
        id: { $eq: id },
      },
      fields: [
        'name',
        'business_type',
        'business_item',
        'funnel',
        'city',
        'business_number',
        'homepage',
        'representative_name',
        'commencement_date',
        'address',
        'support_program',
        'description',
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
        employee: {
          fields: ['name'],
        },
        // customer_year_datas: {
        //   fields: ['name'],
        // },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
};
