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
  const [isRevenueSearch, setIsRevenueSearch] = useState(false);

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

  // 금액 입력 처리
  const handleAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^\d,]/g, '');
    setDisplayValue(sanitizedValue);

    const numericValue = sanitizedValue.replace(/,/g, '');
    console.log('💰 [handleAmountChange] 매출액 변경:', {
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
        console.log('✅ [handleAmountChange] onPaymentAmountChange 호출');
        onPaymentAmountChange(index, numericValue);
      } else {
        // 팀 할당이 없거나 핸들러가 없으면 기본 onChange
        console.log('✅ [handleAmountChange] onChange 호출');
        onChange(index, 'amount', numericValue);
      }
    }
  };

  // 금액 입력 필드 포커스 처리
  const handleAmountFocus = () => {
    setDisplayValue(payment.amount);
  };

  // 금액 입력 필드 블러 처리
  const handleAmountBlur = () => {
    const formattedValue = formatDisplayNumber(payment.amount);
    setDisplayValue(formattedValue);
  };

  // 이익/마진 값 변경 처리
  const handleEntryChange = (field, value) => {
    console.log('🔧 [SalesAddByPayment] handleEntryChange called:', {
      index,
      field,
      value,
      currentPayment: payment,
    });

    if (['amount', 'marginProfitValue', 'isProfit'].includes(field)) {
      const amount = Number(field === 'amount' ? value : payment.amount) || 0;
      const marginProfitValue =
        Number(
          field === 'marginProfitValue' ? value : payment.marginProfitValue,
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
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md">
      <div className="grid grid-cols-[1.2fr,0.8fr,0.4fr,0.7fr,1fr,0.4fr,1fr] gap-3 items-center">
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
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            결제구분
          </span>
          <Select
            value={payment.billingType}
            onChange={(e) => onChange(index, 'billingType', e.target.value)}
            disabled={isSubmitting || isLoadingCodebook}
            required
            className="h-9"
          >
            <option value="">결제구분</option>
            {codebooks?.rePaymentMethod?.map((method) => (
              <option key={method.id} value={method.code}>
                {method.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-left">
            확정여부
          </span>
          <div className="flex items-center gap-2 h-9">
            <input
              type="checkbox"
              checked={Boolean(payment.isConfirmed)}
              onChange={(e) => {
                console.log('🔧 [SalesAddByPayment] Checkbox changed:', {
                  index,
                  oldValue: payment.isConfirmed,
                  newValue: e.target.checked,
                  payment: payment,
                });
                handleConfirmedChange(e.target.checked);
              }}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            {payment.isConfirmed ? (
              <CheckCircle2 className="text-green-500" size={16} />
            ) : (
              <XCircle className="text-gray-400" size={16} />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            매출확률
          </span>
          <div className="relative h-9">
            <Select
              value={payment.probability}
              onChange={(e) => onChange(index, 'probability', e.target.value)}
              disabled={
                isSubmitting || isLoadingCodebook || payment.isConfirmed
              }
              className="h-9"
            >
              <option value="">매출확률 선택</option>
              {codebooks?.sfaPercentage?.map((percent) => (
                <option key={percent.id} value={percent.code}>
                  {percent.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            매출액
          </span>
          <Input
            type="text"
            name={`amount-${index}`}
            value={displayValue || formatDisplayNumber(payment.amount || '')}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            placeholder="매출액"
            disabled={isSubmitting}
            className="text-right h-9"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-1 h-9 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={payment.isProfit}
                onChange={() => handleEntryChange('isProfit', true)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs">이익</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!payment.isProfit}
                onChange={() => handleEntryChange('isProfit', false)}
                disabled={isSubmitting}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs">마진</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            {payment.isProfit ? '매출이익' : '마진율'}
          </span>
          <Input
            type="text"
            value={payment.marginProfitValue}
            onChange={(e) =>
              handleEntryChange('marginProfitValue', e.target.value)
            }
            disabled={isSubmitting}
            className="h-9"
          />
        </div>
      </div>

      {/* 두 번째 행 - 날짜 및 메모 */}
      <div className="grid grid-cols-[0.8fr,0.8fr,1fr,1fr,0.8fr] gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            매출인식일자
          </span>
          <div className="relative h-9">
            <Input
              type="date"
              value={payment.recognitionDate}
              onChange={(e) =>
                onChange(index, 'recognitionDate', e.target.value)
              }
              disabled={isSubmitting}
              className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <Calendar
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            결제일자
          </span>
          <div className="relative h-9">
            <Input
              type="date"
              value={payment.scheduledDate}
              onChange={(e) => onChange(index, 'scheduledDate', e.target.value)}
              disabled={isSubmitting}
              className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <Calendar
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            라벨
          </span>
          <Input
            type="text"
            value={payment.paymentLabel}
            onChange={(e) => onChange(index, 'paymentLabel', e.target.value)}
            disabled={isSubmitting}
            className="h-9"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
            메모
          </span>
          <Input
            type="text"
            value={payment.memo}
            onChange={(e) => onChange(index, 'memo', e.target.value)}
            disabled={isSubmitting}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
              매출이익
            </span>
            <Input
              type="text"
              value={Math.round(payment.profitAmount)}
              readOnly
              disabled={true}
              className="bg-gray-100 text-right h-9"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="h-9 flex items-center justify-center"
          >
            <Trash2 size={20} className="text-gray-500 cursor-pointer" />
          </button>
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
                  disabled={isSubmitting || !payment.amount}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  비율 배분
                </button>
                <button
                  type="button"
                  onClick={() => onEqualDistribute && onEqualDistribute(index)}
                  disabled={isSubmitting || !payment.amount}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        value={formatDisplayNumber(allocation.allocatedAmount || 0)}
                        onChange={(e) => {
                          const numericValue = ensureNumericAmount(e.target.value);
                          onAllocationChange && onAllocationChange(index, teamIndex, numericValue);
                        }}
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
