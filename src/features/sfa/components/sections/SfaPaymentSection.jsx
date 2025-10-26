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
 * @param {boolean} props.hasAddingPayments - 추가 중인 매출이 있는지 여부
 * @param {string} props.editingPaymentId - 수정 중인 매출 ID (외부 상태)
 * @param {Function} props.setEditingPaymentId - 수정 중인 매출 ID 설정 함수 (외부 상태)
 */
const SfaPaymentSection = ({
  data,
  controlMode,
  featureMode,
  hasAddingPayments = false,
  editingPaymentId: externalEditingPaymentId,
  setEditingPaymentId: externalSetEditingPaymentId,
}) => {
  // useSfaStore에서 form과 actions 직접 가져오기
  const { form, actions } = useSfaStore();
  const errors = form.errors || {};
  const isSubmitting = form.isSubmitting;

  // 부모에서 전달받은 상태 사용 (prop이 있으면 사용, 없으면 로컬 상태)
  const [localEditingPaymentId, setLocalEditingPaymentId] = useState(null);
  const editingPaymentId = externalEditingPaymentId !== undefined ? externalEditingPaymentId : localEditingPaymentId;
  const setEditingPaymentId = externalSetEditingPaymentId || setLocalEditingPaymentId;

  // 수정 중인 payment 데이터 임시 저장
  const [editingPaymentData, setEditingPaymentData] = useState(null);

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
    setEditingPaymentId(null);
    setEditingPaymentData(null);
    resetPaymentForm();
  };

  // 결제 선택 핸들러 (수정용 - 인라인 확장)
  const handlePaymentSelection = (documentId) => {
    console.log(`>> handlepayment selection : `, documentId);
    console.log(`>> payments array:`, payments);

    // 원본 payment 데이터 찾기
    const originalPayment = payments.find(p => p.documentId === documentId);
    console.log(`>> originalPayment found:`, originalPayment);

    if (originalPayment) {
      // profitConfig 분리하여 로컬 상태에 저장
      const editData = transformPaymentForEdit(originalPayment);
      console.log(`>> editData transformed:`, editData);
      setEditingPaymentData(editData);
    }

    setEditingPaymentId(documentId);
    console.log(`>> editingPaymentId set to:`, documentId);
  };

  // 뷰 액션 핸들러
  const handleViewAction = (paymentInfo) => {
    // TODO: 향후 뷰 모드 처리 추가
    console.log('View payment:', paymentInfo);
  };

  // 수정 저장 핸들러
  const handleEditSave = async () => {
    if (!editingPaymentData) {
      openErrorModal('저장 실패', '수정할 데이터가 없습니다.');
      return;
    }

    try {
      actions.form.setSubmitting(true);

      console.log('💾 [handleEditSave] 저장할 데이터:', editingPaymentData);

      // documentId, id 제거
      const { documentId, id: paymentId, ...rawUpdateData } = editingPaymentData;

      // DB 필드로 변환
      const { transformSalesByPaymentsEdit } = await import('../../utils/transformUtils');
      const processedData = transformSalesByPaymentsEdit(rawUpdateData);

      console.log('💾 [handleEditSave] 변환된 데이터:', processedData);
      console.log('💾 [handleEditSave] paymentId:', paymentId);

      // API 호출
      const apiService = await import('@shared/api/apiService').then(m => m.default);
      await apiService.put(
        `/sfa-by-payment-withhistory/${paymentId}`,
        processedData,
      );

      // 성공 후 데이터 갱신
      const sfaId = data.id;
      await actions.data.fetchSfaDetail(sfaId);
      setEditingPaymentId(null);
      setEditingPaymentData(null);
      resetPaymentForm();

      openSuccessModal('저장 완료', '결제 매출 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('💾 [handleEditSave] 저장 실패:', error);
      openErrorModal('저장 실패', `저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      actions.form.setSubmitting(false);
    }
  };

  // payment 데이터를 폼 형식으로 변환 (profitConfig 분리)
  const transformPaymentForEdit = (payment) => {
    if (!payment) return null;

    const transformed = { ...payment };

    // profitConfig가 있으면 분리
    if (payment.profitConfig) {
      try {
        const config = typeof payment.profitConfig === 'string'
          ? JSON.parse(payment.profitConfig)
          : payment.profitConfig;

        transformed.isProfit = config.is_profit || config.isProfit || false;
        transformed.marginProfitValue = config.margin_profit_value || config.marginProfitValue || '';
      } catch (error) {
        console.error('profitConfig 파싱 오류:', error);
        transformed.isProfit = false;
        transformed.marginProfitValue = '';
      }
    }

    return transformed;
  };

  console.log(`>>sfapaymentsection form.data : `, form.data);
  console.log(`controlmode ${controlMode}, feturemode ${featureMode}`);
  console.log(`editingPaymentId:`, editingPaymentId);
  console.log(`editingPaymentData:`, editingPaymentData);

  const payments = data.sfaByPayments || [];
  console.log(`>> payments at render:`, payments);

  return (
    <>
      <div className="space-y-4">
        {/* 기존 매출 내역 */}
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.documentId} className="space-y-2">
              {/* 매출 항목 카드 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">ID</span>
                      <p className="text-sm font-medium">{payment.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">매출액</span>
                      <p className="text-sm font-medium">
                        {payment.amount?.toLocaleString() || 0}원
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">확정여부</span>
                      <p className="text-sm">
                        {payment.isConfirmed ? '✓ 확정' : '미확정'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">확률</span>
                      <p className="text-sm">{payment.probability || 0}%</p>
                    </div>
                  </div>

                  {/* Action 버튼 */}
                  <div className="ml-4 flex gap-2">
                    {controlMode === 'view' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAction({ documentId: payment.documentId, id: payment.id })}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        view
                      </Button>
                    ) : featureMode === 'editPayment' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePaymentSelection(payment.documentId)}
                          disabled={hasAddingPayments || editingPaymentId === payment.documentId}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          {editingPaymentId === payment.documentId ? '수정중...' : '수정'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmDeletePayment({ documentId: payment.documentId, id: payment.id })}
                          disabled={hasAddingPayments || editingPaymentId === payment.documentId}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          삭제
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 인라인 수정 폼 - 해당 항목이 선택되었을 때만 표시 */}
              {editingPaymentId === payment.documentId && (() => {
                // editingPaymentData가 없으면 현재 payment로 초기화
                const currentEditData = editingPaymentData || transformPaymentForEdit(payment);

                return (
                  <div className="ml-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-yellow-800">
                        📝 매출 수정 중...
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          disabled={isSubmitting}
                          className="text-gray-600"
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleEditSave}
                          disabled={isSubmitting}
                        >
                          저장
                        </Button>
                      </div>
                    </div>

                    {/* 수정 폼 */}
                    <SalesAddByPayment
                      payment={currentEditData}
                      index={0}
                      isSameBilling={data.isSameBilling}
                      onChange={(idx, field, value) => {
                        // 로컬 상태 업데이트
                        setEditingPaymentData(prev => {
                          const base = prev || currentEditData;
                          const isMultiTeam = data.isMultiTeam || false;

                          // field가 객체인 경우 (여러 필드 한번에 업데이트)
                          if (typeof field === 'object' && field !== null) {
                            const updated = {
                              ...base,
                              ...field,
                            };

                            // 단일 사업부이고 amount가 변경된 경우 자동 할당
                            if (!isMultiTeam && field.amount !== undefined && updated.teamAllocations && updated.teamAllocations.length === 1) {
                              updated.teamAllocations = [{
                                ...updated.teamAllocations[0],
                                allocatedAmount: field.amount,
                              }];
                            }

                            return updated;
                          }

                          // 단일 필드 업데이트
                          const updated = {
                            ...base,
                            [field]: value,
                          };

                          // 단일 사업부이고 amount가 변경된 경우 자동 할당
                          if (!isMultiTeam && field === 'amount' && updated.teamAllocations && updated.teamAllocations.length === 1) {
                            updated.teamAllocations = [{
                              ...updated.teamAllocations[0],
                              allocatedAmount: value,
                            }];
                          }

                          return updated;
                        });
                      }}
                      onRemove={() => {}}
                      isSubmitting={isSubmitting}
                      handleRevenueSourceSelect={(customer) => {
                        // 로컬 상태 업데이트
                        setEditingPaymentData(prev => ({
                          ...(prev || currentEditData),
                          revenueSource: { id: customer.id, name: customer.name },
                        }));
                      }}
                      savedRevenueSources={uniqueRevenueSources}
                      codebooks={paymentCodebooks}
                      isLoadingCodebook={isLoadingCodebook}
                      isExisting={true}
                      isMultiTeam={data.isMultiTeam || false}
                      sfaByItems={data.sfaByItems || []}
                      onAllocationChange={(paymentIndex, teamIndex, value) => {
                        // 팀 할당액 업데이트
                        setEditingPaymentData(prev => {
                          const updatedAllocations = [...((prev || currentEditData).teamAllocations || [])];
                          if (updatedAllocations[teamIndex]) {
                            updatedAllocations[teamIndex] = {
                              ...updatedAllocations[teamIndex],
                              allocatedAmount: value.replace(/,/g, ''),
                            };
                          }
                          return {
                            ...(prev || currentEditData),
                            teamAllocations: updatedAllocations,
                          };
                        });
                      }}
                    />
                  </div>
                );
              })()}
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
