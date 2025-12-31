// src/features/customer/sections/CustomerListSection.jsx
import React from 'react';
import CustomerTable from '../components/tables/CustomerTable';

/**
 * 고객 목록 섹션
 * - 고객 목록 테이블
 * - 페이지네이션
 *
 * @component
 */
const CustomerListSection = () => {
  return (
    <div>
      <CustomerTable />
    </div>
  );
};

export default CustomerListSection;
