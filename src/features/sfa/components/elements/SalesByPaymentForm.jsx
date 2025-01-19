// src/features/sfa/components/drawer/SalesByPayment.jsx
import React, { useEffect, useState } from 'react';
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
  errors,
  paymentMethodData,
  percentageData,
  isPaymentDataLoading,
}) => {
  // 매출액 임시 입력 상태 관리를 위한 state 추가
  const [tempInputs, setTempInputs] = useState({});

  // 이익/마진 금액 자동 계산 useEffect 수정
  useEffect(() => {
    payments.forEach((entry, index) => {
      const amount = Number(entry.amount) || 0;
      const marginProfitValue = Number(entry.marginProfitValue) || 0;
      let calculatedProfitAmount = 0;

      if (entry.isProfit) {
        calculatedProfitAmount = marginProfitValue;
      } else {
        calculatedProfitAmount = (amount * marginProfitValue) / 100;
      }

      // 기존 값과 다를 때만 업데이트
      if (calculatedProfitAmount !== Number(entry.profitAmount)) {
        onChange(index, 'profitAmount', calculatedProfitAmount.toString());
      }
    });
  }, [payments]);

  // 금액 입력 처리 함수 수정
  const handleAmountChange = (index, value) => {
    // 임시 입력값 저장
    setTempInputs((prev) => ({
      ...prev,
      [index]: value,
    }));

    // 숫자만 필터링하여 실제 값 업데이트
    const numericValue = ensureNumericAmount(value);
    handleEntryChange(index, 'amount', numericValue);
  };

  // blur 처리 함수 추가
  const handleAmountBlur = (index) => {
    setTempInputs((prev) => ({
      ...prev,
      [index]: '', // 임시 입력값 초기화
    }));
  };

  // 입력값 변경 시 이익/마진 금액 계산
  // handleEntryChange 함수 수정
  const handleEntryChange = (index, field, value) => {
    onChange(index, field, value);

    // amount, marginProfitValue, isProfit 변경 시에만 profitAmount 계산
    if (['amount', 'marginProfitValue', 'isProfit'].includes(field)) {
      const payment = payments[index];
      const amount = Number(field === 'amount' ? value : payment.amount) || 0;
      const marginProfitValue =
        Number(
          field === 'marginProfitValue' ? value : payment.marginProfitValue,
        ) || 0;
      const isProfit = field === 'isProfit' ? value : payment.isProfit;

      const calculatedProfitAmount = isProfit
        ? marginProfitValue
        : (amount * marginProfitValue) / 100;

      onChange(index, 'profitAmount', calculatedProfitAmount.toString());
    }
  };

  // 확정여부 체크박스 핸들러 추가
  const handleConfirmedChange = (index, checked) => {
    onChange(index, 'isConfirmed', checked);
    if (checked) {
      // 확정 시 매출확률 100으로 설정
      onChange(index, 'probability', '100');
    }
  };

  if (!payments?.length) return null;

  return (
    <div className="flex flex-col gap-6 px-5">
      {payments.map((payment, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md"
        >
          {/* 첫 번째 행 - 기본 정보 */}
          <div className="grid grid-cols-[1.5fr,0.8fr,1fr,1fr,auto,0.5fr,1fr] gap-3 items-center">
            {/* 결제구분 Select */}
            <Select
              value={payment.billingType}
              onChange={(e) => onChange(index, 'billingType', e.target.value)}
              disabled={isSubmitting || isPaymentDataLoading}
              required
            >
              <option value="">결제구분 선택</option>
              {paymentMethodData?.data?.map((method) => (
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

            {/* 매출확률 Select */}
            <Select
              value={payment.probability}
              onChange={(e) => onChange(index, 'probability', e.target.value)}
              disabled={
                isSubmitting || isPaymentDataLoading || payment.isConfirmed
              }
            >
              <option value="">매출확률 선택</option>
              {percentageData?.data?.map((percent) => (
                <option key={percent.id} value={percent.code}>
                  {percent.name}
                </option>
              ))}
            </Select>

            <Input
              type="text"
              value={
                tempInputs[index] || formatDisplayNumber(payment.amount) || ''
              }
              // value={payment.amount}
              onChange={(e) => handleAmountChange(index, e.target.value)}
              onBlur={() => handleAmountBlur(index)}
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
