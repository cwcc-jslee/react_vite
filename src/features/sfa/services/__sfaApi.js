// src/features/sfa/services/api/sfaApi.js
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';

export const sfaApi = {
  /**
   * 아이템 목록을 조회합니다
   * @param {string} classificationId - 분류 ID
   */
  fetchItems: async (classificationId) => {
    const query = qs.stringify(
      {
        filters: {
          sfa_classification: { id: { $eq: classificationId } },
        },
        sort: ['sort:asc'],
      },
      { encodeValuesOnly: true },
    );

    return apiClient.get(`/sfa-items?${query}`);
  },

  /**
   * 코드북 데이터를 조회합니다
   * @param {string} type - 코드북 타입
   */
  fetchCodebook: async (type) => {
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
};
