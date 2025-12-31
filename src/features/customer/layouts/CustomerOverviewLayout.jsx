// src/features/customer/layouts/CustomerOverviewLayout.jsx
import React from 'react';
import CustomerStatisticsSection from '../sections/CustomerStatisticsSection';
import CustomerListSection from '../sections/CustomerListSection';

/**
 * Customer 현황 페이지 레이아웃
 * - 고객 통계 섹션
 * - 고객 목록 섹션
 *
 * @component
 */
const CustomerOverviewLayout = () => {
  return (
    <div className="space-y-4">
      {/* 통계 섹션 */}
      <CustomerStatisticsSection />

      {/* 고객 목록 섹션 */}
      <CustomerListSection />
    </div>
  );
};

export default CustomerOverviewLayout;
