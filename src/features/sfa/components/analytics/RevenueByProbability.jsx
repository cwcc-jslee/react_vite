// src/features/sfa/components/analytics/RevenueByProbability.jsx
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';

/**
 * 월별 확률 분포 누적 영역 차트
 * - confirmed, 100, 90, 70, 50 확률별 매출 분포
 */
const RevenueByProbability = ({ selectedYear }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 신규 API 사용: 확률별 그룹핑으로 모든 매출 조회
        const yearlyData = await sfaApi.getYearlyStats(selectedYear, {
          groupBy: 'probability',
          confirmStatus: 'all', // 모든 확률 포함
          includeMonthly: true,
        });

        console.log('Probability Data:', yearlyData);

        // 월별 확률별 데이터 구조 생성
        const monthlyProbabilityData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthData = yearlyData.monthlyData?.find((m) => m.month === month);

          if (!monthData || !monthData.probabilities) {
            return {
              month: `${month}월`,
              confirmed: 0,
              prob100: 0,
              prob90: 0,
              prob70: 0,
              prob50: 0,
            };
          }

          // probabilities 배열에서 각 확률별 매출 추출
          const confirmedItem = monthData.probabilities.find((p) => p.probabilityGroup === 'confirmed');
          const prob100Item = monthData.probabilities.find((p) => p.probabilityGroup === '100');
          const prob90Item = monthData.probabilities.find((p) => p.probabilityGroup === '90');
          const prob70Item = monthData.probabilities.find((p) => p.probabilityGroup === '70');
          const prob50Item = monthData.probabilities.find((p) => p.probabilityGroup === '50');

          return {
            month: `${month}월`,
            confirmed: confirmedItem?.sales?.amount || 0,
            prob100: prob100Item?.sales?.amount || 0,
            prob90: prob90Item?.sales?.amount || 0,
            prob70: prob70Item?.sales?.amount || 0,
            prob50: prob50Item?.sales?.amount || 0,
          };
        });

        setChartData(monthlyProbabilityData);
      } catch (error) {
        console.error('Failed to fetch probability data:', error);
        setError('확률별 매출 데이터를 불러오는데 실패했습니다.');
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
          {payload.reverse().map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900">
        월별 확률 분포 ({selectedYear}년)
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="confirmed"
            stackId="1"
            stroke="#1e40af"
            fill="#3b82f6"
            name="확정(confirmed)"
          />
          <Area
            type="monotone"
            dataKey="prob100"
            stackId="1"
            stroke="#059669"
            fill="#10b981"
            name="예정(100%)"
          />
          <Area
            type="monotone"
            dataKey="prob90"
            stackId="1"
            stroke="#d97706"
            fill="#f59e0b"
            name="가능(90%)"
          />
          <Area
            type="monotone"
            dataKey="prob70"
            stackId="1"
            stroke="#dc2626"
            fill="#ef4444"
            name="가능(70%)"
          />
          <Area
            type="monotone"
            dataKey="prob50"
            stackId="1"
            stroke="#7c2d12"
            fill="#9f1239"
            name="가능(50%)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 mt-2">
        * 누적 영역 차트: 각 확률별 매출이 쌓여서 표시됩니다.
      </div>
    </div>
  );
};

export default RevenueByProbability;
