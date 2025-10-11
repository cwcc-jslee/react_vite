// src/features/project/components/charts/UtilizationSummaryChart.jsx

import React from 'react';
import { Card } from '@shared/components/ui/card/Card';

/**
 * 전체 투입률 요약 차트
 */
const UtilizationSummaryChart = ({ data }) => {
  const { summary, period } = data;

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationBgColor = (rate) => {
    if (rate >= 80) return 'bg-green-100';
    if (rate >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">전체 투입률 요약</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 전체 투입률 */}
          <div className={`p-4 rounded-lg ${getUtilizationBgColor(summary.totalUtilization)}`}>
            <div className="text-sm text-gray-600 mb-1">전체 투입률</div>
            <div className={`text-3xl font-bold ${getUtilizationColor(summary.totalUtilization)}`}>
              {summary.totalUtilization}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {period.start} ~ {period.end}
            </div>
          </div>

          {/* 총 인원 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">총 인원</div>
            <div className="text-3xl font-bold text-blue-600">
              {summary.totalUsers}명
            </div>
            <div className="text-xs text-gray-500 mt-1">
              근무일수: {period.workingDays}일
            </div>
          </div>

          {/* 가용 시간 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">가용 시간</div>
            <div className="text-3xl font-bold text-gray-700">
              {summary.totalBaseHours}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.totalUsers}명 × {period.workingDays}일 × 8h
            </div>
          </div>

          {/* 실제 작업 시간 */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">실제 작업 시간</div>
            <div className="text-3xl font-bold text-purple-600">
              {summary.totalWorkHours}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              미작업: {summary.totalBaseHours - summary.totalWorkHours}h
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>투입률 진행 상황</span>
            <span>{summary.totalWorkHours}h / {summary.totalBaseHours}h</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                summary.totalUtilization >= 80 ? 'bg-green-500' :
                summary.totalUtilization >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${summary.totalUtilization}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UtilizationSummaryChart;
