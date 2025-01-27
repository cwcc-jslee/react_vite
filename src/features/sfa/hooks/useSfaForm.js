// src/features/sfa/hooks/useSfaForm.js
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../codebook/store/codebookSlice';
import { useDrawerFormData } from './useDrawerFormData';
import { useFormData } from './useFormData';
// import { useFormAction } from './useFormActions';
import { createSfaWithPayment } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import { useSfa } from '../context/SfaProvider';
import { sfaApi } from '../api/sfaApi';
import { sfaSubmitService } from '../services/sfaSubmitService';

/**
 * SFA Form 관련 로직을 관리하는 Custom Hook
 */
export const useSfaForm = () => {
  const { setDrawerClose, setDrawer } = useSfa();
  // const formState = useDrawerFormData();
  const formState = useFormData();
  // const formActions = useFormAction();
  const { formData, setIsSubmitting, setErrors, validateForm } = formState;

  // 금액 일치 확인
  const checkAmounts = () => {
    const itemAmount = parseInt(formData.itemAmount) || 0;
    const paymentAmount = parseInt(formData.paymentAmount) || 0;
    return itemAmount === paymentAmount;
  };

  // 폼 제출 처리
  const processSubmit = async (hasPartner, isProject) => {
    const enrichedFormData = {
      ...formData,
      hasPartner,
      isProject,
    };

    try {
      setIsSubmitting(true);
      const response = await createSfaWithPayment(enrichedFormData);

      if (!response || !response.success) {
        throw new Error(response?.message || '저장에 실패했습니다.');
      }

      notification.success({
        message: '저장 성공',
        description: '성공적으로 저장되었습니다.',
      });

      setDrawerClose();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));

      notification.error({
        message: '저장 실패',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 제출 처리
  const processPaymentSubmit = async (sfaId) => {
    console.log(`***** processPaymentSubmit : `, sfaId);
    try {
      setIsSubmitting(true);
      const paymentsResponse = await sfaSubmitService.addSfaPayment(
        sfaId,
        formData.salesByPayments,
      );

      console.log('===== SFA Form Submission Completed =====');
      // if (!paymentsResponse || !paymentsResponse.success) {
      //   throw new Error(response?.message || '저장에 실패했습니다.');
      // }

      notification.success({
        message: '저장 성공',
        description: '성공적으로 저장되었습니다.',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));

      notification.error({
        message: '저장 실패',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      // 폼데이터 초기화
      const updateData = await sfaApi.getSfaDetail(initialData.id);
      setDrawer({ controlMode: 'view', data: updateData.data[0] });
    }
  };

  return {
    ...formState,
    checkAmounts,
    processSubmit,
    processPaymentSubmit,
    data: formState,
    // actions: formActions,
  };
};
