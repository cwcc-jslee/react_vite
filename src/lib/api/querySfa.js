import qs from 'qs';

// ******************************************************************** //
// 사용처 : SfaContainer > useEffect 매출 리스트
// 필터 기능 적용
// ******************************************************************** //

export const qs_sfaMoreinfos = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            deleted: {
              $eq: false,
            },
          },
          ...filter,
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
      // populate: '*',
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
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// ******************************************************************** //
// 사용처 : Sfa > sfa dashboard
// 1월 ~ 12월 매출확정 데이터
// ******************************************************************** //
export const qs_sfaConfirmedData = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            deleted: {
              $eq: false,
            },
          },
          ...filter,
        ],
      },
      sort: ['id:asc'],
      fields: ['sales_revenue', 'sales_rec_date', 'confirmed'],
      populate: {
        sfa: {
          fields: ['sfa_item_price'],
        },
        sfa_percentage: {
          fields: ['name'],
        },
      },
      pagination: {
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 프로그램 리스트
// ProgramContainer
// ?populate=%2A -> 모두가져오기
//  sfa_change_records 1EA 만 가져오게..설정 변경 필요..
export const qs_sfaMoreinfos_1 = (start, limit) =>
  qs.stringify(
    {
      filters: {
        deleted: {
          $eq: false,
        },
      },
      sort: ['sales_rec_date:asc'],
      fields: [
        'confirmed',
        'sales_revenue',
        'sales_profit',
        'sales_rec_date',
        'payment_date',
      ],
      // populate: '*',
      populate: {
        sfa: {
          fields: ['name'],
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
            sfa_service_prices: {
              filters: {
                deleted: {
                  $eq: false,
                },
              },
              fields: ['price'],
              populate: {
                sfa_item: {
                  fields: ['name'],
                },
                team: {
                  fields: ['name'],
                },
              },
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
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// SFA 상세 조회
export const qs_sfaMoreinfoDetail = () =>
  qs.stringify(
    {
      fields: [
        'name',
        'announcement_date',
        'application_date_start',
        'application_date_end',
        'business_date_start',
        'business_date_end',
        'expected_result_date',
        'result_date',
        'description',
      ],
      // populate: '*',

      // populate: '*',
      populate: {
        pgm_status: {
          fields: ['name'],
        },
        in_out: {
          fields: ['name'],
        },
        fy: {
          fields: ['name'],
        },
        top_program: {
          fields: ['in_out', 'name'],
        },
        sub_program: {
          fields: ['name'],
        },
        services: {
          fields: ['name'],
        },
        lead_agency: {
          fields: ['name'],
        },
        operation_org: {
          fields: ['name'],
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// sfa-items
export const qs_sfaitems = (id) =>
  qs.stringify(
    {
      filters: {
        sfa_classification: {
          id: {
            $eq: id,
          },
        },
      },
      sort: ['sort:asc'],
      fields: ['name'],
      // populate: '*',
    },
    {
      encodeValuesOnly: true,
    },
  );

// sfa_moreinf id from sfa...
// sfa moreinfo detail 로 변경 필요
export const qs_sfafromEditId = (id) =>
  qs.stringify(
    {
      filters: {
        sfa_moreinfos: {
          id: {
            $eq: id,
          },
        },
      },
      sort: ['sort:asc'],
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
        proposal: {
          fields: ['name'],
        },
        sfa_service_prices: {
          filters: {
            deleted: {
              $eq: false,
            },
          },
          fields: ['price'],
          populate: {
            sfa_item: {
              fields: ['name'],
            },
            team: {
              fields: ['name'],
            },
          },
        },
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

// sfa 월별 현황 계산용
export const qs_sfaStatistics = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            deleted: {
              $eq: false,
            },
          },
          {
            sfa_change_records: {
              sales_rec_date: {
                $gte: filter.startDate,
              },
            },
          },
          {
            sfa_change_records: {
              sales_rec_date: {
                $lte: filter.endDate,
              },
            },
          },
        ],
      },
      populate: {
        sfa_change_records: {
          sort: ['id:desc'],
          fields: [
            'confirmed',
            'sales_revenue',
            'sales_profit',
            'sales_rec_date',
          ],
          populate: {
            sfa_percentage: {
              fields: ['name'],
            },
            // re_payment_method: {
            //   fields: ['name'],
            // },
          },
        },
      },
      pagination: {
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// ******************************************************************** //
// sfa isProject enable > 고객정보
// 추가 필드 : 년도
// 사용처 : ProgramContainer > handleButtonOnclick(프로젝트 등록)
// ******************************************************************** //
export const qs_sfaCustomersByIsProject = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          // {
          //   deleted: {
          //     $eq: false,
          //   },
          // },
          {
            isProject: {
              $eq: true,
            },
          },
          // {
          //   sfa_change_records: {
          //     sales_rec_date: {
          //       $gte: filter.startDate,
          //     },
          //   },
          // },
          // {
          //   sfa_change_records: {
          //     sales_rec_date: {
          //       $lte: filter.endDate,
          //     },
          //   },
          // },
        ],
      },
      fields: ['name'],
      sort: ['id:desc'],
      populate: {
        customer: {
          fields: ['name'],
        },
      },
      pagination: {
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
