// src/features/project/components/charts/ProjectTypeDonutChart.jsx
// 프로젝트 타입별 도넛 차트 (매출, 투자)

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * 프로젝트 타입별 도넛 차트 컴포넌트
 * 매출, 투자 타입의 프로젝트 수를 시각화
 */
const ProjectTypeDonutChart = ({ projectType = {}, isFiltered = false }) => {
  console.log('=== ProjectTypeDonutChart 렌더링 ===');
  console.log('받은 projectType 데이터:', projectType);
  
  // 타입별 데이터 및 색상 정의
  const typeData = [
    { 
      label: '매출', 
      value: projectType.revenue || 0, 
      color: '#059669', 
      bgColor: 'rgba(5, 150, 105, 0.8)' 
    },
    { 
      label: '투자', 
      value: projectType.investment || 0, 
      color: '#DC2626', 
      bgColor: 'rgba(220, 38, 38, 0.8)' 
    },
  ];

  // 총 개수 계산
  const totalProjects = typeData.reduce((sum, item) => sum + item.value, 0);

  // 차트 데이터 구성
  const chartData = {
    labels: typeData.map(item => item.label),
    datasets: [
      {
        data: typeData.map(item => item.value),
        backgroundColor: typeData.map(item => item.bgColor),
        borderColor: typeData.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: typeData.map(item => item.color),
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
          프로젝트 타입
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
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProjectTypeDonutChart;