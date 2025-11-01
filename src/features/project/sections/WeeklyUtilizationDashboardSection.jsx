// src/features/project/sections/WeeklyUtilizationDashboardSection.jsx

import React, { useState, useEffect } from 'react';
import { Card } from '@shared/components/ui/card/Card';
import UtilizationTrendChart from '../components/charts/UtilizationTrendChart';
import TeamComparisonChart from '../components/charts/TeamComparisonChart';
import WeeklyUtilizationTable from '../components/tables/WeeklyUtilizationTable';
import WorkDetailTable from '../components/tables/WorkDetailTable';
import UtilizationPeriodFilter from '../components/filters/UtilizationPeriodFilter';
import { useWeeklyUtilizationWithTeams } from '../hooks/useUtilization';
import dayjs from 'dayjs';

/**
 * 주별 투입률 대시보드 섹션
 * 필터, 추이 차트, 팀별 비교, 주별 데이터 테이블 포함
 */
const WeeklyUtilizationDashboardSection = () => {
  const [filters, setFilters] = useState({
    periodPreset: '1month', // 기본값: 최근 1개월
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    teamId: null,
    userId: null,
    includeNonTrackedTeams: false, // 기본값: work 추적 팀만 조회
  });

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // API 데이터 조회
  const { weeklyUtilization, teams, users, isLoading, isError, error } = useWeeklyUtilizationWithTeams(filters);

  // 데이터 추출
  const weeklyData = weeklyUtilization?.data?.weeks || [];
  const statistics = weeklyUtilization?.data?.statistics || null;
  const workData = weeklyUtilization?.data?.rawWorks || [];

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">주별 투입률 데이터를 불러오는 중...</span>
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
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="space-y-4">
        {/* 필터 영역 */}
        <Card>
          <div className="p-4">
            <UtilizationPeriodFilter
              filters={filters}
              teams={teams}
              users={users}
              onChange={handleFilterChange}
              onRefresh={weeklyUtilization.refetch}
            />
          </div>
        </Card>

        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">선택한 기간에 투입률 데이터가 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 영역 */}
      <Card>
        <div className="p-4">
          <UtilizationPeriodFilter
            filters={filters}
            teams={teams}
            users={users}
            onChange={handleFilterChange}
            onRefresh={weeklyUtilization.refetch}
          />
        </div>
      </Card>

      {/* 통계 요약 */}
      {statistics && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">기간 통계 요약</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* 평균 투입률 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">평균 투입률</div>
                <div className={`text-2xl font-bold ${
                  statistics.averageUtilization >= 80 ? 'text-green-600' :
                  statistics.averageUtilization >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {statistics.averageUtilization.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">{weeklyData.length}주 평균</div>
              </div>

              {/* 최고 투입률 주 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">최고 투입률</div>
                <div className="text-2xl font-bold text-green-700">
                  {statistics.highestWeek.utilization.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">{statistics.highestWeek.label}</div>
              </div>

              {/* 최저 투입률 주 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium mb-1">최저 투입률</div>
                <div className="text-2xl font-bold text-red-700">
                  {statistics.lowestWeek.utilization.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">{statistics.lowestWeek.label}</div>
              </div>

              {/* 전체 추세 */}
              <div className={`border rounded-lg p-4 ${
                statistics.trend === 'improving' ? 'bg-green-50 border-green-200' :
                statistics.trend === 'declining' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  statistics.trend === 'improving' ? 'text-green-600' :
                  statistics.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  전체 추세
                </div>
                <div className={`text-2xl font-bold ${
                  statistics.trend === 'improving' ? 'text-green-700' :
                  statistics.trend === 'declining' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {statistics.trend === 'improving' ? '↑ 상승' :
                   statistics.trend === 'declining' ? '↓ 하락' : '→ 안정'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {statistics.trend === 'improving' ? '투입률 증가 추세' :
                   statistics.trend === 'declining' ? '투입률 감소 추세' : '안정적 유지'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 투입률 추이 차트 */}
      <UtilizationTrendChart weeklyData={weeklyData} />

      {/* 팀별 비교 차트 */}
      <TeamComparisonChart weeklyData={weeklyData} />

      {/* 주별 데이터 테이블 */}
      <WeeklyUtilizationTable weeklyData={weeklyData} />

      {/* 작업 상세 데이터 테이블 */}
      <WorkDetailTable workData={workData} filters={filters} />
    </div>
  );
};

export default WeeklyUtilizationDashboardSection;
