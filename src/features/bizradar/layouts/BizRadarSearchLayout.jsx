/**
 * BizRadar 검색 레이아웃
 * 고급 검색 폼 + 테이블 구성
 */
import React from 'react';
import BizRadarSearchForm from '../components/forms/BizRadarSearchForm';
import BizRadarListTable from '../components/tables/BizRadarListTable';

const BizRadarSearchLayout = () => {
  return (
    <div className="space-y-4">
      <BizRadarSearchForm />
      <BizRadarListTable />
    </div>
  );
};

export default BizRadarSearchLayout;
