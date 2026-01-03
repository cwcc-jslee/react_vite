// src/features/sfa/components/sections/SfaPaymentSection.jsx
/**
 * SFA 매출 관리 섹션 컴포넌트
 * 매출 내역 테이블과 수정 폼을 상황에 따라 표시하고 관리
 */
import React from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { useSfaOperations } from '../../hooks/useSfaSubmit';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';
import PaymentCardList from '../cards/PaymentCardList';

/**
 * @param {Object} props
 * @param {string} props.controlMode - 컨트롤 모드 ('view' | 'edit')
 * @param {Object} props.data - SFA 데이터
 * @param {boolean} props.hasAddingPayments - 추가 중인 매출이 있는지 여부
 * @param {string} props.editingPaymentId - 수정 중인 매출 ID (외부 상태)
 * @param {Function} props.setEditingPaymentId - 수정 중인 매출 ID 설정 함수 (외부 상태)
 * @param {Function} props.onOpenPaymentDrawer - 결제매출 Drawer 열기 핸들러
 */
const SfaPaymentSection = ({
  data,
  controlMode,
  featureMode,
  hasAddingPayments = false,
  editingPaymentId: externalEditingPaymentId,
  setEditingPaymentId: externalSetEditingPaymentId,
  onOpenPaymentDrawer,
}) => {
  // useSfaStore에서 form, actions, selectedItem 가져오기
  const { form, actions, selectedItem } = useSfaStore();
  const errors = form.errors || {};
  const isSubmitting = form.isSubmitting;

  // Redux store의 selectedItem 데이터 사용 (갱신된 데이터)
  const currentData = selectedItem?.data || data;

  // useSfaOperations에서 제출 로직 가져오기
  const { processPaymentOperation } = useSfaOperations();

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

    const sfaId = currentData.id;
    // 결제매출 삭제
    const result = await processPaymentOperation(
      'delete',
      paymentInfo.documentId,
    );

    if (result?.success) {
      // 성공 후 데이터 갱신 및 뷰 모드로 전환
      actions.data.fetchSfaDetail(sfaId);
      // 성공 알림 표시
      openSuccessModal(
        '삭제 완료',
        '결제 매출 정보가 성공적으로 삭제되었습니다.',
      );
    } else if (result?.error) {
      // 실패 알림 표시
      openErrorModal(
        '삭제 실패',
        `결제 매출 정보 삭제 중 오류가 발생했습니다: ${result.error}`,
      );
    }
  };

  // 결제 선택 핸들러 (수정용 - Drawer 열기)
  const handlePaymentSelection = (documentId) => {
    // 원본 payment 데이터 찾기
    const originalPayment = payments.find(p => p.documentId === documentId);

    if (originalPayment && onOpenPaymentDrawer) {
      // Drawer 열기 (edit 모드)
      onOpenPaymentDrawer('edit', originalPayment);
    }
  };

  // Redux store의 갱신된 데이터 사용
  const payments = currentData.sfaByPayments || [];

  return (
    <>
      <PaymentCardList
        payments={payments}
        isNewSfa={false}
        showActions={true}
        showTeamAllocations={true}
        featureMode={featureMode}
        onEdit={(payment) => handlePaymentSelection(payment.documentId)}
        onDelete={(payment) => confirmDeletePayment({ documentId: payment.documentId, id: payment.id })}
        disabled={hasAddingPayments}
        sortByRecognitionDate={true}
        emptyMessage="등록된 결제매출이 없습니다."
      />

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
