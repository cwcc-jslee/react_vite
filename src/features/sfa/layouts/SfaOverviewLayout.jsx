// src/features/sfa/layouts/SfaOverviewLayout.jsx
import React, { useState } from 'react';
import { useSfaStore } from '../hooks/useSfaStore';
import QuickDateFilter from '../components/filters/QuickDateFilter';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import AdvancedSearchForm from '../components/filters/AdvancedSearchForm';
import SfaMonthlyStatsTable from '../components/tables/SfaMonthlyStatsTable';
import SfaListTable from '../components/tables/SfaListTable';

/**
 * SFA 현황 페이지 레이아웃
 * - 빠른 날짜 필터 (뷰 모드 전환 버튼 포함)
 * - 필터 상태 배너
 * - 현황 모드: 월별 통계 테이블
 * - 상세검색 모드: 상세 검색 폼
 * - 매출 리스트 테이블
 *
 * @component
 */
const SfaOverviewLayout = () => {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'search'
  const { actions } = useSfaStore();

  // 뷰 모드 변경 시 필터 초기화
  const handleViewModeChange = (newMode) => {
    if (newMode !== viewMode) {
      actions.filter.resetFilters();
      setViewMode(newMode);
    }
  };

  return (
    <div className="space-y-2">
      {/* 필터 영역: QuickDateFilter (1/3) + FilterStatusBanner (2/3) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/3">
          <QuickDateFilter viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </div>
        <div className="w-2/3">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 현황 모드: 월별 매출 통계 */}
      {viewMode === 'overview' && <SfaMonthlyStatsTable />}

      {/* 상세검색 모드: 상세 검색 폼 */}
      {viewMode === 'search' && <AdvancedSearchForm />}

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaOverviewLayout;
