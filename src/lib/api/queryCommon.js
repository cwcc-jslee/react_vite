import qs from 'qs';

// code type 에 따른 코드북 가져오기
// 1: co_classification, 2:co_funnel, 3:business_tpe, 4:business_item, 5:region
export const qs_getCodebook = (codeid) =>
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
            codetype: {
              id: {
                $eq: codeid,
              },
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

// path 에 따른 코드 types 가져오기
export const qs_getCodetypes = (path) =>
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
            codepaths: {
              name: {
                $eq: path,
              },
            },
          },
        ],
      },
      // sort: ['sort:asc'],
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

// Select Form 에 사용할 id, name 값
export const qs_getSelectFormLists = (filter) =>
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

// user 정보
export const qs_getUserLists = () =>
  qs.stringify(
    {
      filters: {
        blocked: {
          $eq: false,
        },
      },
      sort: ['username:asc'],
      fields: ['username', 'email'],
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

// team 정보
export const qs_getTeamLists = () =>
  qs.stringify(
    {
      filters: {
        used: {
          $eq: true,
        },
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

// 아래 기존..

// 팀별 인원 현황
// 프로젝트 > subcontainer > 투입률 계산.

export const qs_teamchangehistory = () =>
  qs.stringify(
    {
      filters: {
        used: {
          $eq: true,
        },
      },
      sort: ['sort:asc'],
      fields: ['name', 'abbr'],
      populate: {
        team_change_histories: {
          sort: ['change_date:desc'],
          fields: ['change_date', 'number', 'weeknumber'],
        },
      },
      pagination: {
        // page: 1,
        // pageSize: 10,
        start: 0,
        limit: 100,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 작업 > 사업부 & 사용자 리스트
export const qs_team_worker_list = () =>
  qs.stringify(
    {
      filters: {
        used: {
          $eq: true,
        },
      },
      sort: ['sort:asc'],
      fields: ['name', 'abbr'],
      populate: {
        users: {
          sort: ['username:asc'],
          fields: ['username', 'email', 'blocked', 'level'],
        },
      },
      pagination: {
        start: 0,
        limit: 100,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// user team 정보 가져오기
export const qs_teamByUserid = () =>
  qs.stringify(
    {
      fields: ['username', 'email'],
      populate: {
        code_pj_team: {
          fields: ['name', 'abbr'],
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

// 서비스 정보 가져오기
export const qs_services = () =>
  qs.stringify(
    {
      filters: {
        sfa_classification: {
          id: {
            $eq: 65, // 65:서비스
          },
        },
      },
      sort: ['sort:asc'],
      fields: ['name'],
    },
    {
      encodeValuesOnly: true,
    },
  );
