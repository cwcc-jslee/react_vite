// src/shared/components/charts/BaseDonutChart.jsx
// 공통 도넛 차트 컴포넌트

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
 * 공통 도넛 차트 컴포넌트
 * @param {string} title - 차트 제목
 * @param {Array} data - 차트 데이터 배열 [{label, value, color, bgColor}, ...]
 * @param {boolean} isFiltered - 필터링 상태 표시 여부
 * @param {string} totalLabel - 총합 표시 텍스트 (기본: "총 프로젝트")
 * @param {string} emptyMessage - 데이터 없을 때 메시지 (기본: "데이터가 없습니다")
 * @param {string} cutoutPercentage - 도넛 중심 구멍 크기 (기본: "50%")
 */
const BaseDonutChart = ({
  title,
  data = [],
  isFiltered = false,
  totalLabel = "총 프로젝트",
  emptyMessage = "데이터가 없습니다",
  cutoutPercentage = "50%",
}) => {
  // 총 개수 계산
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  // Chart.js 데이터 구성
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.bgColor),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: data.map(item => item.color),
        hoverBorderWidth: 3,
      },
    ],
  };

  // 차트 옵션 (범례 비활성화)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 기본 범례 비활성화
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0;
            return `${context.label}: ${value}개 (${percentage}%)`;
          },
        },
      },
    },
    cutout: cutoutPercentage,
    animation: {
      animateRotate: true,
      animateScale: false,
    },
  };

  // 커스텀 범례 렌더링
  const renderCustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center text-sm">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-700">
            {item.label}: <span className="font-semibold">{item.value}개</span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-4 h-full border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
          {isFiltered && (
            <span className="text-sm text-blue-600 ml-2">(필터링됨)</span>
          )}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-sm text-gray-500">{totalLabel}</div>
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="h-48">
        {totalCount > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
      
      {/* 분리된 커스텀 범례 영역 */}
      {totalCount > 0 && renderCustomLegend()}
    </div>
  );
};

export default BaseDonutChart;