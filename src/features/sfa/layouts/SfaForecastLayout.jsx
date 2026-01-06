// src/features/sfa/layouts/SfaForecastLayout.jsx
import React, { useState } from 'react';
import QuickDateFilter from '../components/filters/QuickDateFilter';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaListTable from '../components/tables/SfaListTable';
import AdvancedSearchForm from '../components/filters/AdvancedSearchForm';
import { useSfaStore } from '../hooks/useSfaStore';
import dayjs from 'dayjs';

/**
 * SFA 매출예측 페이지 레이아웃
 * 필터: QuickDateFilter + FilterStatusBanner
 * 상단: 연간 매출 예측 테이블 (12개월) 또는 상세 검색 폼
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaForecastLayout = () => {
  const { actions } = useSfaStore();
  
  // 뷰 모드 ('overview' | 'search')
  const [viewMode, setViewMode] = useState('overview');

  // 연간 테이블 기준월 (로컬 상태로 관리)
  const [annualBaseDate, setAnnualBaseDate] = useState(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );

  // 조회 기간 설정 (기본값 4개월)
  const [duration, setDuration] = useState(4);

  // QuickDateFilter의 월 변경 핸들러
  const handleDateChange = (startDate, endDate) => {
    setAnnualBaseDate(startDate);
  };

  // 조회 기간 변경 핸들러
  const handleDurationChange = (e) => {
    setDuration(Number(e.target.value));
  };

  // 뷰 모드 변경 시 필터 초기화
  const handleViewModeChange = (newMode) => {
    if (newMode !== viewMode) {
      actions.filter.resetFilters();
      setViewMode(newMode);
    }
  };

  return (
    <div className="space-y-2">
      {/* 필터 영역: QuickDateFilter (1/2) + FilterStatusBanner (1/2) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/2">
          <QuickDateFilter
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            showAnnualRange={true}
            annualBaseDate={annualBaseDate}
            onAnnualDateChange={handleDateChange}
            duration={duration}
            onDurationChange={handleDurationChange}
          />
        </div>
        <div className="w-1/2">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 현황 모드: 연간 매출 예측 테이블 */}
      {viewMode === 'overview' && (
        <SfaAnnualOverview baseDate={annualBaseDate} duration={duration} />
      )}

      {/* 상세검색 모드: 상세 검색 폼 */}
      {viewMode === 'search' && <AdvancedSearchForm />}

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaForecastLayout;