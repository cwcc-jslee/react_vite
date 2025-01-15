// src/features/sfa/components/SfaMonthlyStats/index.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sfaApi } from '../../api/sfaApi';
import { useSfa } from '../../context/SfaContext';
import dayjs from 'dayjs';

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
  const [lastClick, setLastClick] = useState({
    yearMonth: null,
    probability: null,
  });

  const { updateFilter } = useSfa();

  // 월 계산 함수 - dayjs 사용
  const calculateMonths = () => {
    // 현재 월을 기준으로 계산
    const baseDate = dayjs();
    const months = [];

    // 전월부터 익익월까지 4개월 계산
    for (let i = -1; i <= 2; i++) {
      const currentDate = baseDate.add(i, 'month');
      months.push({
        month: currentDate.format('MM'),  // '01'-'12' 형식
        year: currentDate.year()
      });
    }

    // console.log('Calculated months:', months);
    return months;
  };

  const months = calculateMonths();

  const probabilities = ['confirmed', '100', '90', '70', '50'];

  // API 응답 데이터 검증 및 처리
  const validateApiData = (data) => {
    if (!data) {
      console.warn('Empty API response');
      return {};
    }

    const validatedData = {};
    
    // 각 확률에 대해 데이터 검증 및 처리
    probabilities.forEach(prob => {
      const probData = data[prob];
      if (probData) {
        validatedData[prob] = {
          revenue: parseInt(probData.revenue || 0),
          profit: parseInt(probData.profit || 0)
        };
        console.log(`Validated data for probability ${prob}:`, validatedData[prob]);
      }
    });

    return validatedData;
  };

  // 디버깅을 위한 상태 변경 감시
  useEffect(() => {
    console.log('monthlyStats updated:', monthlyStats);
  }, [monthlyStats]);

  // 셀 클릭 이벤트 핸들러
  const handleCellClick = (monthObj, probability) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;

    if (lastClick.yearMonth === yearMonth && lastClick.probability === probability) {
      return;
    }

    setLastClick({
      yearMonth,
      probability,
    });
    updateFilter(yearMonth, probability);
    console.log(`Clicked Table [ ${yearMonth} / ${probability}]`);
  };

  // 헤더 클릭 이벤트 핸들러
  const handleHeaderClick = (monthObj) => {
    const yearMonth = `${monthObj.year}-${monthObj.month}`;

    if (lastClick.yearMonth === yearMonth && lastClick.probability === null) {
      return;
    }

    setLastClick({
      yearMonth,
      probability: null,
    });
    updateFilter(yearMonth, null);
    console.log(`Clicked Table [ ${yearMonth} / null ]`);
  };

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching data for months:', months);
        const monthlyData = {};

        // 각 월별 데이터를 순차적으로 처리
        for (const { year, month } of months) {
          try {
            // 날짜 범위 계산
            const date = dayjs().year(year).month(month -1);  // dayjs : 0-11 사용
            const startDate = date.startOf('month').format('YYYY-MM-DD');
            const endDate = date.endOf('month').format('YYYY-MM-DD');
            console.log('>>Fetching data for:', { startDate, endDate });

            // API 호출 및 응답 데이터 가져오기
            const response = await sfaApi.getSfaMonthStats(startDate, endDate);
            console.log(`Month ${month} - Raw API response:`, response);

            // 응답 데이터 검증 및 처리
            if (response) {
              const validatedData = validateApiData(response);
              console.log(`Month ${month} - Validated data:`, validatedData);

              // 유효한 데이터가 있는 경우에만 저장
              if (Object.keys(validatedData).length > 0) {
                monthlyData[month] = validatedData;
                console.log(`Month ${month} - Data added to monthlyData:`, monthlyData[month]);
              }
            }
          } catch (error) {
            console.error(`Error fetching data for ${year}-${month}:`, error);
            // 에러 발생 시 빈 객체로 초기화
            monthlyData[month] = {};
          }
        }

        console.log('Final monthlyData before setState:', monthlyData);
        setMonthlyStats(prevStats => {
          console.log('Previous monthlyStats:', prevStats);
          console.log('New monthlyStats:', monthlyData);
          return monthlyData;
        });

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
    // console.log('Current monthlyStats:', monthlyStats);
    
    return (
      <tr key={prob}>
        <Td className="probability" onClick={() => handleCellClick(months[0], prob)}>{prob}</Td>
        {months.map((month, index) => {
          // 현재 월의 데이터 가져오기
          const currentMonthData = monthlyStats[month.month];
          // console.log(`Month ${month.month} data:`, currentMonthData);
          
          // 현재 확률에 대한 데이터 가져오기
          const probData = currentMonthData?.[prob] || { revenue: 0, profit: 0 };
          // console.log(`Probability ${prob} data for month ${month.month}:`, probData);


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
            }
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