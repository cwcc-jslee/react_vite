// src/features/sfa/api/queries.js
import qs from 'qs';

/**
 * SFA 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildSfaListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 기본 필터 구성
  const baseFilters = [
    { is_deleted: { $eq: false } },
    { sfa: { is_deleted: { $eq: false } } },
    { sfa: { is_failed: { $eq: false } } },
  ];

  // 날짜 범위 필터 처리 (filters.dateRange에서 가져옴)
  if (filters.dateRange) {
    const dateFilter = {};

    if (filters.dateRange.startDate) {
      dateFilter.$gte = filters.dateRange.startDate;
    }

    if (filters.dateRange.endDate) {
      dateFilter.$lte = filters.dateRange.endDate;
    }

    if (Object.keys(dateFilter).length > 0) {
      baseFilters.push({
        recognition_date: dateFilter,
      });
    }
  }

  // 확률 필터 추가 (filters.probability에서 가져옴)
  if (filters.probability) {
    if (filters.probability === 'confirmed') {
      baseFilters.push({ is_confirmed: { $eq: true } });
    } else {
      baseFilters.push({
        is_confirmed: { $eq: false },
        probability: { $eq: filters.probability },
      });
    }
  }

  // SFA 관련 필터 처리
  const sfaFilters = {};

  // 고객사/매출처 필터
  if (filters.customer) {
    baseFilters.push({
      $or: [
        { sfa: { customer: { id: { $eq: filters.customer } } } },
        { revenue_source: { $eq: filters.customer } },
      ],
    });
  }
  // 건명 필터
  if (filters.name) {
    sfaFilters.name = { $contains: filters.name };
  }
  // 결제 유형
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
  // FY
  if (filters.fy) {
    sfaFilters.fy = {
      id: { $eq: filters.fy },
    };
  }
  // 매출 품목 / 사업부
  if (filters.salesItem || filters.team) {
    // 사업부만 선택한 경우
    if (filters.team && !filters.salesItem) {
      sfaFilters.sfa_by_items = {
        $containsi: `"team_name":"${filters.team}"`,
      };
    }
    // 매출 품목만 선택한 경우
    else if (filters.salesItem && !filters.team) {
      sfaFilters.sfa_by_items = {
        $containsi: `"item_name":"${filters.salesItem}"`,
      };
    }
    // 두 조건 모두 선택한 경우 (JSON 배열 내 동일 객체에서 두 조건 모두 만족)
    else if (filters.salesItem && filters.team) {
      sfaFilters.sfa_by_items = {
        $and: [
          { $containsi: `"item_name":"${filters.salesItem}"` },
          { $containsi: `"team_name":"${filters.team}"` },
        ],
      };
    }
  }

  // SFA 필터가 있는 경우 baseFilters에 추가
  if (Object.keys(sfaFilters).length > 0) {
    baseFilters.push({ sfa: sfaFilters });
  }
  console.log(`>> basefilter : `, baseFilters);

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
      'payment_label',
    ],
    populate: {
      revenue_source: {
        fields: ['name'],
      },
      sfa: {
        fields: ['name', 'sfa_by_items', 'is_same_billing', 'is_project'],
        populate: {
          customer: {
            fields: ['name'],
          },
          // selling_partner: {
          //   fields: ['name'],
          // },
          sfa_classification: {
            fields: ['name'],
          },
          // sfa_customers: {
          //   fields: ['is_revenue_source', 'is_end_customer'],
          //   populate: {
          //     customer: {
          //       fields: ['name'],
          //     },
          //   },
          //   sort: ['is_revenue_source:desc'],
          // },
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
        'is_same_billing',
        'is_multi_team',
        'sfa_by_items',
        'description',
      ],
      populate: {
        customer: {
          fields: ['name'],
        },
        // sfa_customers: {
        //   fields: ['is_revenue_source', 'is_end_customer'],
        //   populate: {
        //     customer: {
        //       fields: ['name'],
        //     },
        //   },
        //   sort: ['is_revenue_source:desc'],
        // },
        fy: {
          fields: ['name'],
        },
        sfa_classification: {
          fields: ['name'],
        },
        sfa_sales_type: {
          fields: ['name'],
        },
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
            'payment_label',
            'team_allocations',
            'memo',
          ],
          // populate: '*',
          populate: {
            revenue_source: {
              fields: ['name'],
            },
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

/**
 * 매출정보 페이지 목록 조회를 위한 쿼리 파라미터 생성
 * @param {Object} params - { fiscalYear, keyword, divisionIds, itemIds, typeIds, sortBy, sortOrder, page, pageSize }
 */
