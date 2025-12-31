// src/features/customer/sections/CustomerStatisticsSection.jsx
import React from 'react';
import { customerService } from '../services/customerService';
import CustomerStatisticsTable from '../components/tables/CustomerStatisticsTable';

/**
 * 고객 통계 섹션
 * - 기업분류, 신규고객, 기업규모, 지원사업 통계 표시
 *
 * @component
 */
const CustomerStatisticsSection = () => {
  return (
    <div className="mb-4">
      <CustomerStatisticsTable api={customerService} />
    </div>
  );
};

export default CustomerStatisticsSection;
