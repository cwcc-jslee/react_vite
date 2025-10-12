// src/features/sfa/components/analytics/RevenueComparison.jsx
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';

/**
 * 확정/예정 매출 비교 그룹 막대 차트
 * - 월별 확정 매출 vs 예정 매출
 */
const RevenueComparison = ({ selectedYear }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 선택된 년도의 12개월 생성
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month: String(month).padStart(2, '0'),
      startDate: dayjs(`${selectedYear}-${month}-01`).startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs(`${selectedYear}-${month}-01`).endOf('month').format('YYYY-MM-DD'),
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 모든 월의 데이터를 병렬로 요청
        const promises = months.map(({ month, startDate, endDate }) =>
          sfaApi
            .getSfaMonthStats(startDate, endDate)
            .then((response) => ({ month, data: response }))
            .catch((error) => {
              console.error(`Error fetching data for ${startDate}:`, error);
              return { month, data: {} };
            })
        );

        const results = await Promise.all(promises);

        // 차트 데이터 구조화
        const formattedData = results.map(({ month, data }) => {
          const confirmed = data.confirmed?.revenue || 0;
          const probable = data['100']?.revenue || 0;

          return {
            month: `${parseInt(month)}월`,
            confirmed,
            probable,
            total: confirmed + probable,
          };
        });

        setChartData(formattedData);
      } catch (error) {
        console.error('Failed to fetch comparison data:', error);
        setError('비교 데이터를 불러오는데 실패했습니다.');
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
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
          <p className="text-sm font-bold text-gray-700 mt-2 pt-2 border-t">
            합계: {total.toLocaleString()}원
          </p>
        </div>
      );
    }
    return null;
  };

  // 통계 요약
  const totalConfirmed = chartData.reduce((sum, item) => sum + item.confirmed, 0);
  const totalProbable = chartData.reduce((sum, item) => sum + item.probable, 0);
  const grandTotal = totalConfirmed + totalProbable;
  const confirmedRatio = grandTotal > 0 ? Math.round((totalConfirmed / grandTotal) * 100) : 0;
  const probableRatio = grandTotal > 0 ? Math.round((totalProbable / grandTotal) * 100) : 0;

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900">
        확정/예정 매출 비교 ({selectedYear}년)
      </h2>

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">확정 매출</div>
          <div className="text-xl font-bold text-blue-600">
            {(totalConfirmed / 100000000).toFixed(1)}억
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체의 {confirmedRatio}%
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">예정 매출</div>
          <div className="text-xl font-bold text-green-600">
            {(totalProbable / 100000000).toFixed(1)}억
          </div>
          <div className="text-xs text-gray-500 mt-1">
            전체의 {probableRatio}%
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">총 매출</div>
          <div className="text-xl font-bold text-purple-600">
            {(grandTotal / 100000000).toFixed(1)}억
          </div>
          <div className="text-xs text-gray-500 mt-1">
            연간 합계
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="confirmed"
            fill="#3b82f6"
            name="확정 매출"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="probable"
            fill="#10b981"
            name="예정 매출"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-500 mt-2">
        * 확정: 매출일 확정 (confirmed), 예정: 매출일 미확정 (100%)
      </div>
    </div>
  );
};

export default RevenueComparison;
