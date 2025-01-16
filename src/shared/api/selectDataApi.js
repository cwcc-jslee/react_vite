// src/shared/api/selectDataApi.js
import { apiClient } from './apiClient';
import qs from 'qs';

/**
 * 선택 데이터를 가져오는 API 함수들
 */
export const selectDataApi = {
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

    const response = await apiClient.get(`/api/sfa-items?${query}`);
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

    const response = await apiClient.get(`/api/teams?${query}`);
    return response.data;
  },

  /**
   * 회계연도 목록을 조회하는 함수
   * @returns {Promise} 회계연도 데이터 배열
   */
  getFiscalYears: async () => {
    const response = await apiClient.get('/api/fiscal-years');
    return response.data;
  },

  /**
   * 상태 목록을 조회하는 함수
   * @returns {Promise} 상태 데이터 배열
   */
  getStatus: async () => {
    const response = await apiClient.get('/api/status');
    return response.data;
  },

  /**
   * 지역 목록을 조회하는 함수
   * @returns {Promise} 지역 데이터 배열
   */
  getRegions: async () => {
    const response = await apiClient.get('/api/regions');
    return response.data;
  },
};
