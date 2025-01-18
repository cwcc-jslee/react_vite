// src/features/sfa/services/sfaSubmitService.js
import { apiService } from '../../../shared/services/apiService';
import { transformToDBFields } from '../utils/transformUtils';

/**
 * SFA 데이터 제출 서비스
 */
export const sfaSubmitService = {
  /**
   * SFA 기본 정보 생성
   */
  async createSfaBase(formData) {
    console.log('[SFA] Creating base with formData:', formData);

    try {
      const dbData = transformToDBFields.transformSfaFields(formData);
      const response = await apiService.post('/api/sfas', dbData);
      return response.data;
    } catch (error) {
      console.error('[SFA] Creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * SFA 매출 아이템 생성
   */
  // async createSalesItems(sfaId, salesItems) {
  //   const promises = salesItems.map((item) => {
  //     const dbData = transformToDBFields.transformSalesItem(item);
  //     return apiService.post('/api/sfa-items', { ...dbData, sfa: sfaId });
  //   });

  //   return Promise.all(promises);
  // },
};

/**
 * SFA 전체 제출 처리
 */
export const submitSfaForm = async (formData) => {
  try {
    console.log('===== Starting SFA Form Submission =====');

    const sfaResponse = await sfaSubmitService.createSfaBase(formData);
    if (!sfaResponse || !sfaResponse.data) {
      throw new Error('SFA 기본 정보 생성 실패');
    }

    return {
      success: true,
      data: sfaResponse.data,
    };
  } catch (error) {
    console.error('SFA Form Submission Error:', error);
    throw error;
  }
};
