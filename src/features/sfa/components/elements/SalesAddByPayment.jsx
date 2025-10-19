// src/features/sfa/components/elements/SalesAddByPayment.jsx
/**
 * 매출 결제 정보를 입력받는 컴포넌트
 * 결제 구분, 확정여부, 매출확률, 매출액, 이익/마진 등의 정보를 관리
 */
import React, { useEffect, useState, useCallback } from 'react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import {
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import {
  Group,
  Select,
  Input,
  Checkbox,
  Switch,
} from '../../../../shared/components/ui';
import {
  formatDisplayNumber,
  ensureNumericAmount,
} from '../../../../shared/utils/format/number';
import { truncateText } from '../../../../shared/utils/textUtils';

const SalesAddByPayment = ({
  payment,
  index,
  isSameBilling,
  onChange,
  onRemove,
  isSubmitting,
  handleRevenueSourceSelect,
  savedRevenueSources,
  codebooks,
  isLoadingCodebook,
  isMultiTeam = false,
  sfaByItems = [],
  onPaymentAmountChange,
  onAllocationChange,
  onAutoAllocateByRatio,
  onEqualDistribute,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [allocationDisplayValues, setAllocationDisplayValues] = useState({});
  const [isRevenueSearch, setIsRevenueSearch] = useState(false);

  // 로컬 입력 상태 관리 (연속 입력을 위해)
  const [localMarginProfit, setLocalMarginProfit] = useState('');
  const [localPaymentLabel, setLocalPaymentLabel] = useState('');
  const [localMemo, setLocalMemo] = useState('');

  console.log('>>payment : ', payment);
  console.log('>>index : ', index);
  console.log('>>isSameBilling : ', isSameBilling);

  // payment 변경 감지
  useEffect(() => {
    console.log('🔍 [SalesAddByPayment] Payment prop changed:', {
      index,
      isConfirmed: payment.isConfirmed,
      payment: payment,
    });
  }, [payment.isConfirmed, payment, index]);

  // payment.amount 변경 시 displayValue 동기화
  useEffect(() => {
    // 포커스가 없을 때만 동기화 (입력 중이 아닐 때)
    if (document.activeElement?.name !== `amount-${index}`) {
      setDisplayValue('');
    }
  }, [payment.amount, index]);

  // 할당액 입력 필드 포커스 처리
  const handleAllocationFocus = (teamIndex) => {
    const allocation = payment.teamAllocations[teamIndex];
    setAllocationDisplayValues((prev) => ({
      ...prev,
      [teamIndex]: String(allocation.allocatedAmount || ''),
    }));
  };

  // 할당액 입력 필드 블러 처리 (부모로 전달)
  const handleAllocationBlur = (teamIndex) => {
    const currentValue = allocationDisplayValues[teamIndex];
    const sanitizedValue = currentValue?.replace(/[^\d]/g, '') || '';

    // 값이 변경되었으면 부모로 전달
    const currentAllocation = payment.teamAllocations[teamIndex];
    if (sanitizedValue !== String(currentAllocation?.allocatedAmount || '')) {
      if (onAllocationChange) {
        onAllocationChange(index, teamIndex, sanitizedValue);
      }
    }

    // displayValue를 삭제하여 포맷된 값을 표시하도록 함
    setAllocationDisplayValues((prev) => {
      const newValues = { ...prev };
      delete newValues[teamIndex];
      return newValues;
    });
  };

  // 할당액 변경 처리 (로컬 상태만 업데이트)
  const handleAllocationInputChange = (teamIndex, value) => {
    const sanitizedValue = value.replace(/[^\d]/g, '');

    setAllocationDisplayValues((prev) => ({
      ...prev,
      [teamIndex]: sanitizedValue,
    }));
  };

  // 금액 입력 처리 (로컬 상태만 업데이트)
  const handleAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^\d,]/g, '');
    setDisplayValue(sanitizedValue);
  };

  // 금액 입력 필드 포커스 처리
  const handleAmountFocus = () => {
    setDisplayValue(payment.amount || '');
  };

  // 금액 입력 필드 블러 처리 (부모로 전달)
  const handleAmountBlur = () => {
    const numericValue = displayValue.replace(/,/g, '');

    console.log('💰 [handleAmountBlur] 매출액 blur:', {
      index,
      numericValue,
      currentAmount: payment.amount,
      hasTeamAllocations: !!payment.teamAllocations,
      teamAllocationsLength: payment.teamAllocations?.length,
      hasOnPaymentAmountChange: !!onPaymentAmountChange,
    });

    if (numericValue !== payment.amount) {
      // 팀 할당이 있고 핸들러가 제공된 경우 onPaymentAmountChange 사용
      if (onPaymentAmountChange && payment.teamAllocations && payment.teamAllocations.length > 0) {
        console.log('✅ [handleAmountBlur] onPaymentAmountChange 호출');
        onPaymentAmountChange(index, numericValue);
      } else {
        // 팀 할당이 없거나 핸들러가 없으면 기본 onChange
        console.log('✅ [handleAmountBlur] onChange 호출');
        onChange(index, 'amount', numericValue);
      }
    }

    // 포맷된 값으로 표시
    const formattedValue = formatDisplayNumber(numericValue);
    setDisplayValue(formattedValue);
  };

  // 이익/마진 값 변경 처리 (로컬 상태로 관리)
  const handleEntryChange = (field, value) => {
    console.log('🔧 [SalesAddByPayment] handleEntryChange called:', {
      index,
      field,
      value,
      currentPayment: payment,
    });

    if (field === 'marginProfitValue') {
      // 로컬 상태에 저장만
      setLocalMarginProfit(value);
    } else if (['amount', 'isProfit'].includes(field)) {
      const amount = Number(field === 'amount' ? value : payment.amount) || 0;
      const marginProfitValue =
        Number(
          field === 'marginProfitValue' ? value : (localMarginProfit || payment.marginProfitValue),
        ) || 0;
      const isProfit = field === 'isProfit' ? value : payment.isProfit;

      const calculatedProfitAmount = isProfit
        ? marginProfitValue
        : (amount * marginProfitValue) / 100;

      // 정수로 반올림하여 저장
      const roundedProfitAmount = Math.round(calculatedProfitAmount);

      // 한 번에 여러 필드 업데이트
      const updates = {
        [field]: value,
        profitAmount: roundedProfitAmount.toString(),
      };

      console.log('🔧 [SalesAddByPayment] Entry updates:', updates);

      // 여러 필드를 한 번에 업데이트 (객체 형태로 전달)
      onChange(index, updates);
    } else {
      onChange(index, field, value);
    }
  };

  // 마진율/이익 필드 블러 처리
  const handleMarginProfitBlur = () => {
    if (localMarginProfit !== payment.marginProfitValue) {
      const amount = Number(payment.amount) || 0;
      const marginProfitValue = Number(localMarginProfit) || 0;
      const isProfit = payment.isProfit;

      const calculatedProfitAmount = isProfit
        ? marginProfitValue
        : (amount * marginProfitValue) / 100;

      const roundedProfitAmount = Math.round(calculatedProfitAmount);

      const updates = {
        marginProfitValue: localMarginProfit,
        profitAmount: roundedProfitAmount.toString(),
      };

      onChange(index, updates);
    }
  };

  // 확정여부 변경 처리 - 한 번에 여러 필드 업데이트
  const handleConfirmedChange = (checked) => {
    console.log('🔧 [SalesAddByPayment] handleConfirmedChange called:', {
      index,
      checked,
      currentPayment: payment,
    });

    // 한 번에 여러 필드 업데이트
    const updates = {
      isConfirmed: checked,
      ...(checked && { probability: '100' }),
    };

    console.log('🔧 [SalesAddByPayment] Applying updates:', updates);

    // 여러 필드를 한 번에 업데이트 (객체 형태로 전달)
    onChange(index, updates);
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-300">
            #{index + 1}
          </span>
          <h4 className="text-sm font-medium text-gray-700">결제매출 정보</h4>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 transition-colors"
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* 섹션 1: 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            매출처
          </span>
          <div className="relative h-9">
            {isSameBilling && payment?.revenueSource?.id ? (
              <div className="flex items-center rounded-lg bg-green-50 px-3 py-2">
                <span className="text-sm text-green-700">
                  {truncateText(payment?.revenueSource?.name, 8)}
                </span>
              </div>
            ) : !isSameBilling && savedRevenueSources?.length > 0 ? (
              isRevenueSearch ? (
                <CustomerSearchInput
                  onSelect={(customer) => {
                    handleRevenueSourceSelect(customer, index);
                    setIsRevenueSearch(false);
                  }}
                  disabled={isSubmitting}
                />
              ) : (
                <Select
                  value={payment.revenueSource.name}
                  onChange={(e) => {
                    if (e.target.value === 'search') {
                      setIsRevenueSearch(true);
                      onChange(index, 'revenueSource', {});
                    } else {
                      setIsRevenueSearch(false);
                      const selectedSource = savedRevenueSources.find(
                        (source) => source.name === e.target.value,
                      );
                      if (selectedSource) {
                        onChange(index, 'revenueSource', selectedSource);
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="h-9"
                >
                  <option>**매출처 등록**</option>
                  <option value="search">--검색--</option>
                  {savedRevenueSources.map((source) => (
                    <option key={source.id} value={source.name}>
                      {truncateText(source.name, 15)}
                    </option>
                  ))}
                </Select>
              )
            ) : (
              <CustomerSearchInput
                onSelect={(customer) => {
                  handleRevenueSourceSelect(customer, index);
                  setIsRevenueSearch(false);
                }}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5">
            결제구분 <span className="text-red-500">*</span>
          </span>
          <Select
            value={payment.billingType}
            onChange={(e) => onChange(index, 'billingType', e.target.value)}
            disabled={isSubmitting || isLoadingCodebook}
            required
            className="h-9"
          >
            <option value="">선택하세요</option>
            {codebooks?.rePaymentMethod?.map((method) => (
              <option key={method.id} value={method.code}>
                {method.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 섹션 2: 금액 정보 */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
        <h5 className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
          금액 정보
        </h5>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 mb-1.5">
              매출액 <span className="text-red-500">*</span>
            </span>
            <Input
              type="text"
              name={`amount-${index}`}
              value={displayValue || formatDisplayNumber(payment.amount || '')}
              onChange={(e) => handleAmountChange(e.target.value)}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              placeholder="0"
              disabled={isSubmitting}
              className="text-right h-9 bg-white"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 mb-1.5">
              이익/마진 구분
            </span>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={payment.isProfit}
                  onChange={() => handleEntryChange('isProfit', true)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">이익</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!payment.isProfit}
                  onChange={() => handleEntryChange('isProfit', false)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">마진</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 mb-1.5">
              {payment.isProfit ? '매출이익' : '마진율'}
            </span>
            <Input
              type="text"
              name={`marginProfit-${index}`}
              value={localMarginProfit !== '' ? localMarginProfit : payment.marginProfitValue}
              onChange={(e) =>
                handleEntryChange('marginProfitValue', e.target.value)
              }
              onFocus={() => setLocalMarginProfit(payment.marginProfitValue || '')}
              onBlur={handleMarginProfitBlur}
              disabled={isSubmitting}
              className="h-9 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-blue-200">
          <span className="text-xs text-gray-600 mr-2">매출이익:</span>
          <span className="text-sm font-semibold text-gray-800">
            {Math.round(payment.profitAmount).toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 섹션 3: 확정 및 확률 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5">
            확정여부
          </span>
          <div className="flex items-center gap-3 h-9">
            <input
              type="checkbox"
              checked={Boolean(payment.isConfirmed)}
              onChange={(e) => handleConfirmedChange(e.target.checked)}
              disabled={isSubmitting}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              {payment.isConfirmed ? (
                <>
                  <CheckCircle2 className="text-green-500" size={18} />
                  <span className="text-sm font-medium text-green-700">
                    확정
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-500">미확정</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5">
            매출확률 {!payment.isConfirmed && <span className="text-red-500">*</span>}
          </span>
          <Select
            value={payment.probability}
            onChange={(e) => onChange(index, 'probability', e.target.value)}
            disabled={isSubmitting || isLoadingCodebook || payment.isConfirmed}
            className="h-9"
          >
            <option value="">선택하세요</option>
            {codebooks?.sfaPercentage?.map((percent) => (
              <option key={percent.id} value={percent.code}>
                {percent.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 섹션 4: 일정 및 부가정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Calendar size={12} />
            매출인식일자
          </span>
          <Input
            type="date"
            value={payment.recognitionDate}
            onChange={(e) =>
              onChange(index, 'recognitionDate', e.target.value)
            }
            disabled={isSubmitting}
            className="h-9"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Calendar size={12} />
            결제일자
          </span>
          <Input
            type="date"
            value={payment.scheduledDate}
            onChange={(e) => onChange(index, 'scheduledDate', e.target.value)}
            disabled={isSubmitting}
            className="h-9"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5">
            라벨
          </span>
          <Input
            type="text"
            name={`paymentLabel-${index}`}
            value={localPaymentLabel !== '' ? localPaymentLabel : payment.paymentLabel}
            onChange={(e) => setLocalPaymentLabel(e.target.value)}
            onFocus={() => setLocalPaymentLabel(payment.paymentLabel || '')}
            onBlur={() => {
              if (localPaymentLabel !== payment.paymentLabel) {
                onChange(index, 'paymentLabel', localPaymentLabel);
              }
            }}
            disabled={isSubmitting}
            placeholder="예: 1차 계약금"
            className="h-9"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600 mb-1.5">
            메모
          </span>
          <Input
            type="text"
            name={`memo-${index}`}
            value={localMemo !== '' ? localMemo : payment.memo}
            onChange={(e) => setLocalMemo(e.target.value)}
            onFocus={() => setLocalMemo(payment.memo || '')}
            onBlur={() => {
              if (localMemo !== payment.memo) {
                onChange(index, 'memo', localMemo);
              }
            }}
            disabled={isSubmitting}
            placeholder="메모를 입력하세요"
            className="h-9"
          />
        </div>
      </div>

      {/* 팀 할당 섹션 - 사업부 매출이 있을 때만 표시 */}
      {sfaByItems.length > 0 && payment.teamAllocations && payment.teamAllocations.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              사업부별 매출 할당
              {!isMultiTeam && <span className="ml-2 text-xs text-gray-500">(단일 사업부 - 자동 할당)</span>}
            </h4>
            {isMultiTeam && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAutoAllocateByRatio && onAutoAllocateByRatio(index)}
                  disabled={true}
                  className="text-xs px-2 py-1 bg-gray-400 text-white rounded cursor-not-allowed opacity-50"
                  title="향후 구현 예정"
                >
                  비율 배분
                </button>
                <button
                  type="button"
                  onClick={() => onEqualDistribute && onEqualDistribute(index)}
                  disabled={true}
                  className="text-xs px-2 py-1 bg-gray-400 text-white rounded cursor-not-allowed opacity-50"
                  title="향후 구현 예정"
                >
                  균등 배분
                </button>
              </div>
            )}
          </div>

          {/* 단일 사업부 - 읽기 전용 표시 */}
          {!isMultiTeam && payment.teamAllocations[0] && (
            <div className="grid grid-cols-[1.5fr,1.5fr,1fr] gap-2 items-center bg-white p-2 rounded">
              <div className="text-sm">
                <span className="text-gray-500">사업부:</span>{' '}
                <span className="font-medium">{payment.teamAllocations[0].teamName}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">매출품목:</span>{' '}
                <span className="font-medium">{payment.teamAllocations[0].itemName}</span>
              </div>
              <div className="text-sm text-right">
                <span className="text-gray-500">할당액:</span>{' '}
                <span className="font-medium text-blue-600">
                  {formatDisplayNumber(payment.teamAllocations[0].allocatedAmount || 0)}원
                </span>
              </div>
            </div>
          )}

          {/* 다중 사업부 - 수동 입력 (1라인, 매출품목과 할당액만 표시) */}
          {isMultiTeam && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                {payment.teamAllocations.map((allocation, teamIndex) => (
                  <React.Fragment key={teamIndex}>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {allocation.itemName}
                      </span>
                      <Input
                        type="text"
                        name={`allocation-${index}-${teamIndex}`}
                        value={
                          allocationDisplayValues[teamIndex] !== undefined
                            ? formatDisplayNumber(allocationDisplayValues[teamIndex])
                            : formatDisplayNumber(allocation.allocatedAmount || 0)
                        }
                        onChange={(e) => handleAllocationInputChange(teamIndex, e.target.value)}
                        onFocus={() => handleAllocationFocus(teamIndex)}
                        onBlur={() => handleAllocationBlur(teamIndex)}
                        placeholder="할당액"
                        disabled={isSubmitting}
                        className="text-right h-8 flex-1"
                      />
                    </div>
                    {teamIndex < payment.teamAllocations.length - 1 && (
                      <span className="text-gray-300">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* 할당 합계 표시 */}
              <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">할당 합계:</span>
                <span className={`text-sm font-medium ${
                  payment.teamAllocations.reduce((sum, a) => sum + parseFloat(a.allocatedAmount || 0), 0) === parseFloat(payment.amount || 0)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatDisplayNumber(
                    payment.teamAllocations.reduce((sum, a) => sum + parseFloat(a.allocatedAmount || 0), 0)
                  )}원
                  {payment.amount && payment.teamAllocations.reduce((sum, a) => sum + parseFloat(a.allocatedAmount || 0), 0) !== parseFloat(payment.amount || 0) && (
                    <span className="ml-2 text-xs">
                      (차이: {formatDisplayNumber(
                        Math.abs(parseFloat(payment.amount || 0) - payment.teamAllocations.reduce((sum, a) => sum + parseFloat(a.allocatedAmount || 0), 0))
                      )}원)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesAddByPayment;
