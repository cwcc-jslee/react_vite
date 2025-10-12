// src/features/sfa/components/analytics/AnalyticsYearFilter.jsx
import React from 'react';
import dayjs from 'dayjs';

/**
 * 매출 분석 년도 필터
 * @param {number} selectedYear - 선택된 년도
 * @param {Function} onYearChange - 년도 변경 핸들러
 */
const AnalyticsYearFilter = ({ selectedYear, onYearChange }) => {
  // 최근 5년 + 향후 2년 생성 (예: 2022~2027)
  const currentYear = dayjs().year();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 4 + i);

  return (
    <div className="flex items-center space-x-3">
      <label
        htmlFor="year-select"
        className="text-sm font-medium text-gray-700"
      >
        년도 선택
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="
          block
          w-32
          px-3
          py-2
          border
          border-gray-300
          rounded-md
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          text-sm
        "
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </select>
    </div>
  );
};

export default AnalyticsYearFilter;
