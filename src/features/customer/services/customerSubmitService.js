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
      const response = await apiService.post('/customers', dbData);

      return response.data;
    } catch (error) {
      console.error('[Customer] Creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },
  /**
   * Customer 기본 필드 수정
   * @param {string} id - Customer ID
   * @param {Object} formData - 수정할 데이터
   */
  async updateCustomerBase(id, formData) {
    console.log('[Cusotmer] Updating field with formData:', formData);

    try {
      // API 요청 수행
      const response = await apiService.put(`/customers/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error('[Customer] Update error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * Customer 삭제 기능
   * is_deleted 필드 업데이트트
   * @param {string} customerId - 삭제할 고객 ID
   */
  async deleteCustomer(customerId) {
    console.log('[Customer] Delete customer :', {
      customerId,
    });

    try {
      const dbData = { is_deleted: true };

      const response = await apiService.put(`/customers/${customerId}`, dbData);

      console.log('[Customer] Delete customer : ', response.data);
      return response.data;
    } catch (error) {
      console.error('[Customer] Delete customer error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '고객 정보 삭제 중 오류가 발생했습니다.',
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
