import { useCallback } from 'react';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import { useSfaStore } from './useSfaStore';
import { extractIdsFromObject } from '../../../shared/utils/objectUtils';
import { transformToDBFields } from '../utils/transformUtils';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
import { apiService } from '../../../shared/api/apiService';

/**
 * useSfaSubmit: SFA 폼 제출 관련 로직을 담당하는 커스텀 훅
 */
export const useSfaSubmit = () => {
  const { actions: uiActions } = useUiStore();
  const { form, actions } = useSfaStore();

  // === 유틸리티 함수 ===
  const setFieldError = useCallback(
    (fieldName, errorMessage) => {
      const currentErrors = form.errors || {};
      actions.form.setErrors({
        ...currentErrors,
        [fieldName]: errorMessage,
      });
    },
    [form.errors, actions.form],
  );

  // === 제출 로직 ===
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        // 1. 폼 유효성 검사
        if (!formData || typeof formData !== 'object') {
          throw new Error('폼 데이터가 유효하지 않습니다.');
        }

        console.log('🔧 [useSfaSubmit] 원본 formData:', formData);

        // 2. 데이터 전처리
        // 2-1. sfa 기본 정보 전처리 (salesByPayments 제외)
        const {
          salesByPayments = [],
          salesByItems = [],
          itemAmount,
          paymentAmount,
          ...rawSfaData
        } = formData;

        // {id, name} 형태의 객체에서 id만 추출 (특수 처리 필드는 제외)
        const processedSfaData = extractIdsFromObject(rawSfaData, [
          'description',
        ]);

        // salesByItems를 JSON 형태로 변환
        const safeSalesByItems = Array.isArray(salesByItems)
          ? salesByItems
          : [];

        console.log('🔧 [useSfaSubmit] salesByItems 안전성 확인:', {
          original: salesByItems,
          isArray: Array.isArray(salesByItems),
          safe: safeSalesByItems,
        });

        const transformedSalesItems =
          transformToDBFields.transformSalesByItems(safeSalesByItems);

        // 최종 sfaData 구성
        const sfaData = {
          ...processedSfaData,
          sfaByItems: transformedSalesItems,
        };

        // 2-2. sfa 결제 정보 전처리
        const rawPaymentsData = Array.isArray(salesByPayments)
          ? salesByPayments
          : [];

        // 빈 배열인 경우 빠른 처리
        if (rawPaymentsData.length === 0) {
          console.log(
            '🔧 [useSfaSubmit] 결제 정보가 없습니다. 빈 배열로 처리합니다.',
          );
        }

        // 각 결제 정보에서 {id, name} 형태의 객체에서 id만 추출
        const extractedPaymentsData = rawPaymentsData.map((payment) =>
          extractIdsFromObject(payment, [
            'amount',
            'profitAmount',
            'marginProfitValue',
            'probability',
            'billingType',
            'isConfirmed',
            'isProfit',
            'recognitionDate',
            'scheduledDate',
            'memo',
            'paymentLabel',
          ]),
        );

        // profit_config 부분만 별도 처리
        const paymentsData = extractedPaymentsData.map((payment) => {
          // profit_config JSON 생성
          const profitConfig = {
            is_profit: payment.isProfit,
            margin_profit_value: parseFloat(payment.marginProfitValue || 0),
          };

          return {
            ...payment,
            profitConfig: JSON.stringify(profitConfig),
          };
        });

        console.log('🔧 [useSfaSubmit] 데이터 분리 및 전처리 완료:', {
          rawSfaData,
          salesByItems,
          transformedSalesItems,
          processedSfaData,
          sfaData,
          rawPaymentsData,
          //   extractedPaymentsData,
          paymentsData,
          originalFormData: formData,
        });

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseSfaData = convertKeysToSnakeCase(sfaData);
        const snakeCasePaymentsData = convertKeysToSnakeCase(paymentsData);

        console.log('🔧 [useSfaSubmit] 스네이크케이스 변환 완료:', {
          sfaData: snakeCaseSfaData,
          paymentsData: snakeCasePaymentsData,
        });

        // 4. 데이터 제출
        actions.form.setSubmitting(true);

        console.log('===== Starting SFA Form Submission =====');

        // 4-1. SFA 기본 정보 생성
        console.log(
          '🔧 [useSfaSubmit] SFA 기본 정보 생성 시작:',
          snakeCaseSfaData,
        );
        const sfaResponse = await apiService.post('/sfas', snakeCaseSfaData);

        if (!sfaResponse || !sfaResponse.data) {
          throw new Error('SFA 기본 정보 생성 실패');
        }

        console.log('🔧 [useSfaSubmit] SFA 기본 정보 생성 완료:', sfaResponse);

        // 4-2. 결제 매출 정보 생성
        const sfaId = sfaResponse.data?.id || sfaResponse.data?.data?.id;

        if (!sfaId) {
          console.error(
            '🔧 [useSfaSubmit] SFA ID를 찾을 수 없습니다:',
            sfaResponse,
          );
          throw new Error(
            'SFA ID를 찾을 수 없습니다. 응답 데이터를 확인하세요.',
          );
        }

        console.log('🔧 [useSfaSubmit] 결제 매출 정보 생성 시작:', {
          sfaId,
          paymentsData: snakeCasePaymentsData,
        });

        // 결제 매출 정보가 있는 경우에만 처리
        let paymentsResponse = [];
        if (
          Array.isArray(snakeCasePaymentsData) &&
          snakeCasePaymentsData.length > 0
        ) {
          // 각 payment에 sfa ID 추가하고 API 요청
          const paymentPromises = snakeCasePaymentsData.map(async (payment) => {
            const paymentData = {
              ...payment,
              sfa: sfaId, // SFA ID 연결
            };

            console.log('🔧 [useSfaSubmit] Sending payment data:', paymentData);
            const response = await apiService.post(
              '/sfa-by-payment-withhistory',
              paymentData,
            );
            return response.data;
          });

          // 모든 payment 요청을 병렬로 처리
          paymentsResponse = await Promise.all(paymentPromises);
          console.log(
            '🔧 [useSfaSubmit] All payments created:',
            paymentsResponse,
          );
        } else {
          console.log('🔧 [useSfaSubmit] No payments to create');
        }

        console.log('===== SFA Form Submission Completed =====');

        const response = {
          success: true,
          data: {
            ...sfaResponse.data,
            payments: paymentsResponse,
          },
        };

        if (!response || !response.success) {
          throw new Error(response?.message || '저장에 실패했습니다.');
        }

        notification.success({
          message: '저장 성공',
          description: '성공적으로 저장되었습니다.',
        });

        uiActions.drawer.close();
      } catch (error) {
        const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';
        setFieldError('submit', errorMessage);
        notification.error({
          message: '저장 실패',
          description: errorMessage,
        });
      } finally {
        actions.form.setSubmitting(false);
      }
    },
    [actions.form, uiActions.drawer, setFieldError],
  );

  return {
    handleFormSubmit,
  };
};
