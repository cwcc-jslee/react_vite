// src/features/sfa/layouts/SfaForecastLayout.jsx
import React, { useState } from 'react';
import QuickDateFilter from '../components/filters/QuickDateFilter';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaListTable from '../components/tables/SfaListTable';
import dayjs from 'dayjs';

/**
 * SFA 매출예측 페이지 레이아웃
 * 필터: QuickDateFilter + FilterStatusBanner
 * 상단: 연간 매출 예측 테이블 (12개월)
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaForecastLayout = () => {
  // 연간 테이블 기준월 (로컬 상태로 관리)
  const [annualBaseDate, setAnnualBaseDate] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );

  // QuickDateFilter의 월 변경 핸들러
  const handleDateChange = (startDate, endDate) => {
    setAnnualBaseDate(startDate);
  };

  return (
    <div className="space-y-2">
      {/* 필터 영역: QuickDateFilter (1/3) + FilterStatusBanner (2/3) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/3">
          <QuickDateFilter
            showAnnualRange={true}
            annualBaseDate={annualBaseDate}
            onAnnualDateChange={handleDateChange}
          />
        </div>
        <div className="w-2/3">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 연간 매출 예측 테이블 */}
      <SfaAnnualOverview baseDate={annualBaseDate} />

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaForecastLayout;
