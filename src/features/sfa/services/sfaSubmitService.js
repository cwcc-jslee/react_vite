// src/features/sfa/services/sfaSubmitService.js
import { apiService } from '../../../shared/services/apiService';
import { transformToDBFields } from '../utils/transformUtils';

/**
 * SFA 데이터 제출 서비스
 */
export const sfaSubmitService = {
  /**
   * SFA 기본 정보 생성
   * @param {Object} formData - SFA 폼 데이터
   * @returns {Promise<Object>} 생성된 SFA 데이터
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
   * SFA 결제 매출 정보 생성
   * @param {string|number} sfaId - 생성된 SFA ID
   * @param {Array} salesPayments - 결제 매출 데이터 배열
   * @returns {Promise<Array>} 생성된 결제 매출 데이터 배열
   */
  async createSalesByPayments(sfaId, salesPayments) {
    console.log('[SFA] Creating payments:', { sfaId, salesPayments });

    try {
      // 각 payment 데이터를 변환하고 API 요청을 생성
      const promises = salesPayments.map(async (payment) => {
        const dbData = transformToDBFields.transformSalesByPayments(payment);
        const paymentData = {
          ...dbData,
          sfa: sfaId, // SFA ID 연결
        };

        console.log('[SFA] Sending payment data:', paymentData);
        const response = await apiService.post(
          '/api/sfa-by-payments',
          paymentData,
        );
        return response.data;
      });

      // 모든 payment 요청을 병렬로 처리
      const results = await Promise.all(promises);
      console.log('[SFA] All payments created:', results);
      return results;
    } catch (error) {
      console.error('[SFA] Payment creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '결제 매출 데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },
};

/**
 * SFA 전체 제출 처리
 * @param {Object} formData - SFA 폼 전체 데이터
 * @returns {Promise<Object>} 처리 결과
 */
export const submitSfaForm = async (formData) => {
  try {
    console.log('===== Starting SFA Form Submission =====');

    // 1. SFA 기본 정보 생성
    const sfaResponse = await sfaSubmitService.createSfaBase(formData);
    if (!sfaResponse || !sfaResponse.data) {
      throw new Error('SFA 기본 정보 생성 실패');
    }

    // 2. 결제 매출 정보 생성
    const sfaId = sfaResponse.data.id;
    const paymentsResponse = await sfaSubmitService.createSalesByPayments(
      sfaId,
      formData.salesByPayments,
    );

    console.log('===== SFA Form Submission Completed =====');
    return {
      success: true,
      data: {
        ...sfaResponse.data,
        payments: paymentsResponse,
      },
    };
  } catch (error) {
    console.error('SFA Form Submission Error:', error);
    throw error;
  }
};
