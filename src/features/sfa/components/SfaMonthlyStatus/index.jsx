// src/features/sfa/components/SfaMonthlyStats/index.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sfaApi } from '../../api/sfaApi';
import { useSfa } from '../../context/SfaContext';

// 스타일 컴포넌트 정의
const StatsTable = styled.table`
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
  cursor: pointer;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const Td = styled.td`
  padding: 12px;
  text-align: right;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  cursor: pointer;

  &.probability {
    background: #f9fafb;
    text-align: center;
    font-weight: 500;
  }

  &:hover {
    background-color: #f3f4f6;
  }
`;

const SfaMonthlyStats = () => {
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 마지막 클릭 상태를 저장하는 state 추가
  const [lastClick, setLastClick] = useState({
    yearMonth: null,
    probability: null,
  });

  const { updateFilter } = useSfa();

  // 월 계산 함수
  const calculateMonths = () => {
    const now = new Date();
    const months = [];

    // 전월부터 익익월까지 4개월 계산
    for (let i = -1; i <= 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push({
        month,
        year: date.getFullYear(),
      });
    }

    return months;
  };

  const months = calculateMonths();
  const probabilities = ['confirmed', '100', '90', '70', '50'];

  // 셀 클릭 이벤트 핸들러
  const handleCellClick = (monthObj, probability) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;

    // 이전 클릭과 동일한 셀인지 확인
    if (
      lastClick.yearMonth === yearMonth &&
      lastClick.probability === probability
    ) {
      return; // 동일한 셀이면 함수 종료
    }

    // 새로운 클릭 정보 저장
    setLastClick({
      yearMonth,
      probability,
    });
    // SfaContext의 필터 업데이트
    updateFilter(yearMonth, probability);
    console.log(`Clicked Table [ ${yearMonth} / ${probability}]`);
  };

  // 헤더 클릭 이벤트 핸들러
  const handleHeaderClick = (monthObj) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;

    // 이전 클릭과 동일한 헤더인지 확인
    if (lastClick.yearMonth === yearMonth && lastClick.probability === null) {
      return; // 동일한 헤더면 함수 종료
    }

    // 새로운 클릭 정보 저장 (헤더는 probability가 없으므로 null)
    setLastClick({
      yearMonth,
      probability: null,
    });

    // SfaContext의 필터 업데이트
    updateFilter(yearMonth, null);
    console.log(`Clicked Table [ ${yearMonth} / null ]`);
  };

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const statsPromises = months.map(({ year, month }) =>
          sfaApi
            .getSfaMonthStats(year, parseInt(month) - 1)
            .then((data) => ({ month: month, data })),
        );
        const results = await Promise.all(statsPromises);

        const monthlyData = results.reduce((acc, { month, data }) => {
          acc[month] = data;
          return acc;
        }, {});

        setMonthlyStats(monthlyData);
      } catch (error) {
        console.error('Failed to fetch monthly stats:', error);
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;

  // 행 렌더링 함수
  const renderRow = (prob) => {
    return (
      <tr key={prob}>
        <Td
          className="probability"
          onClick={() => handleCellClick(months[0], prob)}
        >
          {prob}
        </Td>
        {months.map((month, index) => {
          const monthData = monthlyStats[month.month] || {};
          const probData = monthData[prob] || { revenue: 0, profit: 0 };

          // 전월 (index === 0)
          if (index === 0) {
            if (prob === 'confirmed') {
              return (
                <React.Fragment key={`${month.month}-prev`}>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.revenue.toLocaleString()}
                  </Td>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.profit.toLocaleString()}
                  </Td>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={`${month.month}-prev`}>
                <Td onClick={() => handleCellClick(month, prob)}>-</Td>
                <Td onClick={() => handleCellClick(month, prob)}>-</Td>
              </React.Fragment>
            );
          }

          // 당월 (index === 1)
          if (index === 1) {
            if (prob === 'confirmed') {
              return (
                <React.Fragment key={`${month.month}-current`}>
                  <Td onClick={() => handleCellClick(month, prob)}>-</Td>
                  <Td onClick={() => handleCellClick(month, prob)}>-</Td>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.revenue.toLocaleString()}
                  </Td>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.profit.toLocaleString()}
                  </Td>
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={`${month.month}-current`}>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.revenue.toLocaleString()}
                  </Td>
                  <Td onClick={() => handleCellClick(month, prob)}>
                    {probData.profit.toLocaleString()}
                  </Td>
                  <Td onClick={() => handleCellClick(month, prob)}>-</Td>
                  <Td onClick={() => handleCellClick(month, prob)}>-</Td>
                </React.Fragment>
              );
            }
          }

          // 익월, 익익월 (index === 2 or 3)
          return (
            <React.Fragment key={`${month.month}-future`}>
              <Td onClick={() => handleCellClick(month, prob)}>
                {probData.revenue.toLocaleString()}
              </Td>
              <Td onClick={() => handleCellClick(month, prob)}>
                {probData.profit.toLocaleString()}
              </Td>
            </React.Fragment>
          );
        })}
      </tr>
    );
  };

  return (
    <StatsTable>
      <thead>
        <tr>
          <Th rowSpan="2">확률</Th>
          <Th colSpan="2" onClick={() => handleHeaderClick(months[0])}>
            전월({months[0].year}.{months[0].month})
          </Th>
          <Th colSpan="4" onClick={() => handleHeaderClick(months[1])}>
            당월({months[1].year}.{months[1].month})
          </Th>
          <Th colSpan="2" onClick={() => handleHeaderClick(months[2])}>
            익월({months[2].year}.{months[2].month})
          </Th>
          <Th colSpan="2" onClick={() => handleHeaderClick(months[3])}>
            익익월({months[3].year}.{months[3].month})
          </Th>
        </tr>
        <tr>
          <Th>실제매출액</Th>
          <Th>실제매출이익</Th>
          <Th>예상매출액</Th>
          <Th>예상매출이익</Th>
          <Th>실제매출액</Th>
          <Th>실제매출이익</Th>
          <Th>예상매출액</Th>
          <Th>예상매출이익</Th>
          <Th>예상매출액</Th>
          <Th>예상매출이익</Th>
        </tr>
      </thead>
      <tbody>{probabilities.map(renderRow)}</tbody>
    </StatsTable>
  );
};

export default SfaMonthlyStats;
