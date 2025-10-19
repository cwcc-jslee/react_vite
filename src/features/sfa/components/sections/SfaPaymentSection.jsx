// src/features/sfa/components/sections/SfaPaymentSection.jsx
/**
 * SFA 매출 관리 섹션 컴포넌트
 * 매출 내역 테이블과 수정 폼을 상황에 따라 표시하고 관리
 */
import React, { useState } from 'react';
import SfaDetailPaymentTable from '../tables/SfaDetailPaymentTable';
import { useSfaForm1 } from '../../hooks/useSfaForm1';
import { useSfaStore } from '../../hooks/useSfaStore';
import { useSfaOperations } from '../../hooks/useSfaSubmit';
import { useFormValidationEdit } from '../../hooks/useFormValidationEdit';
import SalesAddByPayment from '../elements/SalesAddByPayment';
import { Form, Group, Button } from '../../../../shared/components/ui';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { getUniqueRevenueSources } from '../../utils/transformUtils';

/**
 * @param {Object} props
 * @param {string} props.controlMode - 컨트롤 모드 ('view' | 'edit')
 * @param {Object} props.data - SFA 데이터
 */
const SfaPaymentSection = ({ data, controlMode, featureMode }) => {
  // useSfaStore에서 form과 actions 직접 가져오기
  const { form, actions } = useSfaStore();
  const errors = form.errors || {};
  const isSubmitting = form.isSubmitting;

  // 선택된 결제 정보 상태
  const [selectedPayment, setSelectedPayment] = useState(null);

  // useSfaForm1에서 필요한 핸들러들 가져오기
  const { selectPaymentForEdit, resetPaymentForm } = useSfaForm1();

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

  // 결제구분, 매출확률 codebook
  const {
    data: paymentCodebooks,
    isLoading: isLoadingCodebook,
    error: codebookError,
  } = useCodebook(['rePaymentMethod', 'sfaPercentage']);

  // revenueSource 데이터 중복 제거 및 정렬
  const uniqueRevenueSources = React.useMemo(
    () => getUniqueRevenueSources(form.data.sfaByPayments),
    [form.data.sfaByPayments],
  );
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

    const sfaId = data.id;
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

  // 수정 취소 핸들러
  const handleEditCancel = () => {
    setSelectedPayment(null);
    resetPaymentForm();
  };

  // 결제 선택 핸들러 (수정용)
  const handlePaymentSelection = (documentId) => {
    console.log(`>> handlepayment selection : `, documentId);
    setSelectedPayment(documentId);
    selectPaymentForEdit(documentId);
  };

  // 뷰 액션 핸들러
  const handleViewAction = (paymentInfo) => {
    // TODO: 향후 뷰 모드 처리 추가
    console.log('View payment:', paymentInfo);
  };

  console.log(`>>sfapaymentsection form.data : `, form.data);
  console.log(`controlmode ${controlMode}, feturemode ${featureMode}`);

  return (
    <>
      <div className="space-y-6">
        {/* 매출 내역 테이블 */}
        <SfaDetailPaymentTable
          data={data.sfaByPayments || []}
          isMultiTeam={data.isMultiTeam || false}
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
