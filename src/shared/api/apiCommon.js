// src/shared/api/apiCommon.js
import { apiClient } from './apiClient';
import qs from 'qs';

export const apiCommon = {
  /**
   * 코드북 데이터를 조회합니다
   * @param {string} type - 코드북 타입
   */
  getCodebook: async (type) => {
    const queryObj = {
      fields: ['code', 'name', 'sort'],
      populate: {
        codetype: {
          fields: ['type', 'name'],
        },
      },
      filters: {
        $and: [{ used: { $eq: true } }, { codetype: { type: { $eq: type } } }],
      },
      sort: ['sort:asc'],
      pagination: { start: 0, limit: 50 },
    };

    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    return apiClient.get(`/codebooks?${query}`);
  },

  /**
   * 매출품목 목록을 조회하는 함수
   * @param {number} classificationId - 매출구분 ID
   * @returns {Promise} 매출품목 데이터 배열
   */
  getSfaItems: async (classificationId) => {
    const query = qs.stringify(
      {
        filters: {
          sfa_classification: {
            id: {
              $eq: classificationId,
            },
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/sfa-items?${query}`);
    return response.data;
  },

  /**
   * 팀 목록을 조회하는 함수
   * @returns {Promise} 팀 데이터 배열
   */
  getTeams: async () => {
    const query = qs.stringify(
      {
        filters: {
          used: {
            $eq: true,
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/teams?${query}`);
    return response.data;
  },
};
