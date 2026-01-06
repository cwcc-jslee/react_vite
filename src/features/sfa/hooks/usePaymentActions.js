/**
 * 결제매출 액션 관리 Hook
 * - 결제매출 추가/삭제 로직
 * - SfaStore와 연동
 */

import { useCallback } from 'react';
import { useSfaStore } from './useSfaStore.js';
import { createNewPayment, canAddPayment } from '../utils/paymentUtils.js';

const MAX_PAYMENT_LIMIT = 12;

export const usePaymentActions = (data) => {
  const { form, actions: sfaActions } = useSfaStore();

  /**
   * 새로운 결제매출 추가
   */
  const addPayment = useCallback(() => {
    const currentPayments = form.data.sfaDraftPayments || [];

    // 최대 개수 체크
    if (!canAddPayment(currentPayments, MAX_PAYMENT_LIMIT)) {
      console.warn(`최대 ${MAX_PAYMENT_LIMIT}개까지만 추가할 수 있습니다.`);
      return false;
    }

    // 새 결제매출 생성
    const newPayment = createNewPayment(data);
    const newPayments = [...currentPayments, newPayment];

    // Store 업데이트
    sfaActions.form.updateField('sfaDraftPayments', newPayments);

    console.log('결제매출 추가:', newPayments.length, '개');
    console.log('teamAllocations:', newPayment.teamAllocations);

    return true;
  }, [data, form.data.sfaDraftPayments, sfaActions]);

  /**
   * 결제매출 삭제
   */
  const removePayment = useCallback(
    (index) => {
      const currentPayments = form.data.sfaDraftPayments || [];
      const newPayments = currentPayments.filter((_, i) => i !== index);

      sfaActions.form.updateField('sfaDraftPayments', newPayments);

      console.log('결제매출 삭제:', index, '→ 남은 개수:', newPayments.length);
    },
    [form.data.sfaDraftPayments, sfaActions],
  );

  /**
   * 모든 임시 결제매출 초기화
   */
  const clearDraftPayments = useCallback(() => {
    sfaActions.form.updateField('sfaDraftPayments', []);
  }, [sfaActions]);

  return {
    // 액션
    addPayment,
    removePayment,
    clearDraftPayments,

    // 상태
    draftPayments: form.data.sfaDraftPayments || [],
    draftPaymentsCount: (form.data.sfaDraftPayments?.length || 0),
    canAddMore: canAddPayment(form.data.sfaDraftPayments, MAX_PAYMENT_LIMIT),
    maxLimit: MAX_PAYMENT_LIMIT,
    isSubmitting: form.isSubmitting,
  };
};
