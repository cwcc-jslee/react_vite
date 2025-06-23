// src/features/sfa/components/compose/SfaPaymentSection.jsx
/**
 * SFA 매출 관리 섹션 컴포넌트
 * 매출 내역 테이블과 수정 폼을 상황에 따라 표시하고 관리
 */
import React, { useState } from 'react';
import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable';
import SfaEditPaymentForm from '../forms/SfaEditPaymentForm';
import { useSfaForm } from '../../hooks/useSfaForm';
import { useFormValidationEdit } from '../../hooks/useFormValidationEdit';
import SalesByPayment from '../elements/SalesByPayment';
import { Form, Group, Button } from '../../../../shared/components/ui';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';

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

  // useModal 훅 사용
  const {
    modalState,
    openDeleteModal,
    openSuccessModal,
    openErrorModal,
    openInfoModal,
    openWarningModal,
    closeModal,
    handleConfirm,
  } = useModal();

  const { validatePaymentForm } = useFormValidationEdit(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;

    // 유효성 검사 수행
    const isValid = validatePaymentForm(formData.salesByPayments);
    if (!isValid) return;

    await processPaymentSubmit('update', selectedPayment.id, sfaId);
  };

  // 삭제 확인 모달 표시 처리
  const confirmDeletePayment = (paymentInfo) => {
    // 삭제 전 사용자 확인을 위한 모달 표시
    openDeleteModal(
      '결제 매출 삭제 확인',
      <div className="space-y-4">
        <p>
          다음 결제 매출 정보를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
          없습니다.
        </p>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p>
            <strong>결제 ID:</strong> {paymentInfo.id}
          </p>
          {paymentInfo.amount && (
            <p>
              <strong>결제 금액:</strong> {paymentInfo.amount.toLocaleString()}
              원
            </p>
          )}
          {paymentInfo.paymentMethod && (
            <p>
              <strong>결제 방법:</strong> {paymentInfo.paymentMethod}
            </p>
          )}
        </div>
      </div>,
      paymentInfo,
      handleDeletePayment, // 확인 시 실행할 삭제 함수
    );
  };

  // 결제 매출 정보 삭제
  const handleDeletePayment = async (paymentInfo) => {
    console.log(`>> handlepayment delete : `, paymentInfo);
    // notification 실행

    try {
      const sfaId = data.id;
      await processPaymentSubmit('delete', paymentInfo.documentId, sfaId);
      // 성공 알림 표시
      openSuccessModal(
        '삭제 완료',
        '결제 매출 정보가 성공적으로 삭제되었습니다.',
      );
    } catch (error) {
      // 실패 알림 표시
      openErrorModal(
        '삭제 실패',
        `결제 매출 정보 삭제 중 오류가 발생했습니다: ${
          error.message || '알 수 없는 오류'
        }`,
      );
    }
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
          handleDeletePayment={confirmDeletePayment}
        />
      </div>

      {/* 모달 렌더러 컴포넌트 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </>
  );
};

export default SfaPaymentSection;
