// src/features/sfa/components/SfaMonthlyStats/index.jsx
import React, { useEffect, useState } from 'react';
import { sfaApi } from '../../api/sfaApi';
import { useSfa } from '../../context/SfaProvider';
import { useSfaTable } from '../../hooks/useSfaTable';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
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

const SfaQuarterlyOverview = () => {
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastClick, setLastClick] = useState({
    yearMonth: null,
    probability: null,
  });

  // const { updateFilter } = useSfaTable();
  const { updateMonthlyFilter } = useSfa();

  // 월 계산 함수
  const calculateMonths = () => {
    const baseDate = dayjs();
    const months = [];
    for (let i = -1; i <= 2; i++) {
      const currentDate = baseDate.add(i, 'month');
      months.push({
        month: currentDate.format('MM'),
        year: currentDate.year(),
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
          profit: parseInt(probData.profit || 0),
        };
      }
    });
    return validatedData;
  };

  // 셀 클릭 이벤트 핸들러
  const handleCellClick = (monthObj, probability) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;
    if (
      lastClick.yearMonth === yearMonth &&
      lastClick.probability === probability
    ) {
      return;
    }
    setLastClick({ yearMonth, probability });
    updateMonthlyFilter(yearMonth, probability);
  };

  // 헤더 클릭 이벤트 핸들러
  const handleHeaderClick = (monthObj) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;
    if (lastClick.yearMonth === yearMonth && lastClick.probability === null) {
      return;
    }
    setLastClick({ yearMonth, probability: null });
    updateMonthlyFilter(yearMonth, null);
  };

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const monthlyData = {};
        for (const { year, month } of months) {
          try {
            const date = dayjs()
              .year(year)
              .month(month - 1);
            const startDate = date.startOf('month').format('YYYY-MM-DD');
            const endDate = date.endOf('month').format('YYYY-MM-DD');

            const response = await sfaApi.getSfaMonthStats(startDate, endDate);
            if (response) {
              const validatedData = validateApiData(response);
              if (Object.keys(validatedData).length > 0) {
                monthlyData[month] = validatedData;
              }
            }
          } catch (error) {
            console.error(`Error fetching data for ${year}-${month}:`, error);
            monthlyData[month] = {};
          }
        }
        setMonthlyStats(monthlyData);
      } catch (error) {
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
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
        {months.map((month, index) => {
          const currentMonthData = monthlyStats[month.month];
          const probData = currentMonthData?.[prob] || {
            revenue: 0,
            profit: 0,
          };

          if (index === 0) {
            // 전월
            if (prob === 'confirmed') {
              return (
                <React.Fragment key={`${month.month}-prev`}>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    {probData.revenue.toLocaleString()}
                  </TableDataCell>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    {probData.profit.toLocaleString()}
                  </TableDataCell>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={`${month.month}-prev`}>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  -
                </TableDataCell>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  -
                </TableDataCell>
              </React.Fragment>
            );
          }

          if (index === 1) {
            // 당월
            if (prob === 'confirmed') {
              return (
                <React.Fragment key={`${month.month}-current`}>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    -
                  </TableDataCell>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    -
                  </TableDataCell>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    {probData.revenue.toLocaleString()}
                  </TableDataCell>
                  <TableDataCell onClick={() => handleCellClick(month, prob)}>
                    {probData.profit.toLocaleString()}
                  </TableDataCell>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={`${month.month}-current`}>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  {probData.revenue.toLocaleString()}
                </TableDataCell>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  {probData.profit.toLocaleString()}
                </TableDataCell>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  -
                </TableDataCell>
                <TableDataCell onClick={() => handleCellClick(month, prob)}>
                  -
                </TableDataCell>
              </React.Fragment>
            );
          }

          return (
            // 익월, 익익월
            <React.Fragment key={`${month.month}-future`}>
              <TableDataCell onClick={() => handleCellClick(month, prob)}>
                {probData.revenue.toLocaleString()}
              </TableDataCell>
              <TableDataCell onClick={() => handleCellClick(month, prob)}>
                {probData.profit.toLocaleString()}
              </TableDataCell>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm my-5">
        <thead>
          <tr>
            <TableHeaderCell rowSpan="2">확률</TableHeaderCell>
            <TableHeaderCell
              colSpan="2"
              onClick={() => handleHeaderClick(months[0])}
            >
              전월({months[0].year}.{months[0].month})
            </TableHeaderCell>
            <TableHeaderCell
              colSpan="4"
              onClick={() => handleHeaderClick(months[1])}
            >
              당월({months[1].year}.{months[1].month})
            </TableHeaderCell>
            <TableHeaderCell
              colSpan="2"
              onClick={() => handleHeaderClick(months[2])}
            >
              익월({months[2].year}.{months[2].month})
            </TableHeaderCell>
            <TableHeaderCell
              colSpan="2"
              onClick={() => handleHeaderClick(months[3])}
            >
              익익월({months[3].year}.{months[3].month})
            </TableHeaderCell>
          </tr>
          <tr>
            <TableHeaderCell>실제매출액</TableHeaderCell>
            <TableHeaderCell>실제매출이익</TableHeaderCell>
            <TableHeaderCell>예상매출액</TableHeaderCell>
            <TableHeaderCell>예상매출이익</TableHeaderCell>
            <TableHeaderCell>실제매출액</TableHeaderCell>
            <TableHeaderCell>실제매출이익</TableHeaderCell>
            <TableHeaderCell>예상매출액</TableHeaderCell>
            <TableHeaderCell>예상매출이익</TableHeaderCell>
            <TableHeaderCell>예상매출액</TableHeaderCell>
            <TableHeaderCell>예상매출이익</TableHeaderCell>
          </tr>
        </thead>
        <tbody>{probabilities.map(renderRow)}</tbody>
      </table>
    </div>
  );
};

export default SfaQuarterlyOverview;
