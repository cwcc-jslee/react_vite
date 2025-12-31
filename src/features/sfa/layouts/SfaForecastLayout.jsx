// src/features/sfa/layouts/SfaForecastLayout.jsx
import React from 'react';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaListTable from '../components/tables/SfaListTable';

/**
 * SFA 매출예측 페이지 레이아웃
 * 상단: 연간 매출 예측 테이블 (12개월)
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaForecastLayout = () => {
  return (
    <div className="space-y-6">
      {/* 연간 매출 예측 테이블 */}
      <SfaAnnualOverview />

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaForecastLayout;
