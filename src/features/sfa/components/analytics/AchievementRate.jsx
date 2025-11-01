// src/features/sfa/components/analytics/AchievementRate.jsx
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';

/**
 * 목표 대비 달성률 차트
 * - 월별 매출 추이와 목표 달성률
 * - 게이지 형태의 전체 달성률 + 라인 차트
 */
const AchievementRate = ({ selectedYear }) => {
  const [chartData, setChartData] = useState([]);
  const [overallRate, setOverallRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 임시 목표 매출 (실제로는 API나 설정에서 가져와야 함)
  const MONTHLY_TARGET = 140000000; // 1.4억원

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 신규 API 사용: 년간 데이터를 1회 호출로 조회
        const yearlyData = await sfaApi.getYearlyStats(selectedYear, {
          groupBy: 'probability',
          confirmStatus: 'probability100', // confirmed + 100%
          includeMonthly: true,
        });

        console.log('Yearly Data for Achievement:', yearlyData);

        // 월별 데이터 매핑
        const monthlyMap = {};
        yearlyData.monthlyData?.forEach((monthData) => {
          // probabilities 배열에서 confirmed와 100 찾기
          const confirmedItem = monthData.probabilities?.find(
            (p) => p.probabilityGroup === 'confirmed',
          );
          const prob100Item = monthData.probabilities?.find(
            (p) => p.probabilityGroup === '100',
          );

          const confirmed = confirmedItem?.sales?.amount || 0;
          const prob100 = prob100Item?.sales?.amount || 0;
          monthlyMap[monthData.month] = confirmed + prob100;
        });

        // 차트 데이터 구조화
        let totalRevenue = 0;
        let totalTarget = 0;

        const formattedData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const actualRevenue = monthlyMap[month] || 0;
          const achievementRate =
            MONTHLY_TARGET > 0
              ? Math.round((actualRevenue / MONTHLY_TARGET) * 100)
              : 0;

          totalRevenue += actualRevenue;
          totalTarget += MONTHLY_TARGET;

          return {
            month: `${month}월`,
            revenue: actualRevenue,
            target: MONTHLY_TARGET,
            achievementRate,
          };
        });

        setChartData(formattedData);

        // 전체 달성률 계산
        const rate =
          totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0;
        setOverallRate(rate);
      } catch (error) {
        console.error('Failed to fetch achievement data:', error);
        setError('달성률 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 달성률에 따른 색상
  const getAchievementColor = (rate) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (rate) => {
    if (rate >= 100) return 'bg-green-100';
    if (rate >= 80) return 'bg-blue-100';
    if (rate >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            실제: {payload[0]?.value?.toLocaleString()}원
          </p>
          <p className="text-sm text-gray-600">
            목표: {payload[1]?.value?.toLocaleString()}원
          </p>
          <p className="text-sm font-bold text-green-600">
            달성률: {payload[2]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          목표 달성률 ({selectedYear}년)
        </h2>

        {/* 전체 달성률 게이지 */}
        <div
          className={`flex flex-col items-center p-4 rounded-lg ${getBgColor(
            overallRate,
          )}`}
        >
          <div className="text-xs text-gray-600 mb-1">연간 달성률</div>
          <div
            className={`text-4xl font-bold ${getAchievementColor(overallRate)}`}
          >
            {overallRate}%
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            name="실제 매출"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="target"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="목표 매출"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="achievementRate"
            stroke="#10b981"
            strokeWidth={3}
            name="달성률(%)"
            dot={{ r: 5, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 mt-2">
        * 목표 매출: 월 {(MONTHLY_TARGET / 10000).toLocaleString()}만원 (설정
        가능)
      </div>
    </div>
  );
};

export default AchievementRate;
