// src/features/project/sections/UtilizationDashboardSection.jsx

import React, { useState } from 'react';
import { Card } from '@shared/components/ui/card/Card';
import UtilizationSummaryChart from '../components/charts/UtilizationSummaryChart';
import TeamUtilizationChart from '../components/charts/TeamUtilizationChart';
import UserUtilizationChart from '../components/charts/UserUtilizationChart';
import UtilizationFilters from '../components/filters/UtilizationFilters';
import { useUtilizationWithTeams } from '../hooks/useUtilization';

/**
 * 투입률 대시보드 섹션
 * 필터, 요약, 팀별, 개인별 차트를 포함
 */
const UtilizationDashboardSection = () => {
  const [filters, setFilters] = useState({
    period: 'weekly', // daily, weekly, monthly
    startDate: null,
    endDate: null,
    teamId: null,
  });

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // API 데이터 조회
  const { utilization, teams, isLoading, isError, error } = useUtilizationWithTeams(filters);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">투입률 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">데이터 로드 실패</div>
          <div className="text-gray-600 text-sm">{error?.message || '오류가 발생했습니다.'}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!utilization.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">투입률 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 영역 */}
      <Card>
        <div className="p-4">
          <UtilizationFilters
            filters={filters}
            teams={teams}
            dateRange={utilization.dateRange}
            onChange={handleFilterChange}
            onRefresh={utilization.refetch}
          />
        </div>
      </Card>

      {/* 전체 투입률 요약 */}
      <UtilizationSummaryChart data={utilization.data} />

      {/* 팀별 투입률 */}
      <TeamUtilizationChart data={utilization.data} />

      {/* 개인별 투입률 */}
      <UserUtilizationChart data={utilization.data} />
    </div>
  );
};

export default UtilizationDashboardSection;
