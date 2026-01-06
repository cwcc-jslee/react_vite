// src/features/customer/services/customerSubmitService.js
import { apiService } from '../../../shared/api/apiService';
import {
  processRelationFields,
  removeEmptyFields,
} from '../../../shared/utils/relationFieldUtils';

export const customerSubmitService = {
  /**
   * Customer 기본 정보 생성 (Interceptor가 자동으로 snake_case 변환)
   */
  async createCustomerBase(formData) {
    console.log('[Customer] Creating base with formData:', formData);

    try {
      // 1. 관계 필드 처리 (객체 → ID)
      let processedData = processRelationFields(formData);

      // 2. 빈 값 제거 (빈 문자열, 빈 배열, null, undefined)
      processedData = removeEmptyFields(processedData);

      console.log('[Customer] Processed data:', processedData);

      // Interceptor가 자동으로 camelCase → snake_case 변환
      const response = await apiService.post('/customers', processedData);

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
   * Customer 삭제 기능 (Interceptor가 자동으로 snake_case 변환)
   * isDeleted 필드 업데이트
   * @param {string} customerId - 삭제할 고객 ID
   */
  async deleteCustomer(customerId) {
    console.log('[Customer] Delete customer :', {
      customerId,
    });

    try {
      // Interceptor가 is_deleted로 자동 변환
      const dbData = { isDeleted: true };

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
