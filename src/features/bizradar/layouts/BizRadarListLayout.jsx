/**
 * BizRadar 목록 레이아웃
 * 필터바 + 테이블 구성
 */
import React from 'react';
import BizRadarFilterBar from '../components/filters/BizRadarFilterBar';
import BizRadarListTable from '../components/tables/BizRadarListTable';

const BizRadarListLayout = () => {
  return (
    <div className="space-y-4">
      <BizRadarFilterBar />
      <BizRadarListTable />
    </div>
  );
};

export default BizRadarListLayout;
