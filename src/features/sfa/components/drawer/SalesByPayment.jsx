// src/features/sfa/components/drawer/SalesByPayment.jsx
import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Group,
  Select,
  Input,
  Checkbox,
  Switch,
} from '../../../../shared/components/ui';

const SalesByPayment = ({
  payments = [],
  onChange,
  onRemove,
  isSubmitting,
}) => {
  // 이익/마진 금액 자동 계산
  useEffect(() => {
    payments.forEach((entry, index) => {
      let calculatedMarginAmount = 0;

      if (entry.isProfit) {
        calculatedMarginAmount = Number(entry.margin || 0);
      } else {
        calculatedMarginAmount =
          (Number(entry.amount || 0) * Number(entry.margin || 0)) / 100;
      }

      if (calculatedMarginAmount !== Number(entry.marginAmount)) {
        onChange(index, 'marginAmount', calculatedMarginAmount.toString());
      }
    });
  }, [payments, onChange]);

  // 입력값 변경 시 이익/마진 금액 계산
  const handleEntryChange = (index, field, value) => {
    onChange(index, field, value);

    if (['amount', 'margin', 'isProfit'].includes(field)) {
      const payment = payments[index];
      const amount = field === 'amount' ? value : payment.amount;
      const margin = field === 'margin' ? value : payment.margin;
      const isProfit = field === 'isProfit' ? value : payment.isProfit;

      let calculatedMarginAmount = 0;
      if (isProfit) {
        calculatedMarginAmount = Number(margin || 0);
      } else {
        calculatedMarginAmount =
          (Number(amount || 0) * Number(margin || 0)) / 100;
      }

      onChange(index, 'marginAmount', calculatedMarginAmount.toString());
    }
  };

  if (!payments?.length) return null;

  return (
    <div className="flex flex-col gap-6 px-5">
      {payments.map((entry, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md"
        >
          {/* 첫 번째 행 - 기본 정보 */}
          <div className="grid grid-cols-[1.5fr,0.8fr,1fr,1fr,auto,0.5fr,1fr] gap-3 items-center">
            <Select
              value={entry.paymentType}
              onChange={(e) => onChange(index, 'paymentType', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">결제구분</option>
              <option value="CARD">카드</option>
              <option value="CASH">현금</option>
              <option value="TRANSFER">계좌이체</option>
            </Select>

            <label className="flex items-center gap-1">
              <Checkbox
                checked={entry.confirmed}
                onChange={(e) => onChange(index, 'confirmed', e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <span>확정여부</span>
            </label>

            <Select
              value={entry.probability}
              onChange={(e) => onChange(index, 'probability', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">매출확률</option>
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
            </Select>

            <Input
              type="number"
              value={entry.amount}
              onChange={(e) =>
                handleEntryChange(index, 'amount', e.target.value)
              }
              placeholder="매출액"
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-center">
              <Switch
                checked={entry.isProfit}
                onChange={() =>
                  handleEntryChange(index, 'isProfit', !entry.isProfit)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="text-center">
              {entry.isProfit ? '이익' : '마진'}
            </div>

            <Input
              type="number"
              value={entry.margin}
              onChange={(e) =>
                handleEntryChange(index, 'margin', e.target.value)
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
                value={entry.recognitionDate}
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
                value={entry.paymentDate}
                onChange={(e) => onChange(index, 'paymentDate', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">메모</span>
              <Input
                type="text"
                value={entry.memo}
                onChange={(e) => onChange(index, 'memo', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">매출이익</span>
                <Input
                  type="number"
                  value={entry.marginAmount}
                  readOnly
                  disabled={true}
                  className="bg-gray-100"
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
