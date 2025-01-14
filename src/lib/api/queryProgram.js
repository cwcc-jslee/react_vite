import qs from 'qs';

// 프로그램 리스트
// ProgramContainer
// ?populate=%2A -> 모두가져오기

export const qs_programs = (start, limit) =>
  qs.stringify(
    {
      filters: {
        used: {
          $eq: true,
        },
      },
      sort: ['announcement_date:desc'],
      fields: [
        'name',
        'announcement_date',
        'application_date_start',
        'application_date_end',
        'service',
      ],
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
        lead_agency: {
          fields: ['name'],
        },
        operation_org: {
          fields: ['name'],
        },
        proposals: {
          fields: ['proposal_date'],
          populate: {
            pro_status: {
              fields: ['name'],
            },
          },
        },
        // moreinfo: {
        //   populate: '*',
        //   fields: [''],
        //   populate: {
        //     cb_bu_type: {
        //       fields: ['code'],
        //     },
        //   },
        // },
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
export const qs_programDetail = () =>
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
        'service',
        'description',
      ],
      // populate: '*',

      // populate: '*',
      populate: {
        in_out: {
          fields: ['name'],
        },
        pgm_status: {
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
        lead_agency: {
          fields: ['name'],
        },
        operation_org: {
          fields: ['name'],
        },
        proposals: {
          sort: ['createdAt:asc'],
          fields: ['proposal_date', 'price', 'service', 'description'],
          populate: {
            customer: {
              fields: ['name'],
            },
            pro_method: {
              fields: ['name'],
            },
            pro_status: {
              fields: ['name'],
            },
            user: {
              fields: ['username', 'email'],
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 프로그램별 제안 리스트
// DRForm 에서 사용
export const qs_proposals = (start, limit, pid) =>
  qs.stringify(
    {
      filters: {
        program: {
          id: {
            $eq: pid,
          },
        },
      },
      sort: ['createdAt:asc'],
      fields: ['proposal_date', 'price', 'description'],
      // populate: '*',
      populate: {
        customer: {
          fields: ['name'],
        },
        services: {
          fields: ['name'],
        },
        pro_method: {
          fields: ['name'],
        },
        pro_status: {
          fields: ['name'],
        },
        // moreinfo: {
        //   populate: '*',
        //   fields: [''],
        //   populate: {
        //     cb_bu_type: {
        //       fields: ['code'],
        //     },
        //   },
        // },
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

// 매출현황등록 - 유입경로 선택시 '선정'된 고객사 리스트
export const qs_selectedProposals = () =>
  qs.stringify(
    {
      filters: {
        pro_status: {
          id: {
            $eq: 60, //60-선정, 57-제안, 58-신청
          },
        },
      },
      sort: ['createdAt:asc'],
      fields: ['createdAt'],
      // populate: '*',
      populate: {
        customer: {
          sort: ['name:asc'],
          fields: ['name'],
        },
        program: {
          sort: ['createdAt:asc'],
          fields: ['name'],
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 매출현황등록 - 유입경로 선택시 '선정'된 고객사 리스트
export const qs_filterProposals = (filter) =>
  qs.stringify(
    {
      filters: {
        ...filter,
      },
      sort: ['createdAt:asc'],
      fields: ['createdAt'],
      // populate: '*',
      populate: {
        customer: {
          sort: ['name:asc'],
          fields: ['name'],
        },
        program: {
          sort: ['createdAt:asc'],
          fields: ['name'],
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// Select Form 에 사용할 id, name 값
export const qs_topPrograms = () =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            used: {
              $eq: true,
            },
          },
        ],
      },
      sort: ['sort:asc'],
      fields: ['name'],
      // populate: '*',
      pagination: {
        start: 0,
        limit: 50,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
