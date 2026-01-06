// src/features/sfa/components/tables/SfaAnnualOverview.jsx
import React, { useEffect, useState } from 'react';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { useSfaStore } from '../../hooks/useSfaStore';
import dayjs from 'dayjs';

// Table Header Cell Component
const TableHeaderCell = ({ children, onClick, colSpan, rowSpan, className = '' }) => (
  <th
    onClick={onClick}
    colSpan={colSpan}
    rowSpan={rowSpan}
    className={`
    bg-gray-100
    p-3
    text-center
    border
    border-gray-200
    font-semibold
    text-sm
    whitespace-nowrap
    ${onClick ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}
    ${className}
  `}
  >
    {children}
  </th>
);

// Table Data Cell Component
const TableDataCell = ({ children, onClick, isProbability = false, isSelected = false }) => (
  <td
    onClick={onClick}
    className={`
    p-3
    border
    text-sm
    ${onClick ? 'cursor-pointer' : ''}
    ${isProbability ? 'bg-gray-50 text-center font-medium' : 'text-right'}
    ${
      isSelected
        ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300 font-semibold'
        : onClick
        ? 'border-gray-200 hover:bg-gray-100'
        : 'border-gray-200'
    }
    transition-all duration-200
  `}
  >
    {children}
  </td>
);

const SfaAnnualOverview = ({ baseDate, duration = 12 }) => {
  const { actions } = useSfaStore();
  const [forecastData, setForecastData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastClick, setLastClick] = useState({
    yearMonth: null,
    probability: null,
  });

  // 월 계산 함수 (기준월부터 duration개월)
  const calculateMonths = (base) => {
    const baseMonth = dayjs(base);
    const months = [];

    for (let i = 0; i < duration; i++) {
      const date = baseMonth.add(i, 'month');
      months.push({
        month: String(date.month() + 1).padStart(2, '0'),
        year: date.year(),
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      });
    }

    return months;
  };

  // 기준월: prop으로 전달받은 baseDate 사용 (폴백: 현재 월)
  const effectiveBaseDate = baseDate || dayjs().startOf('month').format('YYYY-MM-DD');
  const months = calculateMonths(effectiveBaseDate);
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
          profit: parseInt(probData.profit || 0),
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
  }, [effectiveBaseDate, duration]); // effectiveBaseDate 또는 duration 변경 시 데이터 재조회

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 셀 클릭 이벤트 핸들러
  const handleCellClick = (month, probability) => {
    const yearMonth = `${month.year}-${month.month}`;
    if (
      lastClick.yearMonth === yearMonth &&
      lastClick.probability === probability
    ) {
      return;
    }
    setLastClick({ yearMonth, probability });
    actions.filter.updateMonthlyFilter(yearMonth, probability);
  };

  // 헤더 클릭 이벤트 핸들러
  const handleHeaderClick = (month) => {
    const yearMonth = `${month.year}-${month.month}`;
    if (lastClick.yearMonth === yearMonth && lastClick.probability === null) {
      return;
    }
    setLastClick({ yearMonth, probability: null });
    actions.filter.updateMonthlyFilter(yearMonth, null);
  };

  // 셀 선택 상태 확인 함수
  const isCellSelected = (month, probability) => {
    const yearMonth = `${month.year}-${month.month}`;
    return (
      lastClick.yearMonth === yearMonth && lastClick.probability === probability
    );
  };

  const formatMonthHeader = (month, year) => {
    return `${year}.${month}`;
  };

  // 4개월 또는 6개월(duration === 4 || duration === 6)일 때만 매출액, 매출이익 표시
  const showProfit = duration === 4 || duration === 6;

  // 헤더 렌더링
  const renderHeader = () => {
    if (showProfit) {
      return (
        <thead>
          <tr>
            <TableHeaderCell rowSpan={2}>확률</TableHeaderCell>
            {months.map((month) => (
              <TableHeaderCell
                key={`${month.year}-${month.month}-main`}
                colSpan={2}
                onClick={() => handleHeaderClick(month)}
              >
                {formatMonthHeader(month.month, month.year)}
              </TableHeaderCell>
            ))}
          </tr>
          <tr>
            {months.map((month) => (
              <React.Fragment key={`${month.year}-${month.month}-sub`}>
                <TableHeaderCell className="text-xs text-gray-500 font-normal">매출액</TableHeaderCell>
                <TableHeaderCell className="text-xs text-gray-500 font-normal">매출이익</TableHeaderCell>
              </React.Fragment>
            ))}
          </tr>
        </thead>
      );
    }

    // 기본 헤더 (매출액만 표시)
    return (
      <thead>
        <tr>
          <TableHeaderCell>확률</TableHeaderCell>
          {months.map((month) => (
            <TableHeaderCell
              key={`${month.year}-${month.month}`}
              onClick={() => handleHeaderClick(month)}
            >
              {formatMonthHeader(month.month, month.year)}
            </TableHeaderCell>
          ))}
        </tr>
      </thead>
    );
  };

  // 행 렌더링 함수
  const renderRow = (prob) => {
    return (
      <tr key={prob}>
        <TableDataCell isProbability>{prob}</TableDataCell>
        {months.map((month) => {
          const monthData = forecastData[month.month] || {};
          const probData = monthData[prob] || { revenue: 0, profit: 0 };
          const isSelected = isCellSelected(month, prob);

          if (showProfit) {
            return (
              <React.Fragment key={`${month.year}-${month.month}`}>
                <TableDataCell
                  onClick={() => handleCellClick(month, prob)}
                  isSelected={isSelected}
                >
                  {probData.revenue.toLocaleString()}
                </TableDataCell>
                <TableDataCell
                  onClick={() => handleCellClick(month, prob)}
                  isSelected={isSelected}
                >
                  {probData.profit.toLocaleString()}
                </TableDataCell>
              </React.Fragment>
            );
          }

          return (
            <TableDataCell
              key={`${month.year}-${month.month}`}
              onClick={() => handleCellClick(month, prob)}
              isSelected={isSelected}
            >
              {probData.revenue.toLocaleString()}
            </TableDataCell>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {renderHeader()}
          <tbody className="divide-y divide-gray-200">
            {probabilities.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SfaAnnualOverview;