import { useState, useEffect, useCallback } from 'react';
import { useCustomer } from '../context/CustomerProvider';
import { customerInitialState } from '../../../shared/constants/initialFormState';
import { createCustomer } from '../services/customerSubmitService';
import { notification } from '../../../shared/services/notification';
/**
 * Customer Form 관련 로직을 관리하는 Custom Hook
 */
export const useCustomerForm = () => {
  const { setDrawerClose } = useCustomer();
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(customerInitialState);
  // 에러 상태 관리
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Form Data Changed:', {
      previous: customerInitialState,
      current: formData,
      changes: Object.keys(formData).reduce((diff, key) => {
        if (formData[key] !== customerInitialState[key]) {
          diff[key] = {
            from: customerInitialState[key],
            to: formData[key],
          };
        }
        return diff;
      }, {}),
    });
  }, [formData]);

  /**
   * 입력값 변경 핸들러
   * @param {Object} e - 이벤트 객체
   */
  const updateFormField = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 상태 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  /**
   * 폼 초기화 함수
   * 모든 필드를 초기 상태로 리셋
   */
  const resetForm = () => {
    setFormData(customerInitialState);
    setErrors({});
  };

  // 폼 제출 처리
  const processSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await createCustomer(formData);

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

  // 고객사폼 삭제제 처리 로직
  const processDeleteSubmit = async (processMode, targetId) => {
    try {
      setIsSubmitting(true);

      // processMode에 따른 API 호출
      let response;
      let actionDescription;

      // if (processMode === 'create') {
      //   response = await sfaSubmitService.addSfaPayment(
      //     targetId, // sfaId
      //     formData.salesByPayments,
      //   );
      //   actionDescription = '등록';
      // } else if (processMode === 'update') {
      //   response = await sfaSubmitService.updateSfaPayment(
      //     targetId, // payment documentId
      //     formData.salesByPayments[0],
      //   );
      //   actionDescription = '수정';
      // } else
      if (processMode === 'delete') {
        response = await sfaSubmitService.deleteSfaPayment(targetId);
        actionDescription = '삭제';
      }

      notification.success({
        message: '저장 성공',
        description: `성공적으로 ${actionDescription}되었습니다.`,
      });

      // 데이터 갱신 및 뷰 모드로 전환
      // const updateData = await sfaApi.getSfaDetail(sfaId);
      // setDrawer({
      //   controlMode: 'view',
      //   data: updateData.data[0],
      // });
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
    // 폼 상태관리
    formData,
    errors,
    updateFormField, // 기존 handleChange
    setFormData, //확인후 삭제
    setErrors,
    //
    isSubmitting,
    setIsSubmitting,
    processSubmit,
    //
    resetForm,
  };
};
