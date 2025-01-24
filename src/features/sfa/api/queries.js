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

  // 검색 필터 추가
  if (filters.name)
    baseFilters.push({ 'sfa.name': { $contains: filters.name } });
  if (filters.customer)
    baseFilters.push({ 'sfa.customer.id': { $eq: filters.customer } });
  if (filters.sfaSalesType)
    baseFilters.push({
      'sfa.sfa_sales_type.id': { $eq: filters.sfaSalesType },
    });
  if (filters.sfaClassification)
    baseFilters.push({
      'sfa.sfa_classification.id': { $eq: filters.sfaClassification },
    });
  if (filters.salesItem)
    baseFilters.push({
      'sfa.sfa_by_items.item_id': { $eq: filters.salesItem },
    });
  if (filters.team)
    baseFilters.push({ 'sfa.sfa_by_items.team_id': { $eq: filters.team } });
  if (filters.billingType)
    baseFilters.push({ billing_type: { $eq: filters.billingType } });

  const queryObj = {
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
          customer: { fields: ['name'] },
          selling_partner: { fields: ['name'] },
          sfa_classification: { fields: ['name'] },
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

  try {
    return qs.stringify(queryObj, { encodeValuesOnly: true });
  } catch (error) {
    console.error('Error in buildSfaListQuery:', error);
    return '';
  }
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
