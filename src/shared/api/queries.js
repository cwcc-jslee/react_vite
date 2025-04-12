// src/features/codebook/api/queries.js
import qs from 'qs';

/**
 * 특정 코드타입의 코드북 데이터를 가져오는 쿼리 생성
 */
export const buildCodebookByTypeQuery = (type) => {
  const queryObj = {
    fields: ['code', 'name', 'sort'],
    populate: {
      codetype: {
        fields: ['type', 'name'],
      },
    },
    filters: {
      $and: [
        { used: { $eq: true } },
        {
          codetype: {
            type: { $eq: type },
          },
        },
      ],
    },
    sort: ['sort:asc'],
    pagination: {
      start: 0,
      limit: 50,
    },
  };

  return qs.stringify(queryObj, { encodeValuesOnly: true });
};

/**
 * 여러 코드타입의 코드북 데이터를 한 번에 가져오는 쿼리 생성
 */
export const buildMultipleCodebookTypesQuery = (types) => {
  const queryObj = {
    fields: ['code', 'name', 'sort'],
    populate: {
      codetype: {
        fields: ['type', 'name'],
      },
    },
    filters: {
      $and: [
        { used: { $eq: true } },
        {
          codetype: {
            type: { $in: types },
          },
        },
      ],
    },
    sort: ['sort:asc'],
    pagination: {
      start: 0,
      limit: 50,
    },
  };

  return qs.stringify(queryObj, { encodeValuesOnly: true });
};
