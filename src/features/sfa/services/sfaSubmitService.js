// src/features/sfa/services/sfaSubmitService.js
import { apiService } from '../../../shared/api/apiService';
import { transformToDBFields } from '../utils/transformUtils';
import { useSfa } from '../context/SfaProvider';
// import { sfaApi } from '../api/sfaApi';
/**
 * createSfaWithPayment
 * updateSfaBase
 * addSfaPayment
 * updateSfaPayment
 */

// const { fetchSfaDetail, setDrawerState, drawerState } = useSfa();
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
      const response = await apiService.post('/sfas', dbData);
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
  async addSfaPayment(sfaId, salesPayments) {
    console.log('[SFA] Creating payments with history:', {
      sfaId,
      salesPayments,
    });

    // 배열 안전성 확인
    if (!Array.isArray(salesPayments)) {
      console.warn(
        '[SFA] salesPayments is not an array, returning empty array',
      );
      return [];
    }

    // 빈 배열인 경우 빠른 반환
    if (salesPayments.length === 0) {
      console.log('[SFA] No payments to create, returning empty array');
      return [];
    }

    try {
      // 각 payment 데이터를 변환하고 API 요청을 생성
      const promises = salesPayments.map(async (payment) => {
        const dbData = transformToDBFields.transformSalesByPayments(payment);
        const paymentData = {
          ...dbData,
          sfa: sfaId, // SFA ID 연결
        };

        console.log('[SFA] Sending payment data with history:', paymentData);
        // 새로운 엔드포인트 사용
        const response = await apiService.post(
          '/sfa-by-payment-withhistory',
          paymentData,
        );
        return response.data;
      });

      // 모든 payment 요청을 병렬로 처리
      const results = await Promise.all(promises);
      console.log('[SFA] All payments created with history:', results);
      return results;
    } catch (error) {
      console.error('[SFA] Payment creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '결제 매출 데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * SFA 결제 매출 정보 수정 (히스토리 포함)
   * @param {string} paymentId - 수정할 결제 매출 ID
   * @param {Object} paymentData - 수정할 결제 매출 데이터
   * @returns {Promise<Object>} 수정된 결제 매출 데이터
   */
  async updateSfaPayment(paymentId, paymentData) {
    console.log('[SFA] Updating payment with history:', {
      paymentId,
      paymentData,
    });

    try {
      const dbData =
        transformToDBFields.transformSalesByPaymentsEdit(paymentData);

      const response = await apiService.put(
        `/sfa-by-payment-withhistory/${paymentId}`,
        dbData,
      );

      console.log('[SFA] Payment updated with history:', response.data);
      return response.data;
    } catch (error) {
      console.error('[SFA] Payment update error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '결제 매출 데이터 수정 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * SFA 결제 매출 삭제 기능
   * is_deleted 필드 업데이트트
   * @param {string} paymentId - 수정할 결제 매출 ID
   */
  async deleteSfaPayment(paymentId) {
    console.log('[SFA] Delete payment :', {
      paymentId,
    });

    try {
      const dbData = { is_deleted: true };

      const response = await apiService.put(
        `/sfa-by-payments/${paymentId}`,
        dbData,
      );

      console.log('[SFA] Delete payment : ', response.data);
      return response.data;
    } catch (error) {
      console.error('[SFA] Delete payment error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '결제 매출 데이터 삭제 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * SFA 기본 필드 수정
   * @param {string} id - SFA ID
   * @param {Object} formData - 수정할 데이터
   */
  async updateSfaBase(id, formData) {
    // const formData = { [fieldName]: value };
    console.log('[SFA] Updating field with formData:', formData);

    try {
      // DB 필드 형식으로 데이터 변환
      // const dbData = transformToDBFields.transformSfaFields(formData);

      // API 요청 수행
      const response = await apiService.put(`/sfas/${id}`, formData);

      // 정상 업데이트시 fetchSfaDetail 수행
      // const response1 = await sfaApi.getSfaDetail(1060);
      // setDrawerState({
      //   ...drawerState,
      //   data: response1.data[0],
      // });
      // if (response.data) {
      //   //
      // }
      return response.data;
    } catch (error) {
      console.error('[SFA] Update error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * SFA 고객사 정보 생성
   * @param {string|number} sfaId - 생성된 SFA ID
   * @param {Array} customers - 고객사 정보 배열
   * @returns {Promise<Array>} 생성된 고객사 정보 배열
   */
  async addSfaCustomers(sfaId, customers) {
    console.log('[SFA] Creating customers:', {
      sfaId,
      customers,
    });

    // 배열 안전성 확인
    if (!Array.isArray(customers)) {
      console.warn('[SFA] customers is not an array, returning empty array');
      return [];
    }

    // 빈 배열인 경우 빠른 반환
    if (customers.length === 0) {
      console.log('[SFA] No customers to create, returning empty array');
      return [];
    }

    try {
      // 각 customer 데이터를 변환하고 API 요청을 생성
      const promises = customers.map(async (customer) => {
        const customerData = {
          sfa: sfaId,
          customer: customer.customer,
          is_revenue_source: customer.isRevenueSource,
          is_end_customer: customer.isEndCustomer,
        };

        console.log('[SFA] Sending customer data:', customerData);
        // 새로운 엔드포인트 사용
        const response = await apiService.post('/sfa-customers', customerData);
        return response.data;
      });

      // 모든 customer 요청을 병렬로 처리
      const results = await Promise.all(promises);
      console.log('[SFA] All customers created:', results);
      return results;
    } catch (error) {
      console.error('[SFA] Customer creation error:', error);
      throw new Error(
        error.response?.data?.error?.message ||
          '고객사 정보 저장 중 오류가 발생했습니다.',
      );
    }
  },
};

/**
 * SFA 전체 제출 처리
 * @param {Object} formData - SFA 폼 전체 데이터
 * @returns {Promise<Object>} 처리 결과
 */
export const createSfaWithPayment = async (formData) => {
  try {
    console.log('===== Starting SFA Form Submission =====');

    // 1. SFA 기본 정보 생성
    const sfaResponse = await sfaSubmitService.createSfaBase(formData);
    if (!sfaResponse || !sfaResponse.data) {
      throw new Error('SFA 기본 정보 생성 실패');
    }

    // 2. 고객사 정보 생성
    const sfaId = sfaResponse.data.id;
    // const customersResponse = await sfaSubmitService.addSfaCustomers(
    //   sfaId,
    //   formData.sfaCustomers,
    // );

    // if (!customersResponse) {
    //   throw new Error('고객사 정보 생성 실패');
    // }
    console.log('>>salesByPayments : ', formData.salesByPayments);

    // 3. 결제 매출 정보 생성
    const paymentsResponse = await sfaSubmitService.addSfaPayment(
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
