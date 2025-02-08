/**
 * SFA 서비스 - API 통신 및 데이터 처리를 담당
 * - API 호출 및 데이터 정규화
 * - 비즈니스 로직 처리
 * - 에러 처리
 *
 * @version 1.0.0
 * @filename src/features/sfa/services/sfaService.js
 */

import { apiClient } from '../../../shared/api/apiClient';
import { buildSfaListQuery, buildSfaDetailQuery } from '../api/queries';
import dayjs from 'dayjs';
import qs from 'qs';

/**
 * API 응답 데이터 정규화
 */
const normalizeResponse = (response) => {
  if (!response?.data?.data) {
    return {
      data: [],
      meta: { pagination: { total: 0 } },
    };
  }

  return {
    data: response.data.data,
    meta: response.data.meta,
  };
};

/**
 * 에러 처리
 */
const handleError = (error, customMessage) => {
  console.error(customMessage || 'API Error:', error);
  throw new Error(
    error.response?.data?.error?.message ||
      error.message ||
      customMessage ||
      'An error occurred',
  );
};

export const sfaService = {
  /**
   * SFA 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getSfaList: async (params) => {
    try {
      // 기본 날짜 범위 설정
      const defaultDateRange = {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      };

      // 쿼리 파라미터 구성
      const queryParams = {
        pagination: params.pagination,
        filters: params.filters,
        dateRange: params.dateRange || defaultDateRange,
        probability: params.probability,
      };

      // 쿼리 생성 및 API 호출
      const query = buildSfaListQuery(queryParams);
      const response = await apiClient.get(`/api/sfa-by-payments?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch SFA list');
    }
  },

  /**
   * SFA 상세 정보 조회
   * @param {string|number} id - SFA ID
   */
  getSfaDetail: async (id) => {
    try {
      const query = buildSfaDetailQuery(id);
      const response = await apiClient.get(`/api/sfas?${query}`);

      if (!response.data?.data?.[0]) {
        throw new Error('SFA data not found');
      }

      return response.data.data[0];
    } catch (error) {
      handleError(error, 'Failed to fetch SFA detail');
    }
  },

  /**
   * SFA 월별 통계 조회
   * @param {string} startDate - 시작일
   * @param {string} endDate - 종료일
   */
  getMonthlyStats: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(
        '/api/sfa-monthly-sales-stats/forecast',
        {
          params: { startDate, endDate },
        },
      );

      if (!response.data?.data || !Array.isArray(response.data.data)) {
        return {};
      }

      // 데이터 변환 처리
      const processedData = response.data.data.reduce((acc, item) => {
        acc[item.group_name] = {
          revenue: Number(item.total_amount) || 0,
          profit: Number(item.total_profit_amount) || 0,
        };
        return acc;
      }, {});

      // 확정 데이터가 없는 경우 기본값 추가
      if (!processedData.confirmed) {
        processedData.confirmed = { revenue: 0, profit: 0 };
      }

      return processedData;
    } catch (error) {
      handleError(error, 'Failed to fetch monthly stats');
    }
  },

  /**
   * 아이템 목록 조회
   * @param {string} classificationId - 분류 ID
   */
  getItems: async (classificationId) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            sfa_classification: { id: { $eq: classificationId } },
          },
          sort: ['sort:asc'],
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClient.get(`/api/sfa-items?${query}`);
      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch items');
    }
  },

  /**
   * 코드북 데이터 조회
   * @param {string} type - 코드북 타입
   */
  getCodebook: async (type) => {
    try {
      const query = qs.stringify(
        {
          fields: ['code', 'name', 'sort'],
          populate: {
            codetype: {
              fields: ['type', 'name'],
            },
          },
          filters: {
            $and: [
              { used: { $eq: true } },
              { codetype: { type: { $eq: type } } },
            ],
          },
          sort: ['sort:asc'],
          pagination: { start: 0, limit: 50 },
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClient.get(`/api/codebooks?${query}`);
      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch codebook');
    }
  },
};
