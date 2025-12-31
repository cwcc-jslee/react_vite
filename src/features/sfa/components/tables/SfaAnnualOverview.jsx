// src/features/sfa/components/tables/SfaAnnualOverview.jsx
import React, { useEffect, useState } from 'react';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { useSfaStore } from '../../hooks/useSfaStore';
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
  const { filters } = useSfaStore();
  const [forecastData, setForecastData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 월 계산 함수 (기준월부터 12개월)
  const calculateMonths = (baseDate) => {
    const base = dayjs(baseDate);
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = base.add(i, 'month');
      months.push({
        month: String(date.month() + 1).padStart(2, '0'),
        year: date.year(),
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      });
    }

    return months;
  };

  // 기준월: filters.dateRange.startDate 또는 현재 월
  const baseDate = filters.dateRange?.startDate || dayjs().startOf('month').format('YYYY-MM-DD');
  const months = calculateMonths(baseDate);
  const probabilities = ['confirmed', '100', '90', '70', '50'];

  // API 응답 데이터 검증 및 처리
  const validateApiData = (data) => {
    if (!data) return {};

    const validatedData = {};
    probabilities.forEach((prob) => {
      const probData = data[prob];
      if (probData) {
        validatedData[prob] = {
          revenue: parseInt(probData.revenue || 0),
        };
      }
    });
    return validatedData;
  };

  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 모든 월의 데이터를 병렬로 요청
        const statsPromises = months.map(({ month, startDate, endDate }) =>
          sfaApi
            .getSfaMonthStats(startDate, endDate)
            .then((response) => {
              const validatedData = validateApiData(response);
              return { month, data: validatedData };
            })
            .catch((error) => {
              console.error(
                `Error fetching data for ${startDate} to ${endDate}:`,
                error,
              );
              return { month, data: {} };
            }),
        );

        // Promise.all을 사용하여 모든 요청을 동시에 처리
        const results = await Promise.all(statsPromises);

        // 결과를 월별로 정리
        const monthlyData = results.reduce((acc, { month, data }) => {
          acc[month] = data;
          return acc;
        }, {});

        setForecastData(monthlyData);
      } catch (error) {
        console.error('Failed to fetch forecast data:', error);
        setError('예측 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [baseDate]); // baseDate 변경 시 데이터 재조회

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
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
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
