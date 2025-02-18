// src/features/sfa/components/forms/SfaPaymentForm.jsx
/**
 * SFA 결제매출 등록/수정을 위한 최적화된 폼 컴포넌트
 * 불필요한 리렌더링을 방지하고 입력 필드의 포커스를 유지하도록 구현
 */
import React, { useState, useRef, useEffect } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import SalesByPayment from '../elements/SalesByPayment.jsx';
// import { useSfaForm } from '../../hooks/useSfaForm.js';
import {
  Form,
  Group,
  Button,
} from '../../../../shared/components/ui/index.jsx';

/**
 * SFA 결제매출 등록/수정 폼 컴포넌트
 */
const SfaPaymentForm = ({ data, controlMode, featureMode }) => {
  const formProps = useSfaForm();
  const {
    formData,
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
    resetPaymentForm,
  } = formProps;

  // 폼 상태를 로컬로 관리하여 불필요한 리렌더링 방지
  // const [localFormData, setLocalFormData] = useState(formData);
  // const formRef = useRef(null);
  const { validatePaymentForm } = useFormValidation(formData);

  // formData가 변경될 때만 localFormData 업데이트
  // useEffect(() => {
  //   setLocalFormData(formData);
  // }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;
    console.log(`***** form : `, formData.salesByPayments);
    console.log(`***** sfaId : `, sfaId);

    // 유효성 검사 수행
    const isValid = validatePaymentForm(formData.salesByPayments);
    if (!isValid) return;

    // const isValid = validateForm();
    // if (!isValid) return;

    // submit() || processMode, targetId, sfaId
    await processPaymentSubmit('create', sfaId, sfaId);
  };

  const handleLocalPaymentChange = (index, field, value) => {
    // 로컬 상태 먼저 업데이트
    // setLocalFormData((prev) => {
    //   const updatedPayments = [...prev.salesByPayments];
    //   updatedPayments[index] = {
    //     ...updatedPayments[index],
    //     [field]: value,
    //   };
    //   return {
    //     ...prev,
    //     salesByPayments: updatedPayments,
    //   };
    // });

    // 부모 컴포넌트에 변경 사항 전달
    handlePaymentChange(index, field, value);
  };

  const handleCancle = async () => {
    if (selectedPaymentIds.id === null) {
      resetForm();
    } else {
      resetPaymentForm();
    }
  };

  // 수정 모드일 때 결제매출 선택 UI 렌더링
  const renderPaymentSelection = () => {
    if (controlMode === 'edit' && featureMode === 'addPayment') {
      return (
        <Button
          type="button"
          variant="primary"
          onClick={handleAddPayment}
          disabled={isSubmitting || formData.salesByPayments.length >= 3}
          className={`
            w-full mb-6 px-4 h-8 text-base font-medium
            ${
              formData.salesByPayments.length >= 3
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-cyan-500 border-blue-300 text-gray-600 hover:bg-blue-100 hover:border-blue-400 hover:text-white'
            }
          `}
        >
          + 결제매출추가
        </Button>
      );
    }
    if (controlMode === 'edit' && featureMode === 'editPayment') {
      return (
        <div>
          <h3 className="text-lg font-medium mb-3">
            수정 결제매출 ID : {selectedPaymentIds.id}
          </h3>
        </div>
      );
    }
    return null;
  };

  return (
    <>
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
          paymentData={paymentData}
          percentageData={percentageData}
          isPaymentDataLoading={isPaymentDataLoading}
        />

        {/* Submit Button */}
        <Group>
          {formData.salesByPayments.length !== 0 && (
            <Group
              direction="horizontal"
              spacing="md"
              className="pt-4 border-t border-gray-200"
            >
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                className="w-[120px] h-8 text-base font-medium bg-indigo-500 hover:bg-fuchsia-500"
                onClick={handleCancle}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-[120px] h-8 text-base font-medium bg-indigo-500 hover:bg-fuchsia-500"
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
            </Group>
          )}
        </Group>
      </Form>
    </>
  );
};

export default SfaPaymentForm;
