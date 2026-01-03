// src/features/sfa/components/sections/SfaPaymentSection.jsx
/**
 * SFA 매출 관리 섹션 컴포넌트
 * 매출 내역 테이블과 수정 폼을 상황에 따라 표시하고 관리
 */
import React from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { useSfaOperations } from '../../hooks/useSfaSubmit';
import ProbabilityBadge from '../elements/ProbabilityBadge';
import { Button } from '../../../../shared/components/ui';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { getUniqueRevenueSources } from '../../utils/transformUtils';

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

  // Redux store의 갱신된 데이터 사용 및 매출인식일 기준 오름차순 정렬
  const payments = React.useMemo(() => {
    const paymentList = currentData.sfaByPayments || [];
    return [...paymentList].sort((a, b) => {
      // recognitionDate가 없는 경우 맨 뒤로
      if (!a.recognitionDate && !b.recognitionDate) return 0;
      if (!a.recognitionDate) return 1;
      if (!b.recognitionDate) return -1;

      // 날짜 문자열 비교 (YYYY-MM-DD 형식)
      return a.recognitionDate.localeCompare(b.recognitionDate);
    });
  }, [currentData.sfaByPayments]);

  // 팀별 색상 매핑 (최대 4개 팀 지원)
  const TEAM_COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
  ];

  return (
    <>
      <div className="space-y-4">
        {/* 기존 매출 내역 */}
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.documentId} className="space-y-2">
              {/* 매출 항목 카드 */}
              <div
                className={`
                  bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200
                  ${payment.isConfirmed
                    ? 'border-l-4 border-green-500 bg-gradient-to-r from-green-50/30 to-white'
                    : 'border-l-4 border-gray-300 bg-gradient-to-r from-gray-50/30 to-white'
                  }
                  p-4
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    {/* ID - 좁은 폭 */}
                    <div className="w-16 flex-shrink-0">
                      <span className="text-xs text-gray-500">ID</span>
                      <p className="text-sm font-medium">{payment.id}</p>
                    </div>

                    {/* 나머지 정보들 */}
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">매출처</span>
                        <p className="text-sm font-medium">
                          {payment.revenueSource?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">빌링타입</span>
                        <p className="text-sm">
                          {payment.billingType || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">매출액</span>
                        <p className="text-sm font-medium">
                          {payment.amount?.toLocaleString() || 0}원
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">매출인식일</span>
                        <p className="text-sm">
                          {payment.recognitionDate || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">확정여부</span>
                        <div className="mt-1">
                          <span
                            className={`
                              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${payment.isConfirmed
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }
                            `}
                          >
                            {payment.isConfirmed ? '✓ 확정' : '미확정'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">확률</span>
                        <div className="mt-1">
                          <ProbabilityBadge probability={payment.probability || 0} />
                        </div>
                      </div>
                    </div>

                    {/* Action 버튼 */}
                    {(featureMode === 'editPayment' || featureMode === 'deletePayment') && (
                      <div className="flex gap-2 flex-shrink-0">
                        {featureMode === 'editPayment' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePaymentSelection(payment.documentId)}
                            disabled={hasAddingPayments}
                            className="
                              h-9 px-3 min-w-[60px]
                              text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200
                              disabled:opacity-40 disabled:cursor-not-allowed
                            "
                          >
                            수정
                          </Button>
                        ) : featureMode === 'deletePayment' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDeletePayment({ documentId: payment.documentId, id: payment.id })}
                            disabled={hasAddingPayments}
                            className="
                              h-9 px-3 min-w-[60px]
                              text-red-600 hover:text-red-700 hover:bg-red-50
                              border-red-200 hover:border-red-300
                              disabled:opacity-40 disabled:cursor-not-allowed
                            "
                          >
                            삭제
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* 팀별 매출액 표시 (단일/다중 사업부 모두) */}
                  {payment.teamAllocations && payment.teamAllocations.length > 0 && (
                    <div className="ml-20 flex flex-wrap gap-2">
                      {payment.teamAllocations.map((allocation, idx) => (
                        <span
                          key={idx}
                          className={`
                            inline-flex items-center gap-1.5
                            px-3 py-1 rounded-full text-xs font-medium border
                            ${TEAM_COLORS[idx % TEAM_COLORS.length]}
                          `}
                        >
                          <span className="font-semibold">
                            {allocation.itemName || allocation.teamName}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span>
                            {Number(allocation.allocatedAmount || 0).toLocaleString()}원
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            등록된 결제매출이 없습니다.
          </div>
        )}
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
