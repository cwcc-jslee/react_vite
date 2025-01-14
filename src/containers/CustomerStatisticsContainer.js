import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomerStatisticsTable from '../components/customer/CustomerStatisticsTable';
import * as api from '../lib/api/api';
import sumSalesValueByMonth from '../modules/temp/sumSalesValueByMonth';
// import moment from 'moment';
import dayjs from 'dayjs';
import startEndDay from '../modules/common/startEndDay';
// import { getSalesList } from '../../modules/sales';
// import { qs_salesStatistics, qs_salesAdvanced } from '../../lib/api/query';
import { qs_sfaStatistics } from '../lib/api/querySfa';
import fetchAllList from '../lib/api/fetchAllListR1';
import styled from 'styled-components';
import { qs_getCount } from '../lib/api/queryCustomer';

const categories = ['전체', '일반기업', '공공기관', '지원기관'];
const newCustomers = ['당월', '전월', '전전월', '금년'];
const companySizes = ['소기업', '중기업', '중견기업', '대기업'];
const supportBusinesses = ['금년', '제안', '신청', '선정'];

const initialData = {
  기업분류: { 일반기업: 0, 공공기관: 0, 지원기관: 0 },
  신규고객: { 당월: 0, 전월: 0, 전전월: 0, '23년': 0 },
  기업규모: { 소기업: 0, 중기업: 0, 중견기업: 0, 대기업: 0 },
  지원사업: { 금년: 0, 제안: 0, 신청: 0, 선정: 0 },
};

const getDateRange = (subtract = 0) => [
  dayjs().subtract(subtract, 'month').startOf('month').format('YYYY-MM-DD'),
  dayjs().subtract(subtract, 'month').endOf('month').format('YYYY-MM-DD'),
];

const getCount = async (arg, key, value) => {
  let filter = [];
  if (arg === '기업분류' || arg === '기업규모') {
    const fieldName =
      arg === '기업분류' ? 'co_classification' : 'business_scale';
    filter = [
      {
        [fieldName]: {
          name: {
            $eq: key,
          },
        },
      },
    ];
  } else if (arg === '신규고객') {
    filter = [
      {
        createdAt: {
          $gte: value[0],
        },
      },
      {
        createdAt: {
          $lte: value[1],
        },
      },
    ];
  }

  const query = qs_getCount(filter);
  // console.log('>>(query)>>', query);
  const request = await api.getQueryString('api/customers', query);
  // Assuming newRequest returns a count, update state
  const count =
    request.status === 200 ? request.data.meta.pagination.total : '__';
  return { arg, key, count };
};

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;

  th {
    border-top: 3px double #bbb;
    border-bottom: 3px double #bbb;
    padding: 8px;
    text-align: center;
  }

  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const CustomerStatisticsContainer = () => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const fetchCounts = async () => {
      const promises = [];

      Object.keys(data.기업분류).forEach((key) =>
        promises.push(getCount('기업분류', key)),
      );

      Object.keys(data.기업규모).forEach((key) =>
        promises.push(getCount('기업규모', key)),
      );

      const dateRanges = [0, 1, 2].map(getDateRange);
      dateRanges.push([
        dayjs().startOf('year').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
      ]);

      newCustomers.forEach((key, i) =>
        promises.push(getCount('신규고객', key, dateRanges[i])),
      );

      const results = await Promise.all(promises);
      const newData = { ...initialData };
      results.forEach(({ arg, key, count }) => {
        newData[arg][key] = count;
      });

      setData(newData);
    };

    fetchCounts();
  }, []);

  return (
    <Table>
      <thead>
        <tr>
          <th>기업분류</th>
          <th>count</th>
          <th>신규고객</th>
          <th>count</th>
          <th>기업규모</th>
          <th>count</th>
          <th>지원사업</th>
          <th>count</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category, index) => (
          <tr key={index}>
            <td>{category}</td>
            <td>{data.기업분류[category]}</td>
            <td>{newCustomers[index]}</td>
            <td>{data.신규고객[newCustomers[index]]}</td>
            <td>{companySizes[index]}</td>
            <td>{data.기업규모[companySizes[index]]}</td>
            <td>{supportBusinesses[index]}</td>
            <td>{data.지원사업[supportBusinesses[index]]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CustomerStatisticsContainer;
