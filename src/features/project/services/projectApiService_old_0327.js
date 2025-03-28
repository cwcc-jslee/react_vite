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

export const projectApiService = {
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

  /**
   * 프로젝트트 Task 템플릿 조회
   */
  getTaskTemplate: async (templateId = null) => {
    let query;

    if (templateId === null) {
      // 템플릿 ID가 없을 때: 템플릿 목록 조회
      query = qs.stringify(
        {
          filters: {
            is_deleted: { $eq: false },
          },
          fields: ['name'],
          sort: ['sort:asc'],
        },
        { encodeValuesOnly: true },
      );
    } else {
      // 템플릿 ID가 있을 때: 특정 템플릿 상세 정보 조회
      query = qs.stringify(
        {
          filters: {
            id: { $eq: templateId },
            // is_deleted: { $eq: false },
          },
          fields: ['name', 'structure'],
        },
        { encodeValuesOnly: true },
      );
    }

    const response = await apiClient.get(`/codebook-project-tasks?${query}`);
    return response.data;
  },
};
