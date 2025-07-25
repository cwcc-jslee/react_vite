// src/features/sfa/api/queries.js
import qs from 'qs';

/**
 * SFA 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildSfaListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 기본 필터 구성
  const baseFilters = [{ is_deleted: { $eq: false } }];

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
    // const conditions = [];

    if (!filters.salesItem || !filters.team) {
      sfaFilters.sfa_by_items = {
        $contains: filters.salesItem ? filters.salesItem : filters.team,
      };
    }
    // 두 조건 모두 있는 경우 -> 수정필요..and 시 오류 발생
    else {
      sfaFilters.sfa_by_items = {
        $and: [{ $contains: filters.salesItem }, { $contains: filters.team }],
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
          selling_partner: {
            fields: ['name'],
          },
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
        'sfa_by_items',
        'is_same_billing',
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
        // selling_partner: {
        //   fields: ['name'],
        // },
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
