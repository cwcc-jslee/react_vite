import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Base = styled.div`
  width: 100%;
`;

const SfaDashboardChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  const labels = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const jsonData = {
    확정: {
      '1월': { 매출: 123, 이익: 45 },
      '2월': { 매출: 234, 이익: 67 },
      '3월': { 매출: 345, 이익: 78 },
      '4월': { 매출: 123, 이익: 45 },
      '5월': { 매출: 234, 이익: 67 },
      '6월': { 매출: 345, 이익: 78 },
      '7월': { 매출: 123, 이익: 45 },
      '8월': { 매출: 234, 이익: 67 },
      '9월': { 매출: 345, 이익: 78 },
      '10월': { 매출: 123, 이익: 45 },
      '11월': { 매출: 234, 이익: 67 },
      '12월': { 매출: 345, 이익: 78 },
    },
  };

  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const data = {
    labels,
    datasets: [
      {
        label: '콘넨츠',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'ICT',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: '전략',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(0, 255, 102, 0.5)',
      },
      {
        label: '기타',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: 'rgba(255, 204, 0, 1)',
      },
    ],
  };

  return (
    <Base>
      <Bar options={options} data={data} />
    </Base>
  );
};

export default SfaDashboardChart;
