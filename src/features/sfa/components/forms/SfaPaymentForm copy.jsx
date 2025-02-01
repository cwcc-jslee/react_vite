// src/features/sfa/components/forms/SfaPaymentForm.jsx
import React, { useEffect } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import SalesByPayment from '../elements/SalesByPayment.jsx';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import {
  Form,
  Group,
  Button,
} from '../../../../shared/components/ui/index.jsx';

/**
 * SFA 결제매출 등록/수정 폼 컴포넌트
 */
const SfaPaymentForm = ({ data, controlMode, featureMode, formData }) => {
  const {
    handleAddPayment,
    handlePaymentChange,
    handleRemovePayment,
    isSubmitting,
    errors,
    paymentData,
    percentageData,
    isPaymentDataLoading,
    processPaymentSubmit,
    selectedPaymentIds,
  } = useSfaForm();
  const { validatePayments } = useFormValidation(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;
    console.log(`***** form : `, formData.salesByPayments);
    console.log(`***** sfaId : `, sfaId);

    // 유효성 검사 수행
    const paymentErrors = validatePayments(formData.salesByPayments);
    console.log(`***** paymentErrors : ${paymentErrors}`);
    if (paymentErrors.length > 0) return;

    // const isValid = validateForm();
    // if (!isValid) return;

    // submit
    await processPaymentSubmit(sfaId);
  };

  const handleCancle = async () => {};

  // 수정 모드일 때 결제매출 선택 UI 렌더링
  const renderPaymentSelection = () => {
    console.log(
      `_1_cmode : ${controlMode}, fmode : ${featureMode}, fdata :`,
      formData,
    );
    if (
      controlMode !== 'edit' ||
      featureMode !== 'editPayment' ||
      formData.salesByPayments.length === 0
    ) {
      return null;
    }
    console.log(
      `_2_cmode ${controlMode}, fmode${featureMode}, fdata${formData.salesByPayments}`,
    );
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">수정할 결제매출 선택</h3>
        <div className="space-y-2">
          {formData.salesByPayments.map((payment) => (
            <div key={payment.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedPaymentIds.includes(payment.id)}
                onChange={() => handlePaymentSelect(payment.id)}
                className="form-checkbox h-4 w-4"
              />
              <span>
                {payment.billing_type} - {payment.amount.toLocaleString()}원 (
                {payment.recognition_date})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {controlMode === 'edit' && featureMode === 'addPayment' && (
        <Button
          type="button"
          variant="primary"
          onClick={handleAddPayment}
          // disabled={isSubmitting || formData.salesByPayments.length >= 3}
          // className={`w-full ${
          //   formData.salesByPayments.length >= 3
          //     ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 border-gray-200'
          //     : ''
          // }`}
        >
          결제매출등록
        </Button>
      )}

      {renderPaymentSelection()}

      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        // 추가: method와 action 속성 명시적 지정
        method="POST"
        action="#"
      >
        {/* 결제 매출 추가 */}
        <SalesByPayment
          payments={formData.salesByPayments}
          onChange={handlePaymentChange}
          // onAdd={handleAddSalesPayment}
          onRemove={handleRemovePayment}
          isSubmitting={isSubmitting}
          // errors={errors}
          paymentData={paymentData}
          percentageData={percentageData}
          isPaymentDataLoading={isPaymentDataLoading}
        />

        {/* Submit Button */}
        <Group>
          {formData.salesByPayments.length !== 0 && (
            <>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
                onClick={handleCancle}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
                onClick={(e) => {
                  // 버튼 클릭 시에도 이벤트 전파 방지
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {isSubmitting
                  ? '처리중...'
                  : featureMode === 'addPayment'
                  ? '저장'
                  : '수정'}
              </Button>
            </>
          )}
        </Group>
      </Form>
    </>
  );
};

export default SfaPaymentForm;
