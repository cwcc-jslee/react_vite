/**
 * Contact 서비스 - API 통신 및 데이터 처리를 담당
 * - API 호출 및 데이터 정규화
 * - 비즈니스 로직 처리
 * - 에러 처리
 *
 * @version 1.0.0
 * @filename src/features/contact/services/contactService.js
 */

import { apiClient } from '../../../shared/api/apiClient';
import { buildContactListQuery } from '../api/queries';

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

export const contactService = {
  /**
   * Contact 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getContactList: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildContactListQuery(params);
      const response = await apiClient.get(`/contacts?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch Contact list');
    }
  },
};
