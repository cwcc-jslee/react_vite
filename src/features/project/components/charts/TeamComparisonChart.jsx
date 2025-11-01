// src/features/project/components/charts/TeamComparisonChart.jsx

import React, { useState } from 'react';
import { Card } from '@shared/components/ui/card/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

/**
 * 주별 팀별 투입률 비교 차트
 */
const TeamComparisonChart = ({ weeklyData = [] }) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    weeklyData.length > 0 ? weeklyData.length - 1 : 0
  );

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          주별 팀 데이터가 없습니다.
        </div>
      </Card>
    );
  }

  const selectedWeek = weeklyData[selectedWeekIndex];

  // 차트 데이터 변환
  const chartData = selectedWeek.byTeam.map((team) => ({
    teamName: team.teamName,
    teamId: team.teamId,
    utilization: team.utilization,
    workHours: team.workHours,
    baseHours: team.baseHours,
    memberCount: team.memberCount,
  }));

  // 색상 결정 함수
  const getBarColor = (utilization) => {
    if (utilization >= 80) return '#10b981'; // green
    if (utilization >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{data.teamName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              <span className="font-medium">투입률:</span> {data.utilization.toFixed(1)}%
            </p>
            <p className="text-gray-600">
              <span className="font-medium">팀원 수:</span> {data.memberCount}명
            </p>
            <p className="text-gray-600">
              <span className="font-medium">실제 작업:</span> {data.workHours.toFixed(1)}h
            </p>
            <p className="text-gray-600">
              <span className="font-medium">기준 시간:</span> {data.baseHours.toFixed(1)}h
            </p>
            <p className={`${
              data.baseHours - data.workHours > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              <span className="font-medium">차이:</span>{' '}
              {data.baseHours - data.workHours > 0 ? '-' : '+'}
              {Math.abs(data.baseHours - data.workHours).toFixed(1)}h
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">팀별 투입률 비교</h3>

          {/* 주 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">조회 주:</label>
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...weeklyData].reverse().map((week, index) => {
                const originalIndex = weeklyData.length - 1 - index;
                return (
                  <option key={originalIndex} value={originalIndex}>
                    {week.label} - {week.summary.totalUtilization.toFixed(1)}%
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 전체 투입률 요약 */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">전체 투입률:</span>
            <span className={`ml-2 text-xl font-bold ${
              selectedWeek.summary.totalUtilization >= 80 ? 'text-green-600' :
              selectedWeek.summary.totalUtilization >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {selectedWeek.summary.totalUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span>근무일: {selectedWeek.workingDays}일</span>
            <span className="mx-2">|</span>
            <span>총 인원: {selectedWeek.summary.totalUsers}명</span>
            <span className="mx-2">|</span>
            <span>작업 시간: {selectedWeek.summary.totalWorkHours.toFixed(1)}h</span>
          </div>
        </div>

        {/* 차트 */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="teamName"
              angle={-20}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              label={{ value: '투입률 (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="rect"
            />

            {/* 목표 라인 (80%) */}
            <ReferenceLine
              y={80}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ value: '목표 80%', position: 'right', fill: '#10b981', fontSize: 11 }}
            />

            {/* 투입률 바 */}
            <Bar
              dataKey="utilization"
              name="투입률"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.utilization)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* 팀별 상세 정보 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {chartData.map((team) => (
            <div
              key={team.teamId}
              className={`border rounded-lg p-3 ${
                team.utilization >= 80
                  ? 'bg-green-50 border-green-200'
                  : team.utilization >= 60
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="text-xs font-medium text-gray-700 mb-1">{team.teamName}</div>
              <div className={`text-lg font-bold ${
                team.utilization >= 80
                  ? 'text-green-700'
                  : team.utilization >= 60
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {team.utilization.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">{team.memberCount}명</div>
            </div>
          ))}
        </div>

        {/* 경고 메시지 */}
        {chartData.some((team) => team.utilization < 60) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-red-800">
              <span className="font-medium">저투입 팀 발견:</span>{' '}
              {chartData
                .filter((team) => team.utilization < 60)
                .map((team) => `${team.teamName} (${team.utilization.toFixed(1)}%)`)
                .join(', ')}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamComparisonChart;
