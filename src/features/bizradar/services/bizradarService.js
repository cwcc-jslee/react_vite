/**
 * BizRadar 서비스
 * 비즈니스 로직 및 데이터 변환
 */
import { bizradarApi } from '../api/bizradarApi';

export const bizradarService = {
  /**
   * 공고 목록 조회
   * @param {Object} params - 조회 파라미터
   */
  getList: async (params) => {
    try {
      const response = await bizradarApi.getList(params);
      return {
        data: response.data || response.items || response,
        meta: {
          total: response.total || 0,
          page: response.page || params.page || 1,
          pageSize: response.page_size || params.page_size || 20,
        },
      };
    } catch (error) {
      console.error('BizRadar getList error:', error);
      throw error;
    }
  },

  /**
   * 공고 상세 조회
   * @param {number} id - 공고 ID
   */
  getDetail: async (id) => {
    try {
      const response = await bizradarApi.getDetail(id);
      return response;
    } catch (error) {
      console.error('BizRadar getDetail error:', error);
      throw error;
    }
  },

  /**
   * 공고 수정
   * @param {number} id - 공고 ID
   * @param {Object} data - 수정 데이터
   */
  update: async (id, data) => {
    try {
      // 수정 가능한 필드만 추출
      const allowedFields = ['tags', 'summary', 'submission_status', 'final_support_type'];
      const updateData = {};

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      const response = await bizradarApi.update(id, updateData);
      return response;
    } catch (error) {
      console.error('BizRadar update error:', error);
      throw error;
    }
  },

  /**
   * 검색 파라미터 정규화
   * @param {Object} filters - 필터 조건
   */
  normalizeFilters: (filters) => {
    const normalized = {};

    // null, undefined, 빈 문자열 제거
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        normalized[key] = value;
      }
    });

    return normalized;
  },

  /**
   * 지원 유형 라벨 변환
   * @param {string} type - 지원 유형 코드
   */
  getSupportTypeLabel: (type) => {
    const labels = {
      A: 'A등급 (적합)',
      B: 'B등급 (양호)',
      C: 'C등급 (보통)',
      D: 'D등급 (부적합)',
      F: 'F등급 (해당없음)',
    };
    return labels[type] || type;
  },

  /**
   * 신뢰도 라벨 변환
   * @param {string} level - 신뢰도
   */
  getConfidenceLabel: (level) => {
    const labels = {
      High: '높음',
      Medium: '보통',
      Low: '낮음',
    };
    return labels[level] || level;
  },
};

export default bizradarService;
