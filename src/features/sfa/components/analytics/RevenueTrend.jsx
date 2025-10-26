// src/features/sfa/components/analytics/RevenueTrend.jsx
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';

/**
 * 월별 매출 추이 라인 차트
 * - 전년도 대비 비교
 * - 누적 매출 추이
 */
const RevenueTrend = ({ selectedYear }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 현재 년월 정보
        const today = dayjs();
        const currentYear = today.year();
        const currentMonth = today.month() + 1; // dayjs month는 0-based

        // 신규 API 사용
        // 1. 전년도: 확정 매출만
        // 2. 당해: probability100 (confirmed + 100%)
        const [currentYearData, prevYearData] = await Promise.all([
          sfaApi.getYearlyStats(selectedYear, {
            groupBy: 'probability',
            confirmStatus: 'probability100', // confirmed + 100%
            includeMonthly: true,
          }),
          sfaApi.getYearlyStats(selectedYear - 1, {
            groupBy: 'probability',
            confirmStatus: 'confirmed', // 전년도는 확정만
            includeMonthly: true,
          }),
        ]);

        console.log('Current Year Data:', currentYearData);
        console.log('Previous Year Data:', prevYearData);

        // 월별 데이터 매핑
        const currentMonthlyMap = {};
        const prevMonthlyMap = {};

        // 당해 년도 데이터 처리
        currentYearData.monthlyData?.forEach((monthData) => {
          const month = monthData.month;

          // probabilities 배열에서 confirmed와 100 찾기
          const confirmedItem = monthData.probabilities?.find(
            (p) => p.probabilityGroup === 'confirmed'
          );
          const prob100Item = monthData.probabilities?.find(
            (p) => p.probabilityGroup === '100'
          );

          const confirmed = confirmedItem?.sales?.amount || 0;
          const prob100 = prob100Item?.sales?.amount || 0;

          // 현재 년도인 경우에만 월 기준 분기 처리
          if (selectedYear === currentYear) {
            if (month < currentMonth) {
              // 전월까지: 확정만
              currentMonthlyMap[month] = confirmed;
            } else {
              // 현재월 포함 이후: 확정 + 예정(100%)
              currentMonthlyMap[month] = confirmed + prob100;
            }
          } else {
            // 과거 년도 또는 미래 년도: 전체 데이터 사용
            currentMonthlyMap[month] = confirmed + prob100;
          }
        });

        // 전년도 데이터 처리: 확정만 (API에서 이미 confirmed만 조회)
        prevYearData.monthlyData?.forEach((monthData) => {
          const confirmedItem = monthData.probabilities?.find(
            (p) => p.probabilityGroup === 'confirmed'
          );
          prevMonthlyMap[monthData.month] = confirmedItem?.sales?.amount || 0;
        });

        // 차트 데이터 구조화
        let currentCumulative = 0;
        let prevCumulative = 0;

        const formattedData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const currentRevenue = currentMonthlyMap[month] || 0;
          const prevRevenue = prevMonthlyMap[month] || 0;

          currentCumulative += currentRevenue;
          prevCumulative += prevRevenue;

          const growthRate = prevRevenue > 0
            ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
            : 0;

          return {
            month: `${month}월`,
            currentYear: currentRevenue,
            prevYear: prevRevenue,
            currentCumulative,
            prevCumulative,
            growthRate,
          };
        });

        setChartData(formattedData);
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
        setError('추이 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 통계 계산
  const currentYearTotal = chartData.reduce((sum, item) => sum + item.currentYear, 0);
  const prevYearTotal = chartData.reduce((sum, item) => sum + item.prevYear, 0);
  const totalGrowthRate = prevYearTotal > 0
    ? Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100)
    : 0;
  const averageMonthly = currentYearTotal / 12;

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900">
        월별 매출 추이 ({selectedYear}년 vs {selectedYear - 1}년)
      </h2>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">{selectedYear}년 총매출</div>
          <div className="text-xl font-bold text-blue-600">
            {(currentYearTotal / 100000000).toFixed(1)}억
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">{selectedYear - 1}년 총매출</div>
          <div className="text-xl font-bold text-gray-600">
            {(prevYearTotal / 100000000).toFixed(1)}억
          </div>
        </div>
        <div className={`p-4 rounded-lg ${totalGrowthRate >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xs text-gray-600 mb-1">전년 대비 증감</div>
          <div className={`text-xl font-bold ${totalGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGrowthRate >= 0 ? '+' : ''}{totalGrowthRate}%
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">월평균 매출</div>
          <div className="text-xl font-bold text-purple-600">
            {(averageMonthly / 10000000).toFixed(0)}백만
          </div>
        </div>
      </div>

      {/* 월별 추이 차트 */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Line
            type="monotone"
            dataKey="currentYear"
            stroke="#3b82f6"
            strokeWidth={3}
            name={`${selectedYear}년`}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="prevYear"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            name={`${selectedYear - 1}년`}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="currentCumulative"
            stroke="#10b981"
            strokeWidth={2}
            name={`${selectedYear}년 누적`}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="prevCumulative"
            stroke="#d97706"
            strokeWidth={2}
            strokeDasharray="5 5"
            name={`${selectedYear - 1}년 누적`}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 mt-2">
        * 전년도 대비 매출 추이 및 누적 매출 비교 (실선: 당해, 점선: 전년)
      </div>
    </div>
  );
};

export default RevenueTrend;
