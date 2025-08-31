// src/features/project/components/charts/ProjectTypeDonutChart.jsx
// 프로젝트 타입별 도넛 차트 (매출, 투자)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';
import { useProjectStore } from '../../hooks/useProjectStore';

/**
 * 프로젝트 타입별 도넛 차트 컴포넌트
 * 매출, 투자 타입의 프로젝트 수를 시각화
 */
const ProjectTypeDonutChart = ({ projectType = {}, isFiltered = false }) => {
  const { actions, dashboardData } = useProjectStore();
  
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

  // 활성 세그먼트 결정
  const getActiveSegment = () => {
    const selectedType = dashboardData.activeFilters?.selectedProjectType;
    if (selectedType === 'revenue') return '매출';
    if (selectedType === 'investment') return '투자';
    return null;
  };

  // 세그먼트 클릭 핸들러
  const handleSegmentClick = (label) => {
    console.log('ProjectTypeDonutChart - 세그먼트 클릭:', label);
    
    // 차트 필터 토글 (현재 선택된 값과 같으면 null로 초기화, 다르면 새 값으로 설정)
    const filterValue = label === '매출' ? 'revenue' : 'investment';
    actions.chartFilters.setFilter('selectedProjectType', filterValue);
  };

  return (
    <BaseDonutChart
      title="프로젝트 타입"
      data={typeData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
      onSegmentClick={handleSegmentClick}
      activeSegment={getActiveSegment()}
    />
  );
};

export default ProjectTypeDonutChart;