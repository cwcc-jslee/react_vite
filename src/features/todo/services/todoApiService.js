/**
 * 작업 서비스 - API 통신 및 데이터 처리를 담당
 * 작업 CRUD 작업과 관련된 모든 API 호출 및 데이터 변환을 처리합니다.
 *
 * @version 1.0.0
 * @filename src/features/todo/services/todoApiService.js
 */

import { apiService } from '@shared/api/apiService';
import { handleApiError } from '@shared/api/errorHandlers';
import { buildWorkListQuery } from '../../work/api/queries';
import { buildProjectTaskListQuery } from '../api/queries';
import { normalizeResponse } from '@shared/api/normalize';
import qs from 'qs';

export const todoApiService = {
  /**
   * Todo 목록 조회
   */
  getTodoList: async (params) => {
    try {
      const query = buildProjectTaskListQuery(params);
      const response = await apiService.get(`/project-tasks?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      console.error('[API] getTodoList error:', error);
      throw error;
    }
  },

  /**
   * Work 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getWorkList: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildWorkListQuery(params);
      const response = await apiService.get(`/works?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '작업업 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 새 Work 생성
   * @param {Object} workData - 저장할 작업 데이터
   * @returns {Promise} API 응답 Promise
   */
  createWork: async (workData) => {
    try {
      const response = await apiService.post('/works', workData);
      return response.data;
    } catch (error) {
      handleApiError(error, '작업업 생성 중 오류가 발생했습니다.');
    }
  },
};
