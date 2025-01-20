// src/features/sfa/api/queries.js
import qs from 'qs';

export const buildSfaListQuery = ({
  start = 0,
  limit = 25,
  dateRange,
  probability = null,
}) => {
  // 기본 필터 설정
  const defaultFilter = [
    {
      recognition_date: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      },
    },
  ];

  // probability 필터 추가
  // sfa 월간 테이블에서 월&매출확률 클릭시 사용용
  if (probability) {
    if (probability === 'confirmed') {
      defaultFilter.push({
        is_confirmed: { $eq: true },
      });
    } else {
      defaultFilter.push({
        is_confirmed: { $eq: false },
        probability: { $eq: probability },
      });
    }
  }

  const queryObj = {
    filters: {
      $and: [
        {
          is_deleted: {
            $eq: false,
          },
        },
        ...defaultFilter,
      ],
    },
    sort: ['recognition_date:asc'],
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
      start,
      limit,
    },
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
