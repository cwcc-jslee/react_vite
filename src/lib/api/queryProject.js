import qs from 'qs';

// ******************************************************************** //
// sfa isProject enable > 고객정보
// 추가 필드 : 년도
// 사용처 : ProgramContainer > handleButtonOnclick(프로젝트 등록)
// ******************************************************************** //

export const qs_coodbookTask = (start, limit, filter) =>
  qs.stringify(
    {
      filters: {
        $and: [
          {
            used: {
              $eq: true,
            },
          },
          {
            services: {
              name: {
                $eq: filter.service,
              },
            },
          },
        ],
      },
      fields: ['name', 'sort'],
      //   sort: ['id:desc'],
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
//
// 사용처 : ProgramContainer > useEffect 최초프로젝트 리스트
// ******************************************************************** //

export const qs_projectLists = (start, limit, filter) =>
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
            pjt_status: {
              name: {
                $eq: filter.status,
              },
            },
          },
        ],
      },
      fields: [
        'name',
        'start_date',
        'end_date',
        'plan_start_date',
        'plan_end_date',
      ],
      populate: {
        pjt_status: {
          fields: ['name'],
        },
        service: {
          fields: ['name'],
        },
        fy: {
          fields: ['name'],
        },
        sfa: {
          fields: ['name'],
          populate: {
            customer: {
              fields: ['name'],
            },
          },
        },
        project_tasks: {
          fields: [
            'name',
            'total_planning_time',
            'total_work_time',
            'total_etc_time',
          ],
          populate: {
            pjt_progress: {
              fields: ['name'],
            },
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
//
// 사용처 : ProgramContainer > useEffect 최초프로젝트 리스트
// ******************************************************************** //

export const qs_projectdetail = (filter) =>
  qs.stringify(
    {
      fields: [
        'name',
        'start_date',
        'end_date',
        'plan_start_date',
        'plan_end_date',
        'last_workupdate_date',
        'completed',
      ],
      populate: {
        pjt_status: {
          fields: ['name'],
        },
        service: {
          fields: ['name'],
        },
        team: {
          fields: ['name'],
        },
        fy: {
          fields: ['name'],
        },
        sfa: {
          fields: ['name'],
          populate: {
            customer: {
              fields: ['name'],
            },
          },
        },
        project_tasks: {
          fields: '*',
          sort: ['sort:asc'],
          populate: {
            pjt_progress: {
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
