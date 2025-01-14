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
      sales_rec_date: {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      },
    },
  ];

  // probability 필터 추가
  if (probability) {
    if (probability === 'confirmed') {
      defaultFilter.push({
        confirmed: { $eq: true },
      });
    } else {
      defaultFilter.push({
        confirmed: { $eq: false },
        sfa_percentage: {
          name: { $eq: probability },
        },
      });
    }
  }

  const queryObj = {
    filters: {
      $and: [
        {
          deleted: {
            $eq: false,
          },
        },
        ...defaultFilter,
      ],
    },
    sort: ['sales_rec_date:asc'],
    fields: [
      'confirmed',
      'sales_revenue',
      'sales_profit',
      'sales_rec_date',
      'payment_date',
    ],
    populate: {
      sfa: {
        fields: ['name', 'sfa_item_price', 'isProject'],
        populate: {
          sfa_sales_type: {
            fields: ['name'],
          },
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
      sfa_percentage: {
        fields: ['name'],
      },
      sfa_profit_margin: {
        fields: ['name'],
      },
      re_payment_method: {
        fields: ['name'],
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
      fields: ['name', 'isProject', 'sfa_item_price', 'description'],
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
        sfa_moreinfos: {
          filters: {
            deleted: {
              $eq: false,
            },
          },
          sort: ['id:asc'],
          fields: [
            'confirmed',
            'sales_revenue',
            'sales_profit',
            'sales_rec_date',
            'payment_date',
            'profitMargin_value',
            'payment_date',
          ],
          // populate: '*',
          populate: {
            sfa_change_records: {
              sort: ['id:desc'],
              populate: {
                sfa_percentage: {
                  fields: ['name'],
                },
                sfa_profit_margin: {
                  fields: ['name'],
                },
                re_payment_method: {
                  fields: ['name'],
                },
              },
            },
            re_payment_method: {
              fields: ['name', 'code', 'sort'],
              sort: ['sort:asc'],
            },
            sfa_percentage: {
              fields: ['name'],
            },
            sfa_profit_margin: {
              fields: ['name'],
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
    sales_rec_date: {
      $gte: range.startDate,
      $lte: range.endDate,
    },
  }));

  const queryObj = {
    filters: {
      $and: [
        {
          deleted: {
            $eq: false,
          },
        },
        {
          $or: filters,
        },
      ],
    },
    fields: ['confirmed', 'sales_revenue', 'sales_profit', 'sales_rec_date'],
    populate: {
      sfa_percentage: {
        fields: ['name'],
      },
    },
    pagination, //{ pagination } = {}
  };

  return qs.stringify(queryObj, { encodeValuesOnly: true });
};
