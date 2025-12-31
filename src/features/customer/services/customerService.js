/**
 * CUSTOMER 서비스 - API 통신 및 데이터 처리를 담당
 * - API 호출 및 데이터 정규화
 * - 비즈니스 로직 처리
 * - 에러 처리
 *
 * @version 1.0.0
 * @filename src/features/customer/services/customerService.js
 */

import { apiClient } from '../../../shared/api/apiClient';
import {
  buildCustomerListQuery,
  buildCustomerDetailQuery,
} from '../api/queries';
import {
  normalizeResponse,
  normalizeError,
} from '../../../shared/api/normalize';
import dayjs from 'dayjs';
import qs from 'qs';

/**
 * 에러 처리
 */
const handleError = (error, customMessage) => {
  console.error(customMessage || 'API Error:', error);
  const normalizedError = normalizeError(error);
  throw new Error(
    normalizedError.message || customMessage || 'An error occurred',
  );
};

export const customerService = {
  /**
   * CUSTOMER 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getCustomerList: async (params) => {
    try {
      // 쿼리 파라미터 구성
      const queryParams = {
        pagination: params.pagination,
        filters: params.filters,
      };

      // 쿼리 생성 및 API 호출
      const query = buildCustomerListQuery(queryParams);
      const response = await apiClient.get(`/customers?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch Customer list');
    }
  },
  /**
   * CUSTOMER 상세 조회
   */
  getCustomerDetail: async (id) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildCustomerDetailQuery(id);
      const response = await apiClient.get(`/customers?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch Customer list');
    }
  },

  /**
   * CUSTOMER 통계용 카운트 조회
   * @param {Array} filters - 필터 배열
   * @returns {Object} - 응답 객체 (meta.pagination.total 포함)
   */
  getCount: async (filters) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            $and: [{ is_deleted: { $eq: false } }, ...filters],
          },
          pagination: {
            start: 0,
            limit: 1,
          },
        },
        { encodeValuesOnly: true }
      );

      const response = await apiClient.get(`/customers?${query}`);
      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch customer count');
    }
  },
};
