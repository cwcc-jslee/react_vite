// src/features/project/components/charts/ProjectServiceDonutChart.jsx
// 서비스별 도넛 차트 (동적 서비스 데이터 기준)

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// 동적 색상 생성을 위한 색상 팔레트 (팀과 다른 색상 사용)
const COLOR_PALETTE = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280',
  '#14B8A6', '#A78BFA', '#34D399', '#FBBF24', '#FB7185'
];

/**
 * 서비스별 도넛 차트 컴포넌트
 * 동적 서비스 데이터를 기반으로 프로젝트 수를 시각화
 */
const ProjectServiceDonutChart = ({ service = {}, isFiltered = false }) => {
  // 서비스 데이터를 배열로 변환하고 정렬 (프로젝트 수 기준 내림차순)
  const serviceEntries = Object.entries(service).sort((a, b) => b[1] - a[1]);

  // 서비스별 데이터 및 색상 정의
  const serviceData = serviceEntries.map(([serviceName, count], index) => ({
    label: serviceName,
    value: count,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    bgColor: COLOR_PALETTE[index % COLOR_PALETTE.length] + '80', // 투명도 추가
  }));

  // 총 개수 계산
  const totalProjects = serviceData.reduce((sum, item) => sum + item.value, 0);

  // 차트 데이터 구성
  const chartData = {
    labels: serviceData.map(item => item.label),
    datasets: [
      {
        data: serviceData.map(item => item.value),
        backgroundColor: serviceData.map(item => item.bgColor),
        borderColor: serviceData.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: serviceData.map(item => item.color),
        hoverBorderWidth: 3,
      },
    ],
  };

  // 차트 옵션
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, index) => ({
              text: `${label}: ${data.datasets[0].data[index]}개`,
              fillStyle: data.datasets[0].backgroundColor[index],
              strokeStyle: data.datasets[0].borderColor[index],
              pointStyle: 'circle',
              hidden: false,
              index,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = totalProjects > 0 ? ((value / totalProjects) * 100).toFixed(1) : 0;
            return `${context.label}: ${value}개 (${percentage}%)`;
          },
        },
      },
    },
    cutout: '50%',
    animation: {
      animateRotate: true,
      animateScale: false,
    },
  };

  return (
    <div className="bg-white rounded-lg p-4 h-full border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          서비스별 현황
          {isFiltered && (
            <span className="text-sm text-blue-600 ml-2">(필터링됨)</span>
          )}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
          <div className="text-sm text-gray-500">총 프로젝트</div>
        </div>
      </div>
      
      <div className="h-64">
        {totalProjects > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectServiceDonutChart;