// src/features/project/components/charts/ProjectScheduleDonutChart.jsx
// 프로젝트 일정 상태별 도넛 차트 (정상, 지연, 임박)

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
 * 프로젝트 일정 상태별 도넛 차트 컴포넌트  
 * 정상, 지연, 임박 상태의 프로젝트 수를 시각화
 */
const ProjectScheduleDonutChart = ({ scheduleStatus = {}, isFiltered = false }) => {
  // 일정 상태 데이터 추출
  const projectData = scheduleStatus.project || {};
  
  // 일정 상태별 데이터 및 색상 정의
  const scheduleData = [
    { 
      label: '정상', 
      value: projectData.normal || 0, 
      color: '#10B981', 
      bgColor: 'rgba(16, 185, 129, 0.8)' 
    },
    { 
      label: '임박', 
      value: projectData.imminent || 0, 
      color: '#F59E0B', 
      bgColor: 'rgba(245, 158, 11, 0.8)' 
    },
    { 
      label: '지연', 
      value: projectData.delayed || 0, 
      color: '#EF4444', 
      bgColor: 'rgba(239, 68, 68, 0.8)' 
    },
  ];

  // 총 개수 계산
  const totalProjects = scheduleData.reduce((sum, item) => sum + item.value, 0);

  // 차트 데이터 구성
  const chartData = {
    labels: scheduleData.map(item => item.label),
    datasets: [
      {
        data: scheduleData.map(item => item.value),
        backgroundColor: scheduleData.map(item => item.bgColor),
        borderColor: scheduleData.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: scheduleData.map(item => item.color),
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
          일정 상태
          {isFiltered && (
            <span className="text-sm text-blue-600 ml-2">(필터링됨)</span>
          )}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
          <div className="text-sm text-gray-500">진행중 프로젝트</div>
        </div>
      </div>
      
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProjectScheduleDonutChart;