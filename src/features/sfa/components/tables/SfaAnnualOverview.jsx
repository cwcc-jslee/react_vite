// src/features/sfa/components/SfaForecastTable/index.jsx
import React, { useEffect, useState } from 'react';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import dayjs from 'dayjs';

// Table Header Cell Component
const TableHeaderCell = ({ children }) => (
  <th
    className="
    bg-gray-100 
    p-3 
    text-center 
    border 
    border-gray-200 
    font-semibold 
    text-sm 
    whitespace-nowrap
  "
  >
    {children}
  </th>
);

// Table Data Cell Component
const TableDataCell = ({ children, isProbability = false }) => (
  <td
    className={`
    p-3 
    border 
    border-gray-200 
    text-sm
    ${isProbability ? 'bg-gray-50 text-center font-medium' : 'text-right'}
  `}
  >
    {children}
  </td>
);

const SfaAnnualOverview = () => {
  const [forecastData, setForecastData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 월 계산 함수 (현재 월부터 12개월)
  const calculateMonths = () => {
    const now = dayjs();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = now.add(i, 'month');
      months.push({
        month: String(date.month() + 1).padStart(2, '0'),
        year: date.year(),
      });
    }

    return months;
  };

  const months = calculateMonths();
  const probabilities = ['confirmed', '100', '90', '70', '50'];

  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
        const statsPromises = months.map(({ year, month }) =>
          sfaApi
            .getSfaMonthStats(year, parseInt(month) - 1)
            .then((data) => ({ month: month, data })),
        );
        const results = await Promise.all(statsPromises);

        const forecastMonthlyData = results.reduce((acc, { month, data }) => {
          acc[month] = data;
          return acc;
        }, {});

        setForecastData(forecastMonthlyData);
      } catch (error) {
        console.error('Failed to fetch forecast data:', error);
        setError('예측 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, []);

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 행 렌더링 함수
  const renderRow = (prob) => {
    return (
      <tr key={prob}>
        <TableDataCell isProbability>{prob}</TableDataCell>
        {months.map((month) => {
          const monthData = forecastData[month.month] || {};
          const probData = monthData[prob] || { revenue: 0 };

          return (
            <TableDataCell key={`${month.year}-${month.month}`}>
              {probData.revenue.toLocaleString()}
            </TableDataCell>
          );
        })}
      </tr>
    );
  };

  const formatMonthHeader = (month, year) => {
    return `${year}.${month}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">년간 매출예측</h2>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm my-5">
          <thead>
            <tr>
              <TableHeaderCell>확률</TableHeaderCell>
              {months.map((month) => (
                <TableHeaderCell key={`${month.year}-${month.month}`}>
                  {formatMonthHeader(month.month, month.year)}
                </TableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {probabilities.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SfaAnnualOverview;
