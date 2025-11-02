// src/features/sfa/components/charts/TopCustomersChart.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * 상위 N개 고객사별 매출액 차트
 * @param {Object} props
 * @param {Array} props.data - 고객사 데이터 배열
 * @param {string} props.fiscalYear - FY 연도
 * @param {Function} props.onTopNChange - Top N 변경 핸들러
 */
const TopCustomersChart = ({ data = [], fiscalYear, onTopNChange }) => {
  const [topN, setTopN] = useState(10);

  const handleTopNChange = (e) => {
    const value = parseInt(e.target.value);
    setTopN(value);
    if (onTopNChange) {
      onTopNChange(value);
    }
  };

  // 금액 포맷팅 (천원 단위)
  const formatAmount = (amount) => {
    return (amount / 1000).toLocaleString('ko-KR');
  };

  // 최대 금액 계산 (차트 너비 비율 계산용)
  const maxAmount =
    data.length > 0 ? Math.max(...data.map((d) => d.totalAmount)) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Top {topN} 고객사별 매출액 ({fiscalYear})
        </h3>
        <select
          value={topN}
          onChange={handleTopNChange}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
        </select>
      </div>

      {/* 차트 영역 */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            데이터가 없습니다.
          </div>
        ) : (
          data.map((customer, index) => (
            <div key={customer.customerId || index} className="space-y-1">
              {/* 고객명과 금액 */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {customer.customerName}
                </span>
                <span className="text-gray-900 font-semibold">
                  {formatAmount(customer.totalAmount)}천원
                </span>
              </div>

              {/* 프로그레스 바 */}
              <div className="relative w-full h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${(customer.totalAmount / maxAmount) * 100}%`,
                  }}
                />
                {/* 비율 표시 */}
                <div className="absolute inset-0 flex items-center justify-end px-2">
                  <span className="text-xs font-medium text-gray-700">
                    {customer.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 매출건수 */}
              <div className="text-xs text-gray-500 text-right">
                매출건수: {customer.sfaCount}건
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

TopCustomersChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.number,
      customerName: PropTypes.string.isRequired,
      totalAmount: PropTypes.number.isRequired,
      sfaCount: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
    }),
  ),
  fiscalYear: PropTypes.string.isRequired,
  onTopNChange: PropTypes.func,
};

export default TopCustomersChart;
