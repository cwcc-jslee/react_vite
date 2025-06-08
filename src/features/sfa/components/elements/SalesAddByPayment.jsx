// src/features/sfa/components/drawer/SalesByPayment.jsx
/**
 * 매출 결제 정보를 입력받는 컴포넌트
 * 결제 구분, 확정여부, 매출확률, 매출액, 이익/마진 등의 정보를 관리
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
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
  formData,
  // payments = [],
  onChange,
  onRemove,
  isSubmitting,
  handleRevenueSourceSelect,
}) => {
  // 매출액 임시 입력 상태 관리를 위한 state 추가
  const [displayValues, setDisplayValues] = useState({});
  const isFormatting = useRef(false);
  // 입력 중인 금액을 관리하는 상태
  const [inputAmounts, setInputAmounts] = useState({});
  const inputRefs = useRef([]);
  // revenueSource 정보를 저장하는 ref
  const savedRevenueSourcesRef = useRef([]);

  // 결제구분, 매출확률 codebook
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook(['rePaymentMethod', 'sfaPercentage']);

  const { salesByPayments = [] } = formData;

  console.log(`formData: `, formData);
  console.log(`salesByPayments: `, salesByPayments);

  // salesByPayments의 revenueSource 정보를 수집하고 중복 제거
  useEffect(() => {
    const currentRevenueSources = salesByPayments
      .map((payment) => payment.revenueSource)
      .filter((source) => source?.id && source?.name);

    // 기존 저장된 데이터와 현재 데이터를 합치고 중복 제거
    const allSources = [
      ...savedRevenueSourcesRef.current,
      ...currentRevenueSources,
    ];
    const uniqueSources = allSources.reduce((acc, current) => {
      const exists = acc.find((item) => item.id === current.id);
      if (!exists) {
        acc.push({ id: current.id, name: current.name });
      }
      return acc;
    }, []);

    savedRevenueSourcesRef.current = uniqueSources;
  }, [salesByPayments]);

  // 이익/마진 금액 자동 계산 useEffect 수정
  useEffect(() => {
    if (!isFormatting.current) {
      salesByPayments.forEach((entry, index) => {
        const amount = Number(entry.amount) || 0;
        const marginProfitValue = Number(entry.marginProfitValue) || 0;
        const calculatedProfitAmount = entry.isProfit
          ? marginProfitValue
          : (amount * marginProfitValue) / 100;

        if (calculatedProfitAmount !== Number(entry.profitAmount)) {
          // setTimeout을 사용하여 렌더링 사이클 이후에 상태 업데이트
          setTimeout(() => {
            onChange(index, 'profitAmount', calculatedProfitAmount.toString());
          }, 0);
        }
      });
    }
  }, [salesByPayments, onChange]);

  // useEffect를 사용하여 payments가 변경될 때마다 displayValues를 업데이트합니다.
  // useEffect(() => {
  //   const initialDisplayValues = {};
  //   salesByPayments.forEach((payment, index) => {
  //     initialDisplayValues[index] = formatDisplayNumber(payment.amount || '');
  //   });
  //   setDisplayValues(initialDisplayValues);
  // }, [salesByPayments]);

  // useEffect(() => {
  //   if (inputRefs.current[index]) {
  //     inputRefs.current[index].focus();
  //   }
  // }, [salesByPayments]);

  // useEffect(() => {
  //   console.log('SalesByPayment rendered:', {
  //     salesByPayments,
  //     isSubmitting,
  //     // paymentData,
  //     // percentageData,
  //   });
  // }, [salesByPayments, isSubmitting]);

  // 금액 입력 처리
  const handleAmountChange = (index, value) => {
    // 숫자와 쉼표만 허용
    const sanitizedValue = value.replace(/[^\d,]/g, '');
    setDisplayValues((prev) => ({
      ...prev,
      [index]: sanitizedValue,
    }));

    // 실제 값 업데이트는 쉼표를 제거한 숫자만
    const numericValue = sanitizedValue.replace(/,/g, '');
    if (numericValue !== salesByPayments[index].amount) {
      isFormatting.current = true;
      onChange(index, 'amount', numericValue);
      setTimeout(() => {
        isFormatting.current = false;
      }, 0);
    }
  };

  // 금액 입력 필드 포커스 처리
  const handleAmountFocus = (index) => {
    // 포커스 시 쉼표가 제거된 원래 숫자 값 표시
    setDisplayValues((prev) => ({
      ...prev,
      [index]: salesByPayments[index].amount,
    }));
  };

  // 금액 입력 필드 블러 처리
  const handleAmountBlur = (index) => {
    const numericValue = salesByPayments[index].amount;
    const formattedValue = formatDisplayNumber(numericValue);
    setDisplayValues((prev) => ({
      ...prev,
      [index]: formattedValue,
    }));
  };

  // 이익/마진 값 변경 처리
  const handleEntryChange = (index, field, value) => {
    if (['amount', 'marginProfitValue', 'isProfit'].includes(field)) {
      const payment = salesByPayments[index];
      const amount = Number(field === 'amount' ? value : payment.amount) || 0;
      const marginProfitValue =
        Number(
          field === 'marginProfitValue' ? value : payment.marginProfitValue,
        ) || 0;
      const isProfit = field === 'isProfit' ? value : payment.isProfit;

      isFormatting.current = true;
      onChange(index, field, value);

      const calculatedProfitAmount = isProfit
        ? marginProfitValue
        : (amount * marginProfitValue) / 100;

      onChange(index, 'profitAmount', calculatedProfitAmount.toString());

      setTimeout(() => {
        isFormatting.current = false;
      }, 0);
    } else {
      onChange(index, field, value);
    }
  };

  // 확정여부 변경 처리
  const handleConfirmedChange = (index, checked) => {
    isFormatting.current = true;
    onChange(index, 'isConfirmed', checked);
    if (checked) {
      onChange(index, 'probability', '100');
    }
    setTimeout(() => {
      isFormatting.current = false;
    }, 0);
  };

  if (!salesByPayments?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {salesByPayments.map((payment, index) => (
        <div
          key={`payment-${payment.id || index}`}
          className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md"
        >
          <div className="grid grid-cols-[1.2fr,0.8fr,0.4fr,0.7fr,1fr,0.4fr,1fr] gap-3 items-center">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1 h-4 flex items-center">
                매출처
              </span>
              <div className="relative h-9">
                {formData.isSameBilling && payment?.revenueSource?.id ? (
                  <div className="flex items-center rounded-lg bg-green-50 px-3 py-2">
                    <span className="text-sm text-green-700">
                      {truncateText(payment?.revenueSource?.name, 8)}
                    </span>
                  </div>
                ) : !formData.isSameBilling &&
                  savedRevenueSourcesRef?.current.length > 0 ? (
                  <Select
                    value={payment.revenueSource.name}
                    onChange={(e) => {
                      if (e.target.value === 'search') {
                        console.log('>>>> 선택 : ', e.target);
                        // 매출처 검색 선택 시 revenueSource 초기화
                        onChange(index, 'revenueSource', {});
                      } else {
                        // 저장된 매출처 선택 시
                        const selectedSource =
                          savedRevenueSourcesRef.current.find(
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
                    <option>-------</option>
                    <option value="search">매출처 검색</option>
                    {savedRevenueSourcesRef.current.map((source) => (
                      <option key={source.id} value={source.name}>
                        {truncateText(source.name, 15)}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <CustomerSearchInput
                    onSelect={(customer) =>
                      handleRevenueSourceSelect(customer, index)
                    }
                    disabled={isSubmitting}
                    // error={}
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
                <Checkbox
                  checked={payment.isConfirmed}
                  onChange={(e) =>
                    handleConfirmedChange(index, e.target.checked)
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4"
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
                  onChange={(e) =>
                    onChange(index, 'probability', e.target.value)
                  }
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
                value={
                  displayValues[index] ||
                  formatDisplayNumber(payment.amount || '')
                }
                onChange={(e) => handleAmountChange(index, e.target.value)}
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
                    onChange={() => handleEntryChange(index, 'isProfit', true)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs">이익</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!payment.isProfit}
                    onChange={() => handleEntryChange(index, 'isProfit', false)}
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
                  handleEntryChange(index, 'marginProfitValue', e.target.value)
                }
                disabled={isSubmitting}
                className="h-9"
              />
            </div>
          </div>

          {/* 두 번째 행 - 날짜 및 메모 */}
          <div className="grid grid-cols-[0.8fr,0.8fr,2fr,0.8fr] gap-3">
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
                  onChange={(e) =>
                    onChange(index, 'scheduledDate', e.target.value)
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
        </div>
      ))}
    </div>
  );
};

export default SalesAddByPayment;
