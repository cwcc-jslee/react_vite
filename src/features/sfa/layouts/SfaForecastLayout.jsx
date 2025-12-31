// src/features/sfa/layouts/SfaForecastLayout.jsx
import React from 'react';
import QuickDateFilter from '../components/filters/QuickDateFilter';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaListTable from '../components/tables/SfaListTable';

/**
 * SFA 매출예측 페이지 레이아웃
 * 필터: QuickDateFilter + FilterStatusBanner
 * 상단: 연간 매출 예측 테이블 (12개월)
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaForecastLayout = () => {
  return (
    <div className="space-y-2">
      {/* 필터 영역: QuickDateFilter (1/3) + FilterStatusBanner (2/3) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/3">
          <QuickDateFilter showAnnualRange={true} />
        </div>
        <div className="w-2/3">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 연간 매출 예측 테이블 */}
      <SfaAnnualOverview />

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaForecastLayout;
