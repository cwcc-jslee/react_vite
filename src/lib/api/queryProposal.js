import qs from 'qs';

// 프로그램 리스트
// ProgramContainer
// ?populate=%2A -> 모두가져오기

// 프로그램별 제안 리스트
// DRForm 에서 사용
export const qs_proposals = (start, limit, pid) =>
  qs.stringify(
    {
      // filters: {
      //   program: {
      //     id: {
      //       $eq: pid,
      //     },
      //   },
      // },
      sort: ['proposal_date:asc'],
      fields: ['proposal_date', 'price', 'service', 'description'],
      // populate: '*',
      populate: {
        customer: {
          fields: ['name'],
        },
        program: {
          fields: ['name'],
          populate: {
            top_program: {
              fields: ['name'],
            },
          },
        },
        pro_method: {
          fields: ['name'],
        },
        pro_status: {
          fields: ['name'],
        },
        user: {
          fields: ['username'],
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
