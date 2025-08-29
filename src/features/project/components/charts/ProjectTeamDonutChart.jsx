// src/features/project/components/charts/ProjectTeamDonutChart.jsx
// 팀별 도넛 차트 (동적 팀 데이터 기준)

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// 동적 색상 생성을 위한 색상 팔레트
const COLOR_PALETTE = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
];

/**
 * 팀별 도넛 차트 컴포넌트
 * 동적 팀 데이터를 기반으로 프로젝트 수를 시각화
 */
const ProjectTeamDonutChart = ({ team = {}, isFiltered = false }) => {
  // 팀 데이터를 배열로 변환하고 정렬 (프로젝트 수 기준 내림차순)
  const teamEntries = Object.entries(team).sort((a, b) => b[1] - a[1]);

  // 팀별 데이터 및 색상 정의
  const teamData = teamEntries.map(([teamName, count], index) => ({
    label: teamName,
    value: count,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    bgColor: COLOR_PALETTE[index % COLOR_PALETTE.length] + '80', // 투명도 추가
  }));

  // 총 개수 계산
  const totalProjects = teamData.reduce((sum, item) => sum + item.value, 0);

  // 차트 데이터 구성
  const chartData = {
    labels: teamData.map(item => item.label),
    datasets: [
      {
        data: teamData.map(item => item.value),
        backgroundColor: teamData.map(item => item.bgColor),
        borderColor: teamData.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: teamData.map(item => item.color),
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
          팀별 현황
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

export default ProjectTeamDonutChart;