// src/features/sfa/components/tables/SfaAnnualOverview.jsx
import React, { useEffect, useState } from 'react';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { useSfaSearchFilter } from '../../hooks/useSfaSearchFilter';
import dayjs from 'dayjs';

// Table Header Cell Component
const TableHeaderCell = ({ children, onClick, colSpan, rowSpan }) => (
  <th
    onClick={onClick}
    colSpan={colSpan}
    rowSpan={rowSpan}
    className={`
      bg-gray-100 p-3 text-center border border-gray-200 
      font-semibold text-sm cursor-pointer
      hover:bg-gray-200 transition-colors
    `}
  >
    {children}
  </th>
);

// Table Data Cell Component
const TableDataCell = ({ children, onClick, isProbability }) => (
  <td
    onClick={onClick}
    className={`
      p-3 border border-gray-200 text-sm cursor-pointer
      ${isProbability ? 'bg-gray-50 text-center font-medium' : 'text-right'}
      hover:bg-gray-100 transition-colors
    `}
  >
    {children}
  </td>
);

const SfaAnnualOverview = () => {
  const [forecastData, setForecastData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastClick, setLastClick] = useState({
    yearMonth: null,
    probability: null,
  });

  const { updateMonthlyFilter } = useSfaSearchFilter();

  // 월 계산 함수 (현재 월부터 12개월)
  const calculateMonths = () => {
    const now = dayjs();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = now.add(i, 'month');
      months.push({
        month: String(date.month() + 1).padStart(2, '0'),
        year: date.year(),
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      });
    }

    return months;
  };

  const months = calculateMonths();
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

  // 셀 클릭 이벤트 핸들러
  const handleCellClick = (monthObj, probability) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;
    console.log('Cell clicked:', { yearMonth, probability }); // 디버깅용 로그 추가

    if (
      lastClick.yearMonth === yearMonth &&
      lastClick.probability === probability
    ) {
      console.log('Clearing filter'); // 디버깅용 로그 추가
      setLastClick({ yearMonth: null, probability: null });
      updateMonthlyFilter(null, null);
    } else {
      console.log('Setting new filter'); // 디버깅용 로그 추가
      setLastClick({ yearMonth, probability });
      updateMonthlyFilter(yearMonth, probability);
    }
  };

  // 헤더 클릭 이벤트 핸들러
  const handleHeaderClick = (monthObj) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;
    console.log('Header clicked:', { yearMonth }); // 디버깅용 로그 추가

    if (lastClick.yearMonth === yearMonth && lastClick.probability === null) {
      console.log('Clearing header filter'); // 디버깅용 로그 추가
      setLastClick({ yearMonth: null, probability: null });
      updateMonthlyFilter(null, null);
    } else {
      console.log('Setting new header filter'); // 디버깅용 로그 추가
      setLastClick({ yearMonth, probability: null });
      updateMonthlyFilter(yearMonth, null);
    }
  };

  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
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

        const results = await Promise.all(statsPromises);
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
  }, []);

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 행 렌더링 함수
  const renderRow = (prob) => {
    return (
      <tr key={prob}>
        <TableDataCell
          isProbability
          onClick={() => handleCellClick(months[0], prob)}
        >
          {prob}
        </TableDataCell>
        {months.map((month) => {
          const monthData = forecastData[month.month] || {};
          const probData = monthData[prob] || { revenue: 0 };

          return (
            <TableDataCell
              key={`${month.year}-${month.month}`}
              onClick={() => handleCellClick(month, prob)}
            >
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
                <TableHeaderCell
                  key={`${month.year}-${month.month}`}
                  onClick={() => handleHeaderClick(month)}
                >
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
