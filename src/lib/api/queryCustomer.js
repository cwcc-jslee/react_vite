import qs from 'qs';

// 고객 리스트
// customerList.jsx

export const qs_customers = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            used: {
              $eq: true,
            },
          },
          ...filter,
        ],
      },
      sort: ['name:asc'],
      fields: [
        'name',
        'funnel',
        'business_type',
        'business_item',
        'city',
        'createdAt',
      ],
      // populate: '*',
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
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 고객사 상세 조회
export const qs_customerDetail = () =>
  qs.stringify(
    {
      fields: [
        'name',
        'funnel',
        'business_number',
        'homepage',
        'business_type',
        'business_item',
        'city',
        'representative_name',
        'commencement_date',
        'address',
        'createdAt',
        'description',
      ],
      // populate: '*',
      populate: {
        co_classification: {
          fields: ['name'],
        },
        region: {
          fields: ['name'],
        },
        employee: {
          fields: ['name'],
        },
        business_scale: {
          fields: ['name'],
        },
        customer_year_datas: {
          fields: ['revenue', 'exports'],
          populate: {
            fy: {
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

// ******************************************************************** //
// 사용처 :status > 고객사 전체 리스트 가져오기
//
// ******************************************************************** //
export const qs_getCustomerAll = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            used: {
              $eq: true,
            },
          },
          { ...filter },
        ],
      },
      sort: ['name:asc'],
      fields: ['name'],
      // populate: '*',
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
// 사용처 : 고객 > 통계 : 고객사 카운터 만 가져오기
// 필터 기능 적용
// ******************************************************************** //

export const qs_getCount = (filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            used: {
              $eq: true,
            },
          },
          ...filter,
        ],
      },
      // populate: '*',
      pagination: {
        start: 0,
        limit: 0,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
