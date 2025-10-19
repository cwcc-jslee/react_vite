// src/features/sfa/components/sections/SfaEditPaymentSection.jsx
/**
 * SFA 결제매출 추가를 위한 섹션 컴포넌트
 * 초안 결제매출(sfaDraftPayments)만 관리하며, 수정 및 신규 추가 용도로 사용
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useSfaForm1 } from '../../hooks/useSfaForm1.js';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { useSfaOperations } from '../../hooks/useSfaSubmit.js';
import SalesAddByPayment from '../elements/SalesAddByPayment.jsx';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { getUniqueRevenueSources } from '../../utils/transformUtils';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  Form,
  Group,
  Button,
} from '../../../../shared/components/ui/index.jsx';

/**
 * SFA 초안 결제매출 관리 섹션 컴포넌트
 */
const SfaEditPaymentSection = ({ data, controlMode, featureMode }) => {
  // useSfaStore에서 form과 actions 직접 가져오기
  const { form, actions } = useSfaStore();
  const errors = form.errors || {};
  const isSubmitting = form.isSubmitting;

  // useUiStore에서 uiActions 가져오기
  const { actions: uiActions } = useUiStore();

  // useSfaForm1에서 필요한 핸들러들 가져오기
  const { validateForm, handleAddPayment } = useSfaForm1();

  // useSfaOperations에서 제출 로직 가져오기
  const { processPaymentOperation } = useSfaOperations();

  // 결제구분, 매출확률 codebook
  const {
    data: paymentCodebooks,
    isLoading: isLoadingCodebook,
    error: codebookError,
  } = useCodebook(['rePaymentMethod', 'sfaPercentage']);

  // revenueSource 데이터 중복 제거 및 정렬 (초안 결제매출만)
  const uniqueRevenueSources = React.useMemo(() => {
    return getUniqueRevenueSources(form.data.sfaDraftPayments || []);
  }, [form.data.sfaDraftPayments]);

  // 폼 상태를 로컬로 관리하여 불필요한 리렌더링 방지
  // const [localFormData, setLocalFormData] = useState(formData);
  // const formRef = useRef(null);
  const { validatePaymentForm } = useFormValidation(form.data);

  // 폼 리셋 함수 (초안 항목만 초기화)
  const resetPaymentForm = () => {
    // 초안 결제매출만 초기화
    actions.form.updateField('sfaDraftPayments', []);
  };

  // 컴포넌트 최초 실행 시 기본 데이터만 설정 (초안은 부모에서 관리)
  useEffect(() => {
    if (data && !form.data.id) {
      // 기존 데이터를 설정 (초안 배열은 유지)
      const updatedData = {
        ...data,
        sfaDraftPayments: form.data.sfaDraftPayments || [], // 기존 초안 유지
      };
      actions.form.reset(updatedData);
    }
  }, [data?.id]);

  // sfaDraftPayments 전용 핸들러들

  const handleNewPaymentChange = useCallback(
    (index, fieldOrFields, value) => {
      const currentPayments = form.data.sfaDraftPayments || [];
      const isMultiTeam = data?.isMultiTeam || false;

      // 불변성을 유지하면서 해당 인덱스의 payment만 업데이트
      const updatedPayments = currentPayments.map((payment, idx) => {
        if (idx !== index) return payment;

        let updatedPayment;
        if (typeof fieldOrFields === 'object') {
          updatedPayment = {
            ...payment,
            ...fieldOrFields,
          };
        } else {
          updatedPayment = {
            ...payment,
            [fieldOrFields]: value,
          };
        }

        // 단일 사업부일 때: 매출액 변경 시 teamAllocations의 allocatedAmount 자동 동기화
        if (!isMultiTeam && updatedPayment.teamAllocations && updatedPayment.teamAllocations.length === 1) {
          if (fieldOrFields === 'amount' || (typeof fieldOrFields === 'object' && fieldOrFields.amount !== undefined)) {
            const newAmount = fieldOrFields === 'amount' ? value : fieldOrFields.amount;
            updatedPayment.teamAllocations = [{
              ...updatedPayment.teamAllocations[0],
              allocatedAmount: newAmount,
            }];
          }
        }

        return updatedPayment;
      });

      actions.form.updateField('sfaDraftPayments', updatedPayments);
    },
    [form.data.sfaDraftPayments, data?.isMultiTeam, actions.form],
  );

  const handleRemoveNewPayment = useCallback(
    (index) => {
      const currentPayments = [...(form.data.sfaDraftPayments || [])];
      currentPayments.splice(index, 1);
      actions.form.updateField('sfaDraftPayments', currentPayments);
    },
    [form.data.sfaDraftPayments, actions.form],
  );

  const handleNewRevenueSourceSelect = useCallback(
    (customer, paymentIndex) => {
      const currentPayments = [...(form.data.sfaDraftPayments || [])];
      currentPayments[paymentIndex] = {
        ...currentPayments[paymentIndex],
        revenueSource: { id: customer.id, name: customer.name },
      };
      actions.form.updateField('sfaDraftPayments', currentPayments);
    },
    [form.data.sfaDraftPayments, actions.form],
  );

  // 팀 할당액 변경 핸들러
  const handleAllocationChange = useCallback(
    (paymentIndex, teamIndex, value) => {
      const currentPayments = form.data.sfaDraftPayments || [];
      const payment = currentPayments[paymentIndex];

      if (!payment || !payment.teamAllocations || !payment.teamAllocations[teamIndex]) {
        return;
      }

      const numericValue = value.replace(/,/g, '');

      // 팀 할당 배열 업데이트
      const updatedAllocations = payment.teamAllocations.map((allocation, idx) => {
        if (idx !== teamIndex) return allocation;

        return {
          ...allocation,
          allocatedAmount: numericValue,
        };
      });

      // payment 업데이트
      const updatedPayments = currentPayments.map((p, idx) => {
        if (idx !== paymentIndex) return p;

        return {
          ...p,
          teamAllocations: updatedAllocations,
        };
      });

      actions.form.updateField('sfaDraftPayments', updatedPayments);
    },
    [form.data.sfaDraftPayments, actions.form],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;

    // 초안 결제매출만 유효성 검사
    const isValid = validatePaymentForm(form.data.sfaDraftPayments || []);
    if (!isValid) {
      // 에러가 있을 경우 스크롤하여 에러 메시지 표시
      const errorElement = document.querySelector('[data-validation-error]');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // featureMode에 따른 processMode 결정 (명시적 정의만 처리)
    let processMode;
    if (featureMode === 'editPayment') {
      processMode = 'update';
    } else if (featureMode === 'addPayment') {
      processMode = 'add';
    } else {
      console.warn('지원하지 않는 featureMode:', featureMode);
      return;
    }

    const result = await processPaymentOperation(processMode, sfaId);

    if (result?.success) {
      // 성공 후 데이터 갱신 및 뷰 모드로 전환
      const resultAction = await actions.data.fetchSfaDetail(sfaId);

      // fetchSfaDetail이 성공하면 drawer를 view 모드로 전환
      if (resultAction.type.endsWith('/fulfilled')) {
        uiActions.drawer.open({
          mode: 'view',
          data: resultAction.payload,
        });
      }

      // sfaDraftPayments 폼 초기화
      resetPaymentForm();
    } else if (result?.error) {
      console.error('결제매출 추가 실패:', result.error);
    }
  };

  const handleCancle = async () => {
    resetPaymentForm();
  };

  // 수정 모드일 때 결제매출 선택 UI 렌더링 (editPayment 모드만)
  const renderPaymentSelection = () => {
    if (controlMode === 'edit' && featureMode === 'editPayment') {
      return (
        <div>
          <h3 className="text-lg font-medium mb-3">
            수정 결제매출 ID : {form.data?.sfaDraftPayments[0]?.id || ''}
          </h3>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderPaymentSelection()}

      {/* 초안 결제매출 목록 */}
      <div className="flex flex-col gap-2">
        {(form.data.sfaDraftPayments || []).map((payment, index) => {
          // 각 결제매출의 에러 체크
          const paymentErrors = [];
          if (!payment.revenueSource?.id) {
            paymentErrors.push('매출처를 선택해주세요');
          }
          if (!payment.billingType) {
            paymentErrors.push('결제구분을 선택해주세요');
          }
          if (!payment.amount || payment.amount === '0') {
            paymentErrors.push('매출액을 입력해주세요');
          }
          if (!payment.probability && !payment.isConfirmed) {
            paymentErrors.push('매출확률을 선택하거나 확정여부를 체크해주세요');
          }

          return (
            <div key={`draft-payment-${index}`}>
              <SalesAddByPayment
                payment={payment}
                index={index}
                isSameBilling={form.data.isSameBilling}
                onChange={handleNewPaymentChange}
                onRemove={handleRemoveNewPayment}
                isSubmitting={isSubmitting}
                handleRevenueSourceSelect={handleNewRevenueSourceSelect}
                savedRevenueSources={uniqueRevenueSources}
                codebooks={paymentCodebooks}
                isLoadingCodebook={isLoadingCodebook}
                isExisting={false}
                dataType="sfaDraftPayments"
                isMultiTeam={data.isMultiTeam || false}
                sfaByItems={data.sfaByItems || []}
                onAllocationChange={handleAllocationChange}
              />

              {/* 에러 메시지 표시 */}
              {errors && paymentErrors.length > 0 && (
                <div
                  className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md"
                  data-validation-error
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        입력 오류
                      </p>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {paymentErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <Group>
        {(form.data.sfaDraftPayments?.length || 0) !== 0 && (
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
    </>
  );
};

export default SfaEditPaymentSection;
