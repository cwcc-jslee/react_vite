// src/features/customer/components/CustomerOverview.jsx
import React, { useEffect, useState } from 'react';
// import { StateDisplay } from '../../../shared/components/ui/state/StateDisplay';
import { Table } from '../../../../shared/components/ui/index';
import dayjs from 'dayjs';

// 상수 정의
const CATEGORIES = {
  기업분류: ['전체', '일반기업', '공공기관', '지원기관'],
  신규고객: ['당월', '전월', '전전월', '금년'],
  기업규모: ['소기업', '중기업', '중견기업', '대기업'],
  지원사업: ['금년', '제안', '신청', '선정'],
};

const initialData = {
  기업분류: { 일반기업: 0, 공공기관: 0, 지원기관: 0 },
  신규고객: { 당월: 0, 전월: 0, 전전월: 0, '23년': 0 },
  기업규모: { 소기업: 0, 중기업: 0, 중견기업: 0, 대기업: 0 },
  지원사업: { 금년: 0, 제안: 0, 신청: 0, 선정: 0 },
};

// 테이블 헤더 셀 컴포넌트
const TableHeaderCell = ({ children }) => (
  <Table.Th className="whitespace-nowrap bg-gray-100">{children}</Table.Th>
);

// 테이블 데이터 셀 컴포넌트
const TableDataCell = ({ children, isTitle = false }) => (
  <Table.Td
    align="center"
    className={`${
      isTitle ? 'bg-gray-50 font-medium' : ''
    } hover:bg-gray-100 transition-colors`}
  >
    {children}
  </Table.Td>
);

const CustomerStatisticsOverview = ({ api }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날짜 범위 계산 함수
  const getDateRange = (subtract = 0) => [
    dayjs().subtract(subtract, 'month').startOf('month').format('YYYY-MM-DD'),
    dayjs().subtract(subtract, 'month').endOf('month').format('YYYY-MM-DD'),
  ];

  // API 호출 함수
  const getCount = async (category, key, value) => {
    try {
      let filter = [];

      if (category === '기업분류' || category === '기업규모') {
        const fieldName =
          category === '기업분류' ? 'co_classification' : 'business_scale';
        filter = [
          {
            [fieldName]: {
              name: { $eq: key },
            },
          },
        ];
      } else if (category === '신규고객') {
        filter = [
          { createdAt: { $gte: value[0] } },
          { createdAt: { $lte: value[1] } },
        ];
      }

      const response = await api.getCount(filter);
      return { category, key, count: response?.meta?.pagination?.total || 0 };
    } catch (error) {
      console.error(`Error fetching ${category} count:`, error);
      return { category, key, count: 0 };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises = [];

        // 기업분류 데이터 조회
        Object.keys(data.기업분류).forEach((key) =>
          promises.push(getCount('기업분류', key)),
        );

        // 기업규모 데이터 조회
        Object.keys(data.기업규모).forEach((key) =>
          promises.push(getCount('기업규모', key)),
        );

        // 신규고객 데이터 조회
        const dateRanges = [0, 1, 2].map(getDateRange);
        dateRanges.push([
          dayjs().startOf('year').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD'),
        ]);

        CATEGORIES.신규고객.forEach((key, i) =>
          promises.push(getCount('신규고객', key, dateRanges[i])),
        );

        const results = await Promise.all(promises);
        const newData = { ...initialData };

        results.forEach(({ category, key, count }) => {
          if (category && key) {
            newData[category][key] = count;
          }
        });

        setData(newData);
      } catch (error) {
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  //   if (loading) return <StateDisplay type="loading" />;
  //   if (error) return <StateDisplay type="error" message={error} />;

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.Row>
            <TableHeaderCell>기업분류</TableHeaderCell>
            <TableHeaderCell>Count</TableHeaderCell>
            <TableHeaderCell>신규고객</TableHeaderCell>
            <TableHeaderCell>Count</TableHeaderCell>
            <TableHeaderCell>기업규모</TableHeaderCell>
            <TableHeaderCell>Count</TableHeaderCell>
            <TableHeaderCell>지원사업</TableHeaderCell>
            <TableHeaderCell>Count</TableHeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {CATEGORIES.기업분류.map((category, index) => (
            <Table.Row key={index} className="hover:bg-gray-50">
              <TableDataCell isTitle>{category}</TableDataCell>
              <TableDataCell>{data.기업분류[category] || 0}</TableDataCell>
              <TableDataCell isTitle>
                {CATEGORIES.신규고객[index]}
              </TableDataCell>
              <TableDataCell>
                {data.신규고객[CATEGORIES.신규고객[index]] || 0}
              </TableDataCell>
              <TableDataCell isTitle>
                {CATEGORIES.기업규모[index]}
              </TableDataCell>
              <TableDataCell>
                {data.기업규모[CATEGORIES.기업규모[index]] || 0}
              </TableDataCell>
              <TableDataCell isTitle>
                {CATEGORIES.지원사업[index]}
              </TableDataCell>
              <TableDataCell>
                {data.지원사업[CATEGORIES.지원사업[index]] || 0}
              </TableDataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default CustomerStatisticsOverview;
