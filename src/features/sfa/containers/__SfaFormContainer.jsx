// src/features/sfa/containers/SfaFormContainer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../codebook/store/codebookSlice';
// import { selectCodebookByType } from '../../../../codebook/store/codebookSlice';
import { useDrawerFormData } from '../hooks/useDrawerFormData';
import { submitSfaAddForm } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import SfaAddForm from '../components/forms/SfaAddForm';

/**
 * SFA Form의 비즈니스 로직과 상태를 관리하는 컨테이너 컴포넌트
 * @param {Object} props
 * @param {Function} props.onClose - Drawer를 닫는 함수
 */
const SfaFormContainer = ({ onClose }) => {
  // Form 데이터 및 상태 관리 훅 사용
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    setErrors,
    handleChange,
    handleCustomerSelect,
    handleAddSalesItem,
    handleSalesItemChange,
    handleRemoveSalesItem,
    handleSalesPaymentChange,
    handleAddSalesPayment,
    handleRemoveSalesPayment,
    isItemsLoading,
    itemsData,
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
    validateForm,
  } = useDrawerFormData();

  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  /**
   * 금액이 일치하는지 확인하는 함수
   */
  const checkAmounts = () => {
    const itemAmount = parseInt(formData.itemAmount) || 0;
    const paymentAmount = parseInt(formData.paymentAmount) || 0;
    return itemAmount === paymentAmount;
  };

  /**
   * 폼 제출 처리 함수
   */
  const processSubmit = async (hasPartner, isProject) => {
    const enrichedFormData = {
      ...formData,
      hasPartner,
      isProject,
    };

    try {
      setIsSubmitting(true);
      const response = await submitSfaAddForm(enrichedFormData);

      if (!response || !response.success) {
        throw new Error(response?.message || '저장에 실패했습니다.');
      }

      notification.success({
        message: '저장 성공',
        description: '성공적으로 저장되었습니다.',
      });

      if (onClose) onClose();
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

  return (
    <SfaAddForm
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      sfaSalesTypeData={sfaSalesTypeData}
      sfaClassificationData={sfaClassificationData}
      itemsData={itemsData}
      isItemsLoading={isItemsLoading}
      paymentMethodData={paymentMethodData}
      percentageData={percentageData}
      isPaymentDataLoading={isPaymentDataLoading}
      handleCustomerSelect={handleCustomerSelect}
      handleChange={handleChange}
      handleAddSalesItem={handleAddSalesItem}
      handleSalesItemChange={handleSalesItemChange}
      handleRemoveSalesItem={handleRemoveSalesItem}
      handleSalesPaymentChange={handleSalesPaymentChange}
      handleAddSalesPayment={handleAddSalesPayment}
      handleRemoveSalesPayment={handleRemoveSalesPayment}
      onSubmit={processSubmit}
      validateForm={validateForm}
      checkAmounts={checkAmounts}
    />
  );
};

export default SfaFormContainer;