export const buildSalesInformationQuery = (params) => {
  const {
    fiscalYear = 114, // 기본값: 25년 (id: 114)
    keyword = '',
    divisionIds = [],
    itemIds = [],
    typeIds = [],
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = params;

  // 기본 필터 구성
  const baseFilters = [
    { is_deleted: { $eq: false } },
    { is_failed: { $eq: false } },
  ];

  // FY 필터 (fiscalYear가 있을 때만 추가)
  if (fiscalYear) {
    baseFilters.push({
      fy: { id: { $eq: fiscalYear } },
    });
  }

  // 키워드 검색 (고객명 또는 매출건명)
  if (keyword) {
    baseFilters.push({
      $or: [
        { name: { $containsi: keyword } },
        { customer: { name: { $containsi: keyword } } },
      ],
    });
  }

  // 사업부 필터
  if (divisionIds.length > 0) {
    baseFilters.push({
      division: { id: { $in: divisionIds } },
    });
  }

  // 매출품목 필터
  if (itemIds.length > 0) {
    baseFilters.push({
      sfa_item: { id: { $in: itemIds } },
    });
  }

  // 매출유형 필터
  if (typeIds.length > 0) {
    baseFilters.push({
      sfa_type: { id: { $in: typeIds } },
    });
  }

  // 쿼리 구성
  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: ['name', 'total_amount', 'created_at'],
    populate: {
      customer: { fields: ['name'] },
      division: { fields: ['name'] },
      sfa_item: { fields: ['name'] },
      sfa_type: { fields: ['name'] },
      sfa_by_payments: {
        fields: [
          'payment_date',
          'expected_date',
          'amount',
          'payment_method',
          'note',
        ],
      },
    },
    sort: [`${sortBy}:${sortOrder}`],
    pagination: {
      page,
      pageSize,
    },
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 매출정보 요약 통계 조회를 위한 쿼리 파라미터 생성
 * @param {number} fiscalYear - FY id (기본값: 114 = 25년)
 */
export const buildSalesInformationSummaryQuery = (fiscalYear = 114) => {
  // 기본 필터 구성
  const baseFilters = [
    { is_deleted: { $eq: false } },
    { is_failed: { $eq: false } },
  ];

  // FY 필터 (fiscalYear가 있을 때만 추가)
  if (fiscalYear) {
    baseFilters.push({
      fy: { id: { $eq: fiscalYear } },
    });
  }

  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: ['total_amount'],
    populate: {
      sfa_by_payments: {
        fields: ['id'],
      },
    },
    pagination: {
      start: 0,
      limit: 10000,
    },
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 최근 N일 신규등록 매출 조회를 위한 쿼리 파라미터 생성
 * @param {number} days - 최근 며칠 (기본값: 30)
 */
export const buildRecentSalesQuery = (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const formattedStartDate = startDate.toISOString().split('T')[0];

  const query = {
    filters: {
      $and: [
        { is_deleted: { $eq: false } },
        { is_failed: { $eq: false } },
        {
          created_at: {
            $gte: formattedStartDate,
          },
        },
      ],
    },
    fields: ['id'],
    pagination: {
      start: 0,
      limit: 10000,
    },
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 상위 N개 고객사별 매출액 조회를 위한 쿼리 파라미터 생성
 * @param {number} fiscalYear - FY id (기본값: 114 = 25년)
 */
export const buildTopCustomersQuery = (fiscalYear = 114) => {
  // 기본 필터 구성
  const baseFilters = [
    { is_deleted: { $eq: false } },
    { is_failed: { $eq: false } },
  ];

  // FY 필터 (fiscalYear가 있을 때만 추가)
  if (fiscalYear) {
    baseFilters.push({
      fy: { id: { $eq: fiscalYear } },
    });
  }

  const query = {
    filters: {
      $and: baseFilters,
    },
    fields: ['total_amount'],
    populate: {
      customer: { fields: ['name'] },
    },
    pagination: {
      start: 0,
      limit: 10000,
    },
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};
