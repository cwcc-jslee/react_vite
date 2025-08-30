// src/features/project/components/charts/ProjectTypeDonutChart.jsx
// 프로젝트 타입별 도넛 차트 (매출, 투자)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';

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

  return (
    <BaseDonutChart
      title="프로젝트 타입"
      data={typeData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
    />
  );
};

export default ProjectTypeDonutChart;