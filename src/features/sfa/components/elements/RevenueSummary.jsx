/**
 * 매출/이익 요약 표시 컴포넌트
 * - 결제 매출/이익을 시각적으로 강조
 * - 금액에 따라 색상 변경
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, CircleDollarSign } from 'lucide-react';

const RevenueSummary = ({ totalAmount, totalProfit, variant = 'default' }) => {
  // 금액이 0이면 기본 표시
  if (totalAmount === 0 && totalProfit === 0) {
    return <span className="text-gray-500">-</span>;
  }

  // 이익률 계산
  const profitRate = totalAmount > 0 ? ((totalProfit / totalAmount) * 100).toFixed(1) : 0;

  // 이익률에 따른 색상
  const getProfitColor = (rate) => {
    if (rate >= 30) return 'text-green-700 bg-green-50 border-green-200';
    if (rate >= 20) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (rate >= 10) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  if (variant === 'compact') {
    // 간결한 표시 (기본정보 테이블용)
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">매출</span>
            <span className="text-sm font-semibold text-gray-900">
              ₩{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">이익</span>
            <span className="text-sm font-semibold text-gray-900">
              ₩{totalProfit.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">이익률</span>
          <span
            className={`
              inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
              ${getProfitColor(profitRate)}
            `}
          >
            {profitRate}%
          </span>
        </div>
      </div>
    );
  }

  // 기본 표시
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900">
        ₩{totalAmount.toLocaleString()}
      </span>
      <span className="text-xs text-gray-400">/</span>
      <span className="text-sm font-medium text-green-700">
        ₩{totalProfit.toLocaleString()}
      </span>
      <span
        className={`
          ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
          ${getProfitColor(profitRate)}
        `}
      >
        {profitRate}%
      </span>
    </div>
  );
};

RevenueSummary.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  totalProfit: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
};

export default RevenueSummary;
