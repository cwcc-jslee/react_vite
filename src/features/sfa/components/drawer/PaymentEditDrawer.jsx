/**
 * 결제매출 추가/수정 Drawer 컴포넌트
 * - SFA 상세 Drawer 위에 우측에서 슬라이드되는 중첩 Drawer
 * - 추가(add) 및 수정(edit) 모드 지원
 * - 추가 모드에서 수량 선택 기능 (1-5개)
 * - LG 사이즈 (800px) - SFA Drawer(1100px)보다 작음
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer, DRAWER_SIZES } from '@shared/components/drawer';
import { Button } from '@shared/components/ui';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { getUniqueRevenueSources } from '../../utils/transformUtils';
import SalesAddByPayment from '../elements/SalesAddByPayment.jsx';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.visible - Drawer 표시 여부
 * @param {string} props.mode - 'add' | 'edit'
 * @param {Object} props.data - SFA 데이터 (전체)
 * @param {Object} props.payment - 수정할 결제매출 데이터 (edit 모드일 때)
 * @param {Function} props.onClose - Drawer 닫기 핸들러
 * @param {Function} props.onSave - 저장 완료 핸들러
 * @param {boolean} props.isNewSfa - SFA 신규 등록 모드 여부 (true: Redux 저장, false: DB 저장)
 */
