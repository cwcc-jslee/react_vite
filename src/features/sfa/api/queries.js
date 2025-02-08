// src/features/sfa/api/queries.js
import qs from 'qs';

/**
 * SFA 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildSfaListQuery = (params) => {
  const {
    pagination = { start: 0, limit: 25 },
    filters = {},
    dateRange,
    probability = null,
  } = params;

  // 기본 필터 구성
  const baseFilters = [
    { is_deleted: { $eq: false } },
    // 날짜 범위 필터
    {
      recognition_date: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      },
    },
  ];

  // 확률 필터 추가
  if (probability) {
    if (probability === 'confirmed') {
      baseFilters.push({ is_confirmed: { $eq: true } });
    } else {
      baseFilters.push({
        is_confirmed: { $eq: false },
        probability: { $eq: probability },
      });
    }
  }
  console.log(`>> basefilter : `, baseFilters);

  // SFA 관련 필터 처리
  const sfaFilters = {};

  // 매출처 필터
  if (filters.customer) {
    sfaFilters.customer = { id: { $eq: filters.customer } };
  }
  // 건명 필터
  if (filters.name) {
    sfaFilters.name = { $contains: filters.name };
  }
  // 결제 유형형
  if (filters.billingType) {
    baseFilters.push({ billing_type: { $eq: filters.billingType } });
  }
  // 매출 구분
  if (filters.sfaClassification) {
    sfaFilters.sfa_classification = {
      id: { $eq: filters.sfaClassification },
    };
  }
  // 매출 유형 sfaSalesType
  if (filters.sfaSalesType) {
    sfaFilters.sfa_sales_type = {
      id: { $eq: filters.sfaSalesType },
    };
  }
  // 매출 품목 / 사업부

  // SFA 필터가 있는 경우 baseFilters에 추가
  if (Object.keys(sfaFilters).length > 0) {
    baseFilters.push({ sfa: sfaFilters });
  }

  // 쿼리 구성
  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: [
      'billing_type',
      'is_confirmed',
      'probability',
      'amount',
      'profit_amount',
      'profit_config',
      'recognition_date',
      'scheduled_date',
    ],
    populate: {
      sfa: {
        fields: ['name', 'sfa_by_items', 'has_partner', 'is_project'],
        populate: {
          customer: {
            fields: ['name'],
          },
          selling_partner: {
            fields: ['name'],
          },
          sfa_classification: {
            fields: ['name'],
          },
        },
      },
    },
    pagination: {
      start: pagination.current
        ? (pagination.current - 1) * pagination.pageSize
        : pagination.start,
      limit: pagination.pageSize || pagination.limit,
    },
    sort: ['recognition_date:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

export const buildSfaDetailQuery = (id) => {
  return qs.stringify(
    {
      // status: 'draft',
      filters: {
        id: { $eq: id },
      },
      fields: [
        'name',
        'is_project',
        'total_price',
        'sfa_by_items',
        'has_partner',
        'description',
      ],
      populate: {
        customer: {
          fields: ['name'],
        },
        selling_partner: {
          fields: ['name'],
        },
        sfa_classification: {
          fields: ['name'],
        },
        sfa_sales_type: {
          fields: ['name'],
        },
        // proposal: {
        //   fields: ['name'],
        // },
        // sfa_service_prices: {
        //   filters: {
        //     deleted: {
        //       $eq: false,
        //     },
        //   },
        //   fields: ['price'],
        //   populate: {
        //     sfa_item: {
        //       fields: ['name'],
        //     },
        //     team: {
        //       fields: ['name'],
        //     },
        //   },
        // },
        sfa_by_payments: {
          filters: {
            is_deleted: {
              $eq: false,
            },
          },
          sort: ['id:asc'],
          fields: [
            'billing_type',
            'is_confirmed',
            'probability',
            'amount',
            'profit_amount',
            'recognition_date',
            'scheduled_date',
            'profit_config',
            'memo',
          ],
          // populate: '*',
          populate: {
            sfa_by_payment_histories: {
              fields: [
                'is_confirmed',
                'probability',
                'amount',
                'profit_amount',
                'recognition_date',
                'scheduled_date',
                'profit_config',
                'memo',
              ],
              sort: ['id:desc'],
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
};

export const buildSfaStatsQuery = (dateRanges, { pagination } = {}) => {
  //console.log(
  //  `>>>>buildSfaStatsQuery [ ${pagination.start}/${pagination.limit} ]`,
  //);
  const filters = dateRanges.map((range) => ({
    recognition_date: {
      $gte: range.startDate,
      $lte: range.endDate,
    },
  }));

  const queryObj = {
    filters: {
      $and: [
        {
          is_deleted: {
            $eq: false,
          },
        },
        {
          $or: filters,
        },
      ],
    },
    fields: [
      'is_confirmed',
      'probability',
      'amount',
      'profit_amount',
      'recognition_date',
    ],
    populate: {
      sfa_percentage: {
        fields: ['name'],
      },
    },
    pagination, //{ pagination } = {}
  };

  return qs.stringify(queryObj, { encodeValuesOnly: true });
};
