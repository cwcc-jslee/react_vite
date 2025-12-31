// src/features/sfa/layouts/SfaOverviewLayout.jsx
import React from 'react';
import SfaMonthlyStatsTable from '../components/tables/SfaMonthlyStatsTable';
import SfaListTable from '../components/tables/SfaListTable';

/**
 * SFA 현황 페이지 레이아웃
 * 상단: 월별 통계 테이블 (5개월)
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaOverviewLayout = () => {
  return (
    <div className="space-y-6">
      {/* 월별 매출 통계 (전전월 ~ 익익월) */}
      <SfaMonthlyStatsTable />

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaOverviewLayout;
