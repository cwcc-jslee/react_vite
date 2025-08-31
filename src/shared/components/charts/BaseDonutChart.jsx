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
 * @param {Function} onSegmentClick - 세그먼트 클릭 핸들러 (label, value) => void
 * @param {string} activeSegment - 활성화된 세그먼트 라벨
 */
const BaseDonutChart = ({
  title,
  data = [],
  isFiltered = false,
  totalLabel = "총 프로젝트",
  emptyMessage = "데이터가 없습니다",
  cutoutPercentage = "50%",
  onSegmentClick = null,
  activeSegment = null,
}) => {
  // 총 개수 계산
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);

  // 활성화된 세그먼트 인덱스 찾기
  const getActiveIndex = () => {
    if (!activeSegment) return null;
    return data.findIndex(item => item.label === activeSegment);
  };

  const activeIndex = getActiveIndex();

  // Chart.js 데이터 구성
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => {
          if (activeIndex === null) return item.bgColor; // 선택 없음
          if (activeIndex === index) return item.color; // 선택된 세그먼트: 진한 색상
          return item.bgColor.replace('0.8', '0.3'); // 비선택 세그먼트: 더 흐리게
        }),
        borderColor: data.map((item, index) => 
          activeIndex === index ? item.color : item.color
        ),
        borderWidth: data.map((_, index) => 
          activeIndex === index ? 4 : 1
        ),
        hoverBackgroundColor: data.map(item => item.color),
        hoverBorderWidth: 3,
        // Chart.js에서 개별 세그먼트 크기 조절은 제한적이므로 색상과 테두리로 강조
      },
    ],
  };

  // 차트 클릭 핸들러
  const handleChartClick = (event, elements) => {
    if (!onSegmentClick || elements.length === 0) return;
    
    const clickedIndex = elements[0].index;
    const clickedData = data[clickedIndex];
    if (clickedData) {
      onSegmentClick(clickedData.label, clickedData.value);
    }
  };

  // 차트 옵션 (범례 비활성화)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
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
    elements: {
      arc: {
        // 선택된 세그먼트와 비선택 세그먼트 간 시각적 차이 강화
        borderWidth: (context) => {
          const index = context.dataIndex;
          return activeIndex === index ? 4 : 1;
        },
        hoverBorderWidth: 6,
        // 애니메이션으로 선택 효과 강화
        borderAlign: 'center',
      },
    },
    cutout: cutoutPercentage,
    animation: {
      animateRotate: true,
      animateScale: false,
      // 선택 시 부드러운 애니메이션 추가
      duration: activeIndex !== null ? 300 : 1000,
    },
  };

  // 커스텀 범례 렌더링
  const renderCustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-3">
      {data.map((item, index) => {
        const isSelected = activeIndex === index;
        const isAnySelected = activeIndex !== null;
        
        return (
          <div 
            key={index} 
            className={`flex items-center text-sm transition-all duration-300 ${
              isAnySelected && !isSelected ? 'opacity-50' : 'opacity-100'
            }`}
            style={{
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span
              className={`inline-block rounded-full mr-2 transition-all duration-300 ${
                isSelected ? 'w-4 h-4' : 'w-3 h-3'
              }`}
              style={{ 
                backgroundColor: isSelected || !isAnySelected ? item.color : item.bgColor,
                boxShadow: isSelected ? `0 0 8px ${item.color}40` : 'none'
              }}
            />
            <span className={`transition-all duration-300 ${
              isSelected ? 'text-gray-900 font-bold' : 'text-gray-700'
            }`}>
              {item.label}: <span className={isSelected ? 'font-bold' : 'font-semibold'}>{item.value}개</span>
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-4 h-full border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-sm text-gray-500">{totalLabel}</div>
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="h-48 relative">
        {totalCount > 0 ? (
          <>
            <Doughnut data={chartData} options={options} />
            {/* 도넛 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center transition-all duration-300">
                {activeIndex !== null && data[activeIndex] ? (
                  // 선택된 세그먼트 정보 표시
                  <>
                    <div 
                      className="text-sm font-semibold transition-colors duration-300"
                      style={{ color: data[activeIndex].color }}
                    >
                      {data[activeIndex].label}
                    </div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {data[activeIndex].value}개
                    </div>
                  </>
                ) : (
                  // 전체 정보 표시
                  <>
                    <div className="text-sm font-semibold text-gray-600">
                      전체
                    </div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {totalCount}개
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
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