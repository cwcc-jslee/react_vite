/**
 * BizRadar API Service
 * FastAPI 백엔드와 통신하는 API 함수 모음
 *
 * API 엔드포인트: /leads
 * 파라미터:
 *   - source: 출처 (gntp, mss, gyeongnam, bizinfo)
 *   - type: 지원유형 (A,B,C,D,F) - 쉼표 구분, 기본값 A,B,C
 *   - region: 지역 (부분 일치)
 *   - min_date: 마감일 최소값
 *   - skip: 오프셋 (페이지네이션)
 *   - limit: 개수 제한
 *   - status: 상태 필터 (기본값 completed)
 */

import { bizradarApiClient } from '@shared/api/bizradarApiClient';

export const bizradarApi = {
  /**
   * 리드 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.source - 출처 필터 (gntp, mss, gyeongnam, bizinfo)
   * @param {string} params.type - 지원유형 필터 (A,B,C,D,F - 쉼표 구분)
   * @param {string} params.region - 지역 필터 (부분 일치)
   * @param {string} params.min_date - 마감일 최소값 (YYYY-MM-DD)
   * @param {number} params.skip - 페이지네이션 오프셋
   * @param {number} params.limit - 페이지 크기
   * @param {string} params.status - 상태 필터 (기본값: completed)
   */
  getList: async (params = {}) => {
    const {
      page = 1,
      pageSize = 20,
      source,
      type,
      region,
      min_date,
      status = 'completed',
    } = params;

    // 페이지 번호를 skip으로 변환
    const skip = (page - 1) * pageSize;

    const queryParams = {
      skip,
      limit: pageSize,
      status,
    };

    // 출처 필터
    if (source) {
      queryParams.source = source;
    }

    // 지원유형 필터 (쉼표 구분 문자열)
    if (type) {
      queryParams.type = type;
    }

    // 지역 필터
    if (region) {
      queryParams.region = region;
    }

    // 마감일 필터
    if (min_date) {
      queryParams.min_date = min_date;
    }

    const response = await bizradarApiClient.get('/leads', { params: queryParams });
    return response.data;
  },

  /**
   * 리드 상세 조회
   * @param {number} id - 리드 ID
   */
  getDetail: async (id) => {
    const response = await bizradarApiClient.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * 리드 수정
   * @param {number} id - 리드 ID
   * @param {Object} data - 수정할 데이터
   */
  update: async (id, data) => {
    const response = await bizradarApiClient.patch(`/leads/${id}`, data);
    return response.data;
  },

  /**
   * Type D (수동 분류 필요) 목록 조회
   */
  getManualReviewList: async (params = {}) => {
    return bizradarApi.getList({ ...params, type: 'D' });
  },

  /**
   * 리드 검토 확정
   * @param {number} id - 리드 ID
   * @param {Object} data - 확정 데이터 (confirmed_category, review_status, notes)
   */
  confirm: async (id, data) => {
    const response = await bizradarApiClient.patch(`/leads/${id}/confirm`, data);
    return response.data;
  },
};

export default bizradarApi;
