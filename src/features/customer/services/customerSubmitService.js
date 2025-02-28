// src/features/customer/services/customerSubmitService.js
import { apiService } from '../../../shared/api/apiService';
import { transformToDBFields } from '../utils/transformUtils';

export const customerSubmitService = {
  /**
   * Customer 기본 정보 생성
   */
  async createCustomerBase(formData) {
    console.log('[Customer] Creating base with formData:', formData);

    try {
      const dbData = transformToDBFields.transformCustomerFields(formData);
      console.log('[Customer] transformToDBFields :', dbData);
      // const response = await apiService.post('/customers', dbData);

      return response.data;
    } catch (error) {
      console.error('[Customer] Creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },
};

/**
 * Customer 전체 제출 처리
 */
export const createCustomer = async (formData) => {
  try {
    console.log('===== Starting Customer Form Submission =====');

    // Customer 기본 정보 생성
    const customerResponse = await customerSubmitService.createCustomerBase(
      formData,
    );
    if (!customerResponse || !customerResponse.data) {
      throw new Error('Customer 기본 정보 생성 실패');
    }

    console.log('===== Customer Form Submission Completed =====');
    return {
      success: true,
      data: {
        ...customerResponse.data,
      },
    };
  } catch (error) {
    console.error('Customer Form Submission Error:', error);
    throw error;
  }
};
