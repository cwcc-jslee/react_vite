// src/features/sfa/components/compose/SfaPaymentSection.jsx
/**
 * SFA 매출 관리 섹션 컴포넌트
 * 매출 내역 테이블과 수정 폼을 상황에 따라 표시하고 관리
 */
import React, { useState } from 'react';
import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable';
import SfaEditPaymentForm from '../forms/SfaEditPaymentForm';
import { useSfaForm } from '../../hooks/useSfaForm';
import { useFormValidation } from '../../hooks/useFormValidation';
import SalesByPayment from '../elements/SalesByPayment';
import { Form, Group, Button } from '../../../../shared/components/ui';

/**
 * @param {Object} props
 * @param {string} props.controlMode - 컨트롤 모드 ('view' | 'edit')
 * @param {Object} props.data - SFA 데이터
 */
const SfaPaymentSection = ({ data, controlMode, featureMode }) => {
  // 선택된 결제 정보 상태
  const [selectedPayment, setSelectedPayment] = useState({
    documentId: null,
    id: null,
  });

  const {
    formData,
    isSubmitting,
    handlePaymentChange,
    processPaymentSubmit,
    togglePaymentSelection,
    resetPaymentForm,
  } = useSfaForm();

  const { validatePayments } = useFormValidation(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;
    // console.log(`***** form : `, formData.salesByPayments);
    // console.log(`***** sfaId : `, sfaId);

    // 유효성 검사 수행
    const paymentErrors = validatePayments(formData.salesByPayments);
    console.log(`***** paymentErrors : ${paymentErrors}`);
    if (paymentErrors.length > 0) return;

    // const isValid = validateForm();
    // if (!isValid) return;

    // submit() || processMode, targetId, sfaId
    await processPaymentSubmit('update', selectedPayment.id, sfaId);
  };

  // 수정 취소 핸들러
  const handleEditCancel = () => {
    setSelectedPayment({
      documentId: null,
      id: null,
    });
    resetPaymentForm();
  };

  // 결제 선택 토글 핸들러
  const handlePaymentSelection = (paymentInfo) => {
    console.log(`>> handlepayment selection : `, paymentInfo);
    setSelectedPayment(paymentInfo);
    togglePaymentSelection(paymentInfo);
  };

  // 뷰 액션 핸들러
  const handleViewAction = (paymentInfo) => {
    // TODO: 향후 뷰 모드 처리 추가
    console.log('View payment:', paymentInfo);
  };

  console.log(`>>sfapaymentsection formdata : `, formData);
  console.log(`controlmode ${controlMode}, feturemode ${featureMode}`);

  // 수정 모드일 때 결제매출 선택 UI 렌더링
  const renderPaymentSelection = () => {
    if (controlMode === 'edit' && featureMode === 'editPayment') {
      return (
        <>
          <h3 className="text-lg font-medium mb-3">
            수정 결제매출 ID : {selectedPayment?.id || ''}
          </h3>
          <Form
            onSubmit={handleSubmit}
            className="space-y-6"
            // 추가: method와 action 속성 명시적 지정
            method="PUT"
            action="#"
          >
            {/* 결제 매출 추가 */}
            <SalesByPayment
              payments={formData.salesByPayments}
              onChange={handlePaymentChange}
              // onAdd={handleAddSalesPayment}
              //   onRemove={handleRemovePayment}
              isSubmitting={isSubmitting}
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
                    onClick={handleEditCancel}
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
    }
    return null;
  };

  return (
    <>
      {renderPaymentSelection()}
      <div className="space-y-6">
        {/* 매출 내역 테이블 */}
        <SfaDetailPaymentTable
          data={data.sfa_by_payments || []}
          controlMode={controlMode}
          featureMode={featureMode}
          onView={handleViewAction}
          handlePaymentSelection={handlePaymentSelection}
        />
      </div>
    </>
  );
};

export default SfaPaymentSection;
