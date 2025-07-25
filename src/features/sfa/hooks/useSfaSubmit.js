import { useCallback } from 'react';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import { useSfaStore } from './useSfaStore';
import { extractIdsFromObject } from '../../../shared/utils/objectUtils';
import { transformToDBFields } from '../utils/transformUtils';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
import { apiService } from '../../../shared/api/apiService';
import { sfaApi } from '../api/sfaApi';

/**
 * useSfaOperations: SFA 관련 모든 작업을 담당하는 커스텀 훅
 * - SFA 생성, 결제매출 CRUD 작업 등을 포함
 */
export const useSfaOperations = () => {
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

  // === SFA 생성 로직 ===
  const createSfa = useCallback(
    async (formData) => {
      try {
        // 1. 폼 유효성 검사
        if (!formData || typeof formData !== 'object') {
          throw new Error('폼 데이터가 유효하지 않습니다.');
        }

        console.log('🔧 [useSfaOperations] 원본 formData:', formData);

        // 2. 데이터 전처리
        // 2-1. sfa 기본 정보 전처리 (sfaByPayments 제외)
        const {
          sfaByPayments = [],
          sfaByItems = [],
          itemAmount,
          paymentAmount,
          ...rawSfaData
        } = formData;

        // {id, name} 형태의 객체에서 id만 추출 (특수 처리 필드는 제외)
        const processedSfaData = extractIdsFromObject(rawSfaData, [
          'description',
        ]);

        // sfaByItems를 JSON 형태로 변환
        const safeSfaByItems = Array.isArray(sfaByItems) ? sfaByItems : [];

        console.log('🔧 [useSfaOperations] sfaByItems 안전성 확인:', {
          original: sfaByItems,
          isArray: Array.isArray(sfaByItems),
          safe: safeSfaByItems,
        });

        const transformedSalesItems =
          transformToDBFields.transformSalesByItems(safeSfaByItems);

        // 최종 sfaData 구성
        const sfaData = {
          ...processedSfaData,
          sfaByItems: transformedSalesItems,
        };

        // 2-2. sfa 결제 정보 전처리
        const rawPaymentsData = Array.isArray(sfaByPayments)
          ? sfaByPayments
          : [];

        // 빈 배열인 경우 빠른 처리
        if (rawPaymentsData.length === 0) {
          console.log(
            '🔧 [useSfaOperations] 결제 정보가 없습니다. 빈 배열로 처리합니다.',
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

          // isProfit, marginProfitValue 키 제외한 새로운 객체 생성
          const { isProfit, marginProfitValue, ...cleanedPayment } = payment;

          return {
            ...cleanedPayment,
            profitConfig: JSON.stringify(profitConfig),
            // scheduled_date 빈 문자열 처리
            scheduledDate:
              payment.scheduledDate && payment.scheduledDate.trim() !== ''
                ? payment.scheduledDate
                : null,
          };
        });

        // 3. 키 정보 스네이크케이스로 변환
        const snakeCaseSfaData = convertKeysToSnakeCase(sfaData);
        const snakeCasePaymentsData = convertKeysToSnakeCase(paymentsData);

        console.log('🔧 [useSfaOperations] 스네이크케이스 변환 완료:', {
          sfaData: snakeCaseSfaData,
          paymentsData: snakeCasePaymentsData,
        });

        // 4. 데이터 제출
        actions.form.setSubmitting(true);

        console.log('===== Starting SFA Form Submission =====');

        // 4-1. SFA 기본 정보 생성
        console.log(
          '🔧 [useSfaOperations] SFA 기본 정보 생성 시작:',
          snakeCaseSfaData,
        );
        const sfaResponse = await apiService.post('/sfas', snakeCaseSfaData);

        if (!sfaResponse || !sfaResponse.data) {
          throw new Error('SFA 기본 정보 생성 실패');
        }

        console.log(
          '🔧 [useSfaOperations] SFA 기본 정보 생성 완료:',
          sfaResponse,
        );

        // 4-2. 결제 매출 정보 생성
        const sfaId = sfaResponse.data?.id || sfaResponse.data?.data?.id;

        if (!sfaId) {
          console.error(
            '🔧 [useSfaOperations] SFA ID를 찾을 수 없습니다:',
            sfaResponse,
          );
          throw new Error(
            'SFA ID를 찾을 수 없습니다. 응답 데이터를 확인하세요.',
          );
        }

        console.log('🔧 [useSfaOperations] 결제 매출 정보 생성 시작:', {
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

            console.log(
              '🔧 [useSfaOperations] Sending payment data:',
              paymentData,
            );
            const response = await apiService.post(
              '/sfa-by-payment-withhistory',
              paymentData,
            );
            return response.data;
          });

          // 모든 payment 요청을 병렬로 처리
          paymentsResponse = await Promise.all(paymentPromises);
          console.log(
            '🔧 [useSfaOperations] All payments created:',
            paymentsResponse,
          );
        } else {
          console.log('🔧 [useSfaOperations] No payments to create');
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

  // === 결제매출 데이터 전처리 공통 함수 ===
  const processPaymentData = useCallback((paymentData) => {
    console.log('🔍 [processPaymentData] 입력 데이터:', paymentData);

    // {id, name} 형태의 객체에서 id만 추출
    const extractedData = extractIdsFromObject(paymentData, [
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
    ]);

    console.log(
      '🔍 [processPaymentData] extractIdsFromObject 결과:',
      extractedData,
    );

    // profit_config 부분만 별도 처리 (createSfa와 동일한 방식)
    const profitConfig = {
      is_profit: extractedData.isProfit,
      margin_profit_value: parseFloat(extractedData.marginProfitValue || 0),
    };

    // createSfa와 동일하게 중복 키 제거하지 않음
    const result = {
      ...extractedData,
      profitConfig: JSON.stringify(profitConfig),
      // scheduled_date 빈 문자열 처리
      scheduledDate:
        extractedData.scheduledDate && extractedData.scheduledDate.trim() !== ''
          ? extractedData.scheduledDate
          : null,
    };

    console.log('🔍 [processPaymentData] 최종 결과:', result);
    return result;
  }, []);

  // === 결제매출 작업 처리 로직 ===
  const processPaymentOperation = useCallback(
    async (processMode, targetId) => {
      try {
        actions.form.setSubmitting(true);

        // processMode에 따른 API 호출
        let response;
        let actionDescription;
        let processedData;

        if (processMode === 'add') {
          console.log('>>>(add) sfaDraftPayments', form.data.sfaDraftPayments);

          // add: 배열 데이터 전처리 (addSfaPayment와 동일한 방식으로 변경)
          const rawPaymentsData = Array.isArray(form.data.sfaDraftPayments)
            ? form.data.sfaDraftPayments
            : [];

          // transformsfaByPayments 사용 (addSfaPayment와 동일)
          const preprocessedData = rawPaymentsData.map((payment) =>
            transformToDBFields.transformSalesByPayments(payment),
          );

          // 각 payment에 sfa ID 추가 (addSfaPayment와 동일한 방식)
          processedData = preprocessedData.map((payment) => ({
            ...payment,
            sfa: targetId, // sfaId 연결
          }));

          console.log('>>>(add) 최종 처리된 데이터:', processedData);

          // 각 payment별로 개별 API 호출 (병렬 처리)
          const paymentPromises = processedData.map(async (payment, index) => {
            console.log(`🚀 [API 호출 ${index + 1}] 전송 데이터:`, payment);
            console.log(`🚀 [API 호출 ${index + 1}] 데이터 타입 확인:`, {
              amount: typeof payment.amount,
              sfa: typeof payment.sfa,
              profitConfig: typeof payment.profit_config,
              isProfit: typeof payment.is_profit,
              marginProfitValue: typeof payment.margin_profit_value,
            });

            try {
              const response = await apiService.post(
                '/sfa-by-payment-withhistory',
                payment,
              );
              console.log(
                `✅ [API 호출 ${index + 1}] 성공 응답:`,
                response.data,
              );
              return response.data;
            } catch (error) {
              console.error(`❌ [API 호출 ${index + 1}] 실패:`, error);
              console.error(
                `❌ [API 호출 ${index + 1}] 오류 상세:`,
                error.response?.data,
              );
              throw error;
            }
          });

          // 모든 payment 요청을 병렬로 처리
          const paymentsResponse = await Promise.all(paymentPromises);
          console.log('>>>(add) All payments created:', paymentsResponse);

          response = { success: true, data: paymentsResponse };
          actionDescription = '등록';
        } else if (processMode === 'update') {
          console.log(
            '>>>(update) sfaDraftPayments',
            form.data.sfaDraftPayments,
          );

          // update: documentId, id 키 제거 후 단일 데이터 전처리
          const {
            documentId,
            id: paymentId,
            ...rawUpdateData
          } = form.data.sfaDraftPayments[0];
          console.log('>>>(update) 키 제거 후 데이터:', rawUpdateData);

          // transformSalesByPaymentsEdit 사용 (updateSfaPayment와 동일)
          processedData =
            transformToDBFields.transformSalesByPaymentsEdit(rawUpdateData);

          console.log('>>>(update) 최종 처리된 데이터:', processedData);

          // update API 호출 (updateSfaPayment와 동일한 엔드포인트)
          response = await apiService.put(
            `/sfa-by-payment-withhistory/${paymentId}`, // payment documentId
            processedData,
          );
          actionDescription = '수정';
        } else if (processMode === 'delete') {
          console.log('>>>(delete) paymentId:', targetId);

          // delete: is_deleted 필드 업데이트 (deleteSfaPayment와 동일)
          const deleteData = { is_deleted: true };

          console.log('>>>(delete) 삭제 데이터:', targetId);

          // delete API 호출 (deleteSfaPayment와 동일한 엔드포인트)
          response = await apiService.put(
            `/sfa-by-payments/${targetId}`, // payment documentId
            deleteData,
          );
          actionDescription = '삭제';
        }

        notification.success({
          message: '저장 성공',
          description: `성공적으로 ${actionDescription}되었습니다.`,
        });

        // 성공적으로 처리됨을 반환 (UI 갱신은 컴포넌트에서 처리)
        return { success: true, actionDescription };
      } catch (error) {
        console.error('Payment submission error:', error);
        const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';

        const currentErrors = form.errors || {};
        actions.form.setErrors({
          ...currentErrors,
          submit: errorMessage,
        });

        notification.error({
          message: '저장 실패',
          description: errorMessage,
        });

        // 에러 상태 반환 (컴포넌트에서 처리할 수 있도록)
        return { success: false, error: errorMessage };
      } finally {
        actions.form.setSubmitting(false);
      }
    },
    [
      actions.form,
      uiActions.drawer,
      form.data.sfaDraftPayments,
      form.errors,
      processPaymentData,
    ],
  );

  return {
    createSfa,
    processPaymentOperation,
  };
};
