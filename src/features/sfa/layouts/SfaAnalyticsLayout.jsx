// src/features/sfa/layouts/SfaAnalyticsLayout.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';
import AnalyticsYearFilter from '../components/analytics/AnalyticsYearFilter';
import TeamMonthlyRevenue from '../components/analytics/TeamMonthlyRevenue';
import RevenueByProbability from '../components/analytics/RevenueByProbability';
import AchievementRate from '../components/analytics/AchievementRate';
import RevenueComparison from '../components/analytics/RevenueComparison';
import RevenueTrend from '../components/analytics/RevenueTrend';

/**
 * SFA 매출 분석 레이아웃
 * - 년도별 팀 매출 분석
 * - 확정/예정 매출 구분
 * - 목표 달성률 등 분석 차트
 */
const SfaAnalyticsLayout = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">매출 분석</h1>
        <AnalyticsYearFilter
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* 팀별 월간 매출 현황 테이블 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <TeamMonthlyRevenue selectedYear={selectedYear} />
      </div>

      {/* 차트 그리드 레이아웃 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 1행: 매출 추이 */}
        <RevenueTrend selectedYear={selectedYear} />

        {/* 2행: 목표 달성률 */}
        <AchievementRate selectedYear={selectedYear} />

        {/* 3행: 2열 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 확정/예정 비교 */}
          <RevenueComparison selectedYear={selectedYear} />

          {/* 확률별 분포 */}
          <RevenueByProbability selectedYear={selectedYear} />
        </div>
      </div>
    </div>
  );
};

export default SfaAnalyticsLayout;
