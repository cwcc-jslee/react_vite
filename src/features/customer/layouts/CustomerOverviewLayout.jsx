// src/features/customer/layouts/CustomerOverviewLayout.jsx
import React, { useState } from 'react';
import CustomerStatisticsSection from '../sections/CustomerStatisticsSection';
import CustomerListSection from '../sections/CustomerListSection';
import ViewModeToggle from '../components/filters/ViewModeToggle';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import AdvancedSearchForm from '../components/filters/AdvancedSearchForm';

/**
 * Customer 현황 페이지 레이아웃
 * - 뷰 모드 전환 (현황/상세검색)
 * - 필터 상태 배너
 * - 현황 모드: 고객 통계 테이블
 * - 상세검색 모드: 상세 검색 폼
 * - 고객 목록 테이블
 *
 * @component
 */
const CustomerOverviewLayout = () => {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'search'

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
  };

  return (
    <div className="space-y-2">
      {/* 필터 영역: ViewModeToggle (1/3) + FilterStatusBanner (2/3) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/3">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
        <div className="w-2/3">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 현황 모드: 고객 통계 */}
      {viewMode === 'overview' && <CustomerStatisticsSection />}

      {/* 상세검색 모드: 상세 검색 폼 */}
      {viewMode === 'search' && <AdvancedSearchForm />}

      {/* 고객 목록 */}
      <CustomerListSection />
    </div>
  );
};

export default CustomerOverviewLayout;
