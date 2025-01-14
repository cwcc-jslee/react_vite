// src/features/sfa/components/SfaForecastTable/index.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sfaApi } from '../../api/sfaApi';
import dayjs from 'dayjs';

const ForecastTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
`;

const Th = styled.th`
  background: #f3f4f6;
  padding: 12px;
  text-align: center;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px;
  text-align: right;
  border: 1px solid #e5e7eb;
  font-size: 12px;

  &.probability {
    background: #f9fafb;
    text-align: center;
    font-weight: 500;
  }
`;

const LoadingDiv = styled.div`
  text-align: center;
  padding: 20px;
`;

const ErrorDiv = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;

const SfaForecastTable = () => {
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

  if (loading) return <LoadingDiv>로딩중...</LoadingDiv>;
  if (error) return <ErrorDiv>{error}</ErrorDiv>;

  // 행 렌더링 함수
  const renderRow = (prob) => {
    return (
      <tr key={prob}>
        <Td className="probability">{prob}</Td>
        {months.map((month) => {
          const monthData = forecastData[month.month] || {};
          const probData = monthData[prob] || { revenue: 0 };

          return (
            <Td key={`${month.year}-${month.month}`}>
              {probData.revenue.toLocaleString()}
            </Td>
          );
        })}
      </tr>
    );
  };

  const formatMonthHeader = (month, year) => {
    return `${year}.${month}`;
  };

  return (
    <div>
      <h2>년간 매출예측</h2>
      <ForecastTable>
        <thead>
          <tr>
            <Th>확률</Th>
            {months.map((month) => (
              <Th key={`${month.year}-${month.month}`}>
                {formatMonthHeader(month.month, month.year)}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>{probabilities.map(renderRow)}</tbody>
      </ForecastTable>
    </div>
  );
};

export default SfaForecastTable;
