/**
 * 프로젝트 서비스 - API 통신 및 데이터 처리를 담당
 * 프로젝트 CRUD 작업과 관련된 모든 API 호출 및 데이터 변환을 처리합니다.
 *
 * @version 1.0.0
 * @filename src/features/project/services/projectService.js
 */

import { apiService } from '../../../shared/api/apiService';
import { apiClient } from '../../../shared/api/apiClient';
import { handleApiError } from '../../../shared/api/errorHandlers';
import {
  buildProjectListQuery,
  buildProjectDetailQuery,
  buildProjectTaskListQuery,
} from '../api/queries';
import { normalizeResponse } from '../../../shared/api/normalize';
import qs from 'qs';

export const projectApiService = {
  /**
   * 프로젝트트 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getProjectList: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectListQuery(params);
      const response = await apiService.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 상세세 조회
   * @param {Object} id - 검색 파라미터
   */
  getProjectDetail: async (projectId) => {
    console.log(`>>>> getProjectDetail : `, projectId);
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectDetailQuery(projectId);
      console.log(`>>>> buildProjectDetailQuery : `, query);
      const response = await apiService.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      console.error(error);
      handleApiError(error, '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트트 Task 템플릿 조회
   */
  getTaskTemplate: async (templateId = null) => {
    try {
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
    } catch (error) {
      handleApiError(
        error,
        '프로젝트 템플릿을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * 새 프로젝트 생성
   * @param {Object} projectData - 저장할 프로젝트 데이터
   * @returns {Promise} API 응답 Promise
   */
  createProject: async (projectData) => {
    try {
      const response = await apiService.post('/projects', projectData);
      return response.data;
    } catch (error) {
      handleApiError(error, '프로젝트 생성 중 오류가 발생했습니다.');
    }
  },
};
