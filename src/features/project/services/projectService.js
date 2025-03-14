/**
 * 프로젝트트 서비스 - API 통신 및 데이터 처리를 담당
 * - API 호출 및 데이터 정규화
 * - 비즈니스 로직 처리
 * - 에러 처리
 *
 * @version 1.0.0
 * @filename src/features/project/services/projectService.js
 */

import { apiClient } from '../../../shared/api/apiClient';
import { buildProjectListQuery } from '../api/queries';
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

export const projectService = {
  /**
   * 프로젝트트 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getProjectList: async (params) => {
    try {
      // 쿼리 파라미터 구성
      const queryParams = {
        pagination: params.pagination,
        filters: params.filters,
      };

      // 쿼리 생성 및 API 호출
      const query = buildProjectListQuery(queryParams);
      const response = await apiClient.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleError(error, 'Failed to fetch Project list');
    }
  },
  /**
   * 프로젝트트 상세 조회
   */
  //   getProjectDetail: async (id) => {
  //     try {
  //       // 쿼리 생성 및 API 호출
  //       const query = buildProjectDetailQuery(id);
  //       const response = await apiClient.get(`/projects?${query}`);

  //       return normalizeResponse(response);
  //     } catch (error) {
  //       handleError(error, 'Failed to fetch Project list');
  //     }
  //   },
};
