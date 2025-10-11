// src/features/project/components/charts/UtilizationTrendChart.jsx

import React from 'react';
import { Card } from '@shared/components/ui/card/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/**
 * 주별 투입률 추이 차트
 */
const UtilizationTrendChart = ({ weeklyData = [] }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          주별 투입률 데이터가 없습니다.
        </div>
      </Card>
    );
  }

  // 차트 데이터 변환
  const chartData = weeklyData.map((week) => ({
    label: week.label,
    weekNumber: week.weekNumber,
    utilization: week.summary.totalUtilization,
    workHours: week.summary.totalWorkHours,
    baseHours: week.summary.totalBaseHours,
  }));

  // 평균 투입률 계산
  const averageUtilization =
    chartData.reduce((sum, item) => sum + item.utilization, 0) / chartData.length;

  // 최고/최저 주 찾기
  const sortedByUtilization = [...chartData].sort((a, b) => b.utilization - a.utilization);
  const highestWeek = sortedByUtilization[0];
  const lowestWeek = sortedByUtilization[sortedByUtilization.length - 1];

  // 추세 판단
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.utilization, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.utilization, 0) / secondHalf.length;
  const trend = secondHalfAvg > firstHalfAvg ? 'improving' : secondHalfAvg < firstHalfAvg ? 'declining' : 'stable';

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{data.label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              <span className="font-medium">투입률:</span> {data.utilization.toFixed(1)}%
            </p>
            <p className="text-gray-600">
              <span className="font-medium">실제 작업:</span> {data.workHours.toFixed(1)}h
            </p>
            <p className="text-gray-600">
              <span className="font-medium">기준 시간:</span> {data.baseHours.toFixed(1)}h
            </p>
            <p className="text-gray-600">
              <span className="font-medium">부족:</span> {(data.baseHours - data.workHours).toFixed(1)}h
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
          <h3 className="text-lg font-semibold text-gray-800">주별 투입률 추이</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">평균:</span>
              <span className={`font-semibold ${
                averageUtilization >= 80 ? 'text-green-600' :
                averageUtilization >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {averageUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">추세:</span>
              <span className={`font-semibold ${
                trend === 'improving' ? 'text-green-600' :
                trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'improving' ? '↑ 상승' : trend === 'declining' ? '↓ 하락' : '→ 안정'}
              </span>
            </div>
          </div>
        </div>

        {/* 차트 */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="label"
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
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              iconType="line"
            />

            {/* 목표 라인 (80%) */}
            <ReferenceLine
              y={80}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ value: '목표 80%', position: 'right', fill: '#10b981', fontSize: 11 }}
            />

            {/* 실제 투입률 라인 */}
            <Line
              type="monotone"
              dataKey="utilization"
              name="투입률"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* 인사이트 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {/* 최고 투입률 주 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium mb-1">최고 투입률</div>
            <div className="text-lg font-bold text-green-700">{highestWeek.utilization.toFixed(1)}%</div>
            <div className="text-xs text-gray-600 mt-1">{highestWeek.label}</div>
          </div>

          {/* 최저 투입률 주 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs text-red-600 font-medium mb-1">최저 투입률</div>
            <div className="text-lg font-bold text-red-700">{lowestWeek.utilization.toFixed(1)}%</div>
            <div className="text-xs text-gray-600 mt-1">{lowestWeek.label}</div>
          </div>

          {/* 투입률 변동폭 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium mb-1">변동폭</div>
            <div className="text-lg font-bold text-blue-700">
              {(highestWeek.utilization - lowestWeek.utilization).toFixed(1)}%p
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {highestWeek.utilization - lowestWeek.utilization > 20 ? '변동 큼' : '안정적'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UtilizationTrendChart;
