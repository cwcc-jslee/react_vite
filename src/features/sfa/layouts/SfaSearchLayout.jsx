// src/features/sfa/layouts/SfaSearchLayout.jsx
import React from 'react';
import SfaSearchForm from '../components/forms/SfaSearchForm';
import SfaListTable from '../components/tables/SfaListTable';

/**
 * SFA 상세조회 페이지 레이아웃
 * 상단: 검색 폼
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaSearchLayout = () => {
  return (
    <div className="space-y-6">
      {/* 상세 검색 폼 */}
      <SfaSearchForm />

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaSearchLayout;
