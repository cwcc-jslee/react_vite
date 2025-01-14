// src/features/sfa/components/drawer/SalesPayments.jsx
// 매출항목 등록 폼폼
import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Select,
  Input,
} from '../../../../shared/components/drawer/styles/formStyles';

const SalesPayments = ({
  entries,
  onChange,
  onAdd,
  onRemove,
  isSubmitting,
}) => {
  // 매출이익 자동 계산을 위한 useEffect
  useEffect(() => {
    entries.forEach((entry, index) => {
      let calculatedMarginAmount = 0;

      // 이익/마진 계산 로직
      if (entry.isProfit) {
        // 이익으로 선택된 경우: margin 값을 그대로 매출이익으로 설정
        calculatedMarginAmount = Number(entry.margin || 0);
      } else {
        // 마진으로 선택된 경우: (매출액 * 마진%) / 100 계산
        calculatedMarginAmount =
          (Number(entry.amount || 0) * Number(entry.margin || 0)) / 100;
      }

      // 계산된 값이 현재 값과 다른 경우에만 업데이트
      if (calculatedMarginAmount !== Number(entry.marginAmount)) {
        onChange(index, 'marginAmount', calculatedMarginAmount.toString());
      }
    });
  }, [entries, onChange]); // entries나 onChange가 변경될 때마다 실행

  // 입력값 변경 시 즉시 계산을 위한 핸들러
  const handleEntryChange = (index, field, value) => {
    onChange(index, field, value);

    // amount, margin, isProfit 필드가 변경될 때만 즉시 계산
    if (['amount', 'margin', 'isProfit'].includes(field)) {
      const entry = entries[index];
      const amount = field === 'amount' ? value : entry.amount;
      const margin = field === 'margin' ? value : entry.margin;
      const isProfit = field === 'isProfit' ? value : entry.isProfit;

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

  const labelStyle = {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '4px',
  };

  if (!entries?.length && !isSubmitting) return null;

  return (
    <>
      {entries.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '0 20px',
          }}
        >
          {entries.map((entry, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
              }}
            >
              {/* 첫 번째 줄 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr auto 0.5fr 1fr',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <Select
                  value={entry.paymentType}
                  onChange={(e) =>
                    onChange(index, 'paymentType', e.target.value)
                  }
                  disabled={isSubmitting}
                >
                  <option value="">결제구분</option>
                  <option value="CARD">카드</option>
                  <option value="CASH">현금</option>
                  <option value="TRANSFER">계좌이체</option>
                </Select>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={entry.confirmed}
                    onChange={(e) =>
                      onChange(index, 'confirmed', e.target.checked)
                    }
                    disabled={isSubmitting}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>확정여부</span>
                </label>

                <Select
                  value={entry.probability}
                  onChange={(e) =>
                    onChange(index, 'probability', e.target.value)
                  }
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

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={entry.isProfit}
                    onChange={(e) =>
                      handleEntryChange(index, 'isProfit', e.target.checked)
                    }
                    disabled={isSubmitting}
                    style={{ display: 'none' }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      width: '36px',
                      height: '20px',
                      backgroundColor: entry.isProfit ? '#2563eb' : '#9CA3AF',
                      borderRadius: '10px',
                      transition: 'background-color 0.2s',
                      display: 'inline-block',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        top: '2px',
                        left: entry.isProfit ? '18px' : '2px',
                        transition: 'left 0.2s',
                      }}
                    />
                  </span>
                </label>

                <div style={{ textAlign: 'center' }}>
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

              {/* 두 번째 줄 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={labelStyle}>매출인식일자</div>
                  <Input
                    type="date"
                    value={entry.recognitionDate}
                    onChange={(e) =>
                      onChange(index, 'recognitionDate', e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <div style={labelStyle}>결제일자</div>
                  <Input
                    type="date"
                    value={entry.paymentDate}
                    onChange={(e) =>
                      onChange(index, 'paymentDate', e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <div style={labelStyle}>메모</div>
                  <Input
                    type="text"
                    value={entry.memo}
                    onChange={(e) => onChange(index, 'memo', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '8px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <div style={labelStyle}>매출이익</div>
                    <Input
                      type="number"
                      value={entry.marginAmount}
                      readOnly
                      disabled={true}
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      paddingBottom: '1px',
                    }}
                  >
                    <Trash2
                      onClick={() => onRemove(index)}
                      size={20}
                      color="#6B7280"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SalesPayments;