const PaymentEditDrawer = ({ visible, mode, data, payment, onClose, onSave, isNewSfa = false }) => {
  const { form, actions } = useSfaStore();
  const [localPayments, setLocalPayments] = useState([]); // 배열로 변경
  const [paymentCount, setPaymentCount] = useState(1); // 수량 선택
  const [validationErrors, setValidationErrors] = useState([]);

  // Codebook 데이터
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
  } = useCodebook(['rePaymentMethod', 'sfaPercentage']);

  // 매출처 목록
  const uniqueRevenueSources = React.useMemo(
    () => getUniqueRevenueSources(data?.sfaByPayments || []),
    [data?.sfaByPayments],
  );

  // 초기 데이터 설정
  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && payment) {
      // 수정 모드: 단일 payment
      const editData = transformPaymentForEdit(payment);
      setLocalPayments([editData]);
      setPaymentCount(1);
    } else if (mode === 'add') {
      // 추가 모드: 기본 1개로 시작
      const newPayments = Array.from({ length: 1 }, () => createEmptyPayment(data));
      setLocalPayments(newPayments);
      setPaymentCount(1);
    }
  }, [visible, mode, payment, data]);

  // 수량 변경 핸들러
  const handleCountChange = (newCount) => {
    const count = parseInt(newCount, 10);
    if (count < 1 || count > 5 || isNaN(count)) return;

    setPaymentCount(count);

    // 현재 개수보다 늘어나면 추가
    if (count > localPayments.length) {
      const additionalCount = count - localPayments.length;
      const newPayments = Array.from({ length: additionalCount }, () =>
        createEmptyPayment(data)
      );
      setLocalPayments([...localPayments, ...newPayments]);
    }
    // 줄어들면 뒤에서부터 제거
    else if (count < localPayments.length) {
      setLocalPayments(localPayments.slice(0, count));
    }
  };

  // payment 데이터를 폼 형식으로 변환 (profitConfig 분리)
  const transformPaymentForEdit = (payment) => {
    if (!payment) return null;

    const transformed = { ...payment };

    // profitConfig가 있으면 분리
    if (payment.profitConfig) {
      try {
        const config =
          typeof payment.profitConfig === 'string'
            ? JSON.parse(payment.profitConfig)
            : payment.profitConfig;

        transformed.isProfit = config.is_profit || config.isProfit || false;
        transformed.marginProfitValue =
          config.margin_profit_value || config.marginProfitValue || '';
      } catch (error) {
        console.error('profitConfig 파싱 오류:', error);
        transformed.isProfit = false;
        transformed.marginProfitValue = '';
      }
    }

    return transformed;
  };

  // 빈 payment 템플릿 생성
  const createEmptyPayment = (sfaData) => {
    const teamAllocations = (sfaData?.sfaByItems || []).map((item) => ({
      itemId: item.itemId || item.id || null,
      itemName: item.itemName || item.item_name || '',
      teamId: item.teamId || item.team_id || null,
      teamName: item.teamName || item.team_name || '',
      allocatedAmount: 0,
    }));

    return {
      revenueSource: sfaData.isSameBilling
        ? { id: sfaData.customer?.id, name: sfaData.customer?.name }
        : {},
      billingType: '',
      amount: '',
      isProfit: false,
      marginProfitValue: '',
      profitAmount: 0,
      isConfirmed: false,
      probability: '',
      recognitionDate: '',
      scheduledDate: '',
      paymentLabel: '',
      memo: '',
      teamAllocations,
    };
  };

  // 필드 변경 핸들러
  const handleFieldChange = (index, fieldOrFields, value) => {
    setLocalPayments((prev) => {
      const updated = [...prev];
      const payment = { ...updated[index] };
      const isMultiTeam = data?.isMultiTeam || false;

      // 여러 필드 한 번에 업데이트
      if (typeof fieldOrFields === 'object' && fieldOrFields !== null) {
        Object.assign(payment, fieldOrFields);

        // 단일 사업부이고 amount가 변경된 경우 자동 할당
        if (
          !isMultiTeam &&
          fieldOrFields.amount !== undefined &&
          payment.teamAllocations &&
          payment.teamAllocations.length === 1
        ) {
          payment.teamAllocations = [
            {
              ...payment.teamAllocations[0],
              allocatedAmount: fieldOrFields.amount,
            },
          ];
        }
      } else {
        // 단일 필드 업데이트
        payment[fieldOrFields] = value;

        // 단일 사업부이고 amount가 변경된 경우 자동 할당
        if (
          !isMultiTeam &&
          fieldOrFields === 'amount' &&
          payment.teamAllocations &&
          payment.teamAllocations.length === 1
        ) {
          payment.teamAllocations = [
            {
              ...payment.teamAllocations[0],
              allocatedAmount: value,
            },
          ];
        }
      }

      updated[index] = payment;
      return updated;
    });
  };

  // 매출처 선택 핸들러
  const handleRevenueSourceSelect = (index, customer) => {
    setLocalPayments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        revenueSource: { id: customer.id, name: customer.name },
      };
      return updated;
    });
  };

  // 팀 할당액 변경 핸들러
  const handleAllocationChange = (paymentIndex, teamIndex, value) => {
    const numericValue = value.replace(/,/g, '');

    setLocalPayments((prev) => {
      const updated = [...prev];
      const payment = { ...updated[paymentIndex] };
      const updatedAllocations = [...(payment.teamAllocations || [])];

      if (updatedAllocations[teamIndex]) {
        updatedAllocations[teamIndex] = {
          ...updatedAllocations[teamIndex],
          allocatedAmount: numericValue,
        };
      }

      payment.teamAllocations = updatedAllocations;
      updated[paymentIndex] = payment;
      return updated;
    });
  };

  // 유효성 검사
  const validatePayments = () => {
    const errors = [];

    localPayments.forEach((payment, index) => {
      const paymentNum = index + 1;

      if (!payment.revenueSource?.id) {
        errors.push(`[${paymentNum}번] 매출처를 선택해주세요`);
      }
      if (!payment.billingType) {
        errors.push(`[${paymentNum}번] 결제구분을 선택해주세요`);
      }
      if (!payment.amount || payment.amount === '0') {
        errors.push(`[${paymentNum}번] 매출액을 입력해주세요`);
      }
      if (!payment.probability && !payment.isConfirmed) {
        errors.push(`[${paymentNum}번] 매출확률을 선택하거나 확정여부를 체크해주세요`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validatePayments()) {
      // 에러가 있을 경우 스크롤하여 에러 메시지 표시
      const errorElement = document.querySelector('[data-validation-error]');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      actions.form.setSubmitting(true);

      if (mode === 'edit') {
        // 수정 모드 (단일 payment만)
        const localPayment = localPayments[0];

        if (isNewSfa) {
          // 🆕 SFA 신규 등록 모드: Redux store 업데이트
          console.log('💾 [PaymentEditDrawer] 신규 SFA 수정 모드 - Redux 업데이트:', localPayment);

          const currentPayments = form.data.sfaByPayments || [];

          // payment의 id로 해당 항목 찾아서 업데이트
          const updatedPayments = currentPayments.map(p =>
            p.id === localPayment.id ? localPayment : p
          );

          // Redux store 업데이트
          actions.form.updateField('sfaByPayments', updatedPayments);

          console.log('💾 [PaymentEditDrawer] Redux 업데이트 완료');

          if (onSave) {
            onSave();
          }

          onClose();
          alert('✅ 수정이 완료되었습니다.');
        } else {
          // 기존 SFA 상세보기 모드: DB 업데이트
          const { documentId, id: paymentId, ...rawUpdateData } = localPayment;

          // DB 필드로 변환
          const { transformToDBFields } = await import('../../utils/transformUtils');
          const processedData =
            transformToDBFields.transformSalesByPaymentsEdit(rawUpdateData);

          console.log('💾 [PaymentEditDrawer] 수정 데이터:', processedData);

          // API 호출
          const { apiService } = await import('@shared/api/apiService');
          await apiService.put(
            `/sfa-by-payment-withhistory/${paymentId}`,
            processedData,
          );

          // 성공 후 데이터 갱신
          await actions.data.fetchSfaDetail(data.id);

          if (onSave) {
            onSave();
          }

          onClose();
          alert('✅ 수정이 완료되었습니다.');
        }
      } else if (mode === 'add') {
        // 추가 모드
        if (isNewSfa) {
          // 🆕 SFA 신규 등록 모드: Redux store에 임시 저장
          console.log('💾 [PaymentEditDrawer] 신규 SFA 모드 - Redux 저장:', localPayments);

          // 현재 Redux store의 sfaByPayments 가져오기
          const currentPayments = form.data.sfaByPayments || [];

          // 새 payment들에 임시 ID 부여 (기존 최대 ID + 1부터)
          const maxId = currentPayments.reduce((max, p) => {
            const id = parseInt(p.id) || 0;
            return id > max ? id : max;
          }, 0);

          const paymentsWithId = localPayments.map((payment, index) => ({
            ...payment,
            id: maxId + index + 1, // 임시 ID
            __isNew: true, // 신규 payment 표시
          }));

          // Redux store 업데이트
          actions.form.updateField('sfaByPayments', [
            ...currentPayments,
            ...paymentsWithId,
          ]);

          console.log('💾 [PaymentEditDrawer] Redux 저장 완료:', paymentsWithId);

          if (onSave) {
            onSave();
          }

          onClose();
          alert(`✅ ${localPayments.length}개의 결제매출이 추가되었습니다.`);
        } else {
          // 기존 SFA 상세보기 모드: DB에 직접 저장
          const { transformToDBFields } = await import('../../utils/transformUtils');
          const { apiService } = await import('@shared/api/apiService');

          console.log('💾 [PaymentEditDrawer] 상세보기 모드 - DB 저장:', localPayments);

          // 각 payment를 DB에 저장
          const savePromises = localPayments.map(async (payment) => {
            // DB 필드로 변환
            const paymentData = transformToDBFields.transformSalesByPayments(payment);

            // sfa 연결 추가
            const processedData = {
              ...paymentData,
              sfa: data.id, // sfaId 추가
            };

            console.log('💾 [PaymentEditDrawer] 변환된 데이터:', processedData);

            // API 호출
            return apiService.post('/sfa-by-payment-withhistory', processedData);
          });

          // 모든 저장 완료 대기
          await Promise.all(savePromises);

          console.log('💾 [PaymentEditDrawer] 모든 결제매출 저장 완료');

          // 성공 후 데이터 갱신
          await actions.data.fetchSfaDetail(data.id);

          if (onSave) {
            onSave();
          }

          onClose();
          alert(`✅ ${localPayments.length}개의 결제매출이 저장되었습니다.`);
        }
      }
    } catch (error) {
      console.error('💾 [PaymentEditDrawer] 저장 실패:', error);
      alert('❌ 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      actions.form.setSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (
      window.confirm(
        '저장하지 않은 변경사항이 있습니다.\n정말 취소하시겠습니까?',
      )
    ) {
      setLocalPayments([]);
      setPaymentCount(1);
      setValidationErrors([]);
      onClose();
    }
  };

  if (!localPayments || localPayments.length === 0) {
    return null;
  }

  return (
    <Drawer
      visible={visible}
      title={mode === 'add' ? '결제매출 추가' : '결제매출 수정'}
      onClose={handleCancel}
      width={DRAWER_SIZES.LG} // 800px
      level="secondary" // 중첩 Drawer로 설정 (body 스크롤 제어 비활성화)
      enableOverlayClick={false}
      showCloseButton={true}
      animationEnabled={true}
      zIndex={60} // SFA Drawer(50)보다 위
    >
      <div className="space-y-4">
        {/* 추가 모드: 수량 선택 드롭다운 */}
        {mode === 'add' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="text-sm font-medium text-gray-700">
              추가할 결제매출 수량:
            </label>
            <div className="relative">
              <select
                value={paymentCount}
                onChange={(e) => handleCountChange(e.target.value)}
                disabled={form.isSubmitting}
                className="
                  appearance-none
                  px-4 py-2 pr-10
                  bg-white border border-gray-300 rounded-md
                  text-sm font-medium text-gray-900
                  hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}개
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <span className="text-sm text-gray-600">
              (현재 {localPayments.length}개 입력 중)
            </span>
          </div>
        )}

        {/* 유효성 검사 에러 메시지 */}
        {validationErrors.length > 0 && (
          <div
            className="p-3 bg-red-50 border border-red-200 rounded-md"
            data-validation-error
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">입력 오류</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 결제매출 폼 목록 */}
        {localPayments.map((payment, index) => (
          <div key={index} className="space-y-2">
            {/* 다중 추가 시 폼 번호 표시 */}
            {mode === 'add' && localPayments.length > 1 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
                <span className="text-sm font-semibold text-gray-700">
                  결제매출 #{index + 1}
                </span>
              </div>
            )}

            <SalesAddByPayment
              payment={payment}
              index={index}
              isSameBilling={data?.isSameBilling}
              onChange={handleFieldChange}
              onRemove={() => {}} // 폼 삭제 불가
              isSubmitting={form.isSubmitting}
              handleRevenueSourceSelect={(customer) => handleRevenueSourceSelect(index, customer)}
              savedRevenueSources={uniqueRevenueSources}
              codebooks={codebooks}
              isLoadingCodebook={isLoadingCodebook}
              isExisting={mode === 'edit'}
              isMultiTeam={data?.isMultiTeam || false}
              sfaByItems={data?.sfaByItems || []}
              onAllocationChange={handleAllocationChange}
            />

            {/* 폼 사이 구분선 (마지막 제외) */}
            {mode === 'add' && index < localPayments.length - 1 && (
              <div className="border-t-2 border-dashed border-gray-200 my-6" />
            )}
          </div>
        ))}

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={form.isSubmitting}
            className="w-[120px]"
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={form.isSubmitting}
            className="w-[120px]"
          >
            {form.isSubmitting ? '처리중...' : '저장'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

PaymentEditDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']).isRequired,
  data: PropTypes.object.isRequired,
  payment: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  isNewSfa: PropTypes.bool,
};

export default PaymentEditDrawer;
