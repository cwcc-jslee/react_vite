// src/features/sfa/hooks/useSfaForm.js
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormData } from './useFormData';
import { useFormValidation } from './useFormValidation';
import { createSfaWithPayment } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import { sfaApi } from '../api/sfaApi';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { useUiStore } from '../../../shared/hooks/useUiStore';

/**
 * SFA Form 관련 로직을 관리하는 Custom Hook
 */
export const useSfaForm = () => {
  const dispatch = useDispatch();
  const { drawer, actions } = useUiStore();
  const formState = useFormData(drawer);
  const { formData, setIsSubmitting, setErrors } = formState;
  const { validateForm, checkAmounts } = useFormValidation(formData);

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

      actions.drawer.close();
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

  // 결제매출 제출 처리 로직
  const processPaymentSubmit = async (processMode, targetId, sfaId) => {
    try {
      setIsSubmitting(true);

      // processMode에 따른 API 호출
      let response;
      let actionDescription;

      if (processMode === 'create') {
        response = await sfaSubmitService.addSfaPayment(
          targetId, // sfaId
          formData.salesByPayments,
        );
        actionDescription = '등록';
      } else if (processMode === 'update') {
        response = await sfaSubmitService.updateSfaPayment(
          targetId, // payment documentId
          formData.salesByPayments[0],
        );
        actionDescription = '수정';
      } else if (processMode === 'delete') {
        response = await sfaSubmitService.deleteSfaPayment(targetId);
        actionDescription = '삭제';
      }

      notification.success({
        message: '저장 성공',
        description: `성공적으로 ${actionDescription}되었습니다.`,
      });

      // 데이터 갱신 및 뷰 모드로 전환
      const updateData = await sfaApi.getSfaDetail(sfaId);
      actions.drawer.update({
        controlMode: 'view',
        data: updateData.data[0],
      });
    } catch (error) {
      console.error('Payment submission error:', error);
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

  return {
    ...formState,
    validateForm,
    checkAmounts,
    processSubmit,
    processPaymentSubmit,
  };
};
