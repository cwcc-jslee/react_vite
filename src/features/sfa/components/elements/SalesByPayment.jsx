// src/features/sfa/components/drawer/SalesByPayment.jsx
/**
 * 매출 결제 정보를 입력받는 컴포넌트
 * 결제 구분, 확정여부, 매출확률, 매출액, 이익/마진 등의 정보를 관리
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { Trash2 } from 'lucide-react';
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

const SalesByPayment = ({
  payments = [],
  onChange,
  onRemove,
  isSubmitting,
}) => {
  // 매출액 임시 입력 상태 관리를 위한 state 추가
  const [displayValues, setDisplayValues] = useState({});
  const isFormatting = useRef(false);
  // 입력 중인 금액을 관리하는 상태
  const [inputAmounts, setInputAmounts] = useState({});
  const inputRefs = useRef([]);
  // 결제구분, 매출확률 codebook
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook(['re_payment_method', 'sfa_percentage']);

  // 이익/마진 금액 자동 계산 useEffect 수정
  useEffect(() => {
    if (!isFormatting.current) {
      payments.forEach((entry, index) => {
        const amount = Number(entry.amount) || 0;
        const marginProfitValue = Number(entry.marginProfitValue) || 0;
        const calculatedProfitAmount = entry.isProfit
          ? marginProfitValue
          : (amount * marginProfitValue) / 100;

        if (calculatedProfitAmount !== Number(entry.profitAmount)) {
          onChange(index, 'profitAmount', calculatedProfitAmount.toString());
        }
      });
    }
  }, [payments, onChange]);

  // useEffect를 사용하여 payments가 변경될 때마다 displayValues를 업데이트합니다.
  // useEffect(() => {
  //   const initialDisplayValues = {};
  //   payments.forEach((payment, index) => {
  //     initialDisplayValues[index] = formatDisplayNumber(payment.amount || '');
  //   });
  //   setDisplayValues(initialDisplayValues);
  // }, [payments]);

  // useEffect(() => {
  //   if (inputRefs.current[index]) {
  //     inputRefs.current[index].focus();
  //   }
  // }, [payments]);

  // useEffect(() => {
  //   console.log('SalesByPayment rendered:', {
  //     payments,
  //     isSubmitting,
  //     // paymentData,
  //     // percentageData,
  //   });
  // }, [payments, isSubmitting]);

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
    if (numericValue !== payments[index].amount) {
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
      [index]: payments[index].amount,
    }));
  };

  // 금액 입력 필드 블러 처리
  const handleAmountBlur = (index) => {
    const numericValue = payments[index].amount;
    const formattedValue = formatDisplayNumber(numericValue);
    setDisplayValues((prev) => ({
      ...prev,
      [index]: formattedValue,
    }));
  };

  // 이익/마진 값 변경 처리
  const handleEntryChange = (index, field, value) => {
    if (['amount', 'marginProfitValue', 'isProfit'].includes(field)) {
      const payment = payments[index];
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

  if (!payments?.length) return null;

  return (
    <div className="flex flex-col gap-6 px-5">
      {payments.map((payment, index) => (
        <div
          key={payment.id}
          className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md"
        >
          <div className="grid grid-cols-[1.5fr,0.8fr,1fr,1fr,auto,0.5fr,1fr] gap-3 items-center">
            <Select
              value={payment.billingType}
              onChange={(e) => onChange(index, 'billingType', e.target.value)}
              disabled={isSubmitting || isLoadingCodebook}
              required
            >
              <option value="">결제구분 선택</option>
              {codebooks?.re_payment_method?.data?.map((method) => (
                <option key={method.id} value={method.code}>
                  {method.name}
                </option>
              ))}
            </Select>

            <label className="flex items-center gap-1">
              <Checkbox
                checked={payment.isConfirmed}
                onChange={(e) => handleConfirmedChange(index, e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <span>확정여부</span>
            </label>

            <Select
              value={payment.probability}
              onChange={(e) => onChange(index, 'probability', e.target.value)}
              disabled={
                isSubmitting || isLoadingCodebook || payment.isConfirmed
              }
            >
              <option value="">매출확률 선택</option>
              {codebooks?.sfa_percentage?.data?.map((percent) => (
                <option key={percent.id} value={percent.code}>
                  {percent.name}
                </option>
              ))}
            </Select>

            <Input
              type="text"
              value={
                displayValues[index] ||
                formatDisplayNumber(payment.amount || '')
              }
              onChange={(e) => handleAmountChange(index, e.target.value)}
              placeholder="매출액"
              disabled={isSubmitting}
              className="text-right"
            />

            <div className="flex items-center justify-center">
              <Switch
                checked={payment.isProfit}
                onChange={() =>
                  handleEntryChange(index, 'isProfit', !payment.isProfit)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="text-center">
              {payment.isProfit ? '이익' : '마진'}
            </div>

            <Input
              type="number"
              value={payment.marginProfitValue}
              onChange={(e) =>
                handleEntryChange(index, 'marginProfitValue', e.target.value)
              }
              disabled={isSubmitting}
            />
          </div>

          {/* 두 번째 행 - 날짜 및 메모 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">매출인식일자</span>
              <Input
                type="date"
                value={payment.recognitionDate}
                onChange={(e) =>
                  onChange(index, 'recognitionDate', e.target.value)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">결제일자</span>
              <Input
                type="date"
                value={payment.scheduledDate}
                onChange={(e) =>
                  onChange(index, 'scheduledDate', e.target.value)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">메모</span>
              <Input
                type="text"
                value={payment.memo}
                onChange={(e) => onChange(index, 'memo', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">매출이익</span>
                <Input
                  type="text"
                  // value={formatDisplayNumber(payment.profitAmount)}
                  value={Math.round(payment.profitAmount)}
                  readOnly
                  disabled={true}
                  className="bg-gray-100 text-right"
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

export default SalesByPayment;
