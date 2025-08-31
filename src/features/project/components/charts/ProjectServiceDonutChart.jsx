// src/features/project/components/charts/ProjectServiceDonutChart.jsx
// 서비스별 도넛 차트 (동적 서비스 데이터 기준)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';
import { useProjectStore } from '../../hooks/useProjectStore';

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
  const { actions, dashboardData } = useProjectStore();

  // 서비스 데이터를 배열로 변환하고 정렬 (프로젝트 수 기준 내림차순)
  const serviceEntries = Object.entries(service).sort((a, b) => b[1] - a[1]);

  // 서비스별 데이터 및 색상 정의
  const serviceData = serviceEntries.map(([serviceName, count], index) => ({
    label: serviceName,
    value: count,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    bgColor: COLOR_PALETTE[index % COLOR_PALETTE.length] + '80', // 투명도 추가
  }));

  // 활성 세그먼트 결정
  const getActiveSegment = () => {
    const selectedService = dashboardData.activeFilters?.selectedService;
    return selectedService || null;
  };

  // 세그먼트 클릭 핸들러
  const handleSegmentClick = (label) => {
    console.log('ProjectServiceDonutChart - 세그먼트 클릭:', label);
    
    // 서비스 이름을 그대로 필터 값으로 사용
    actions.chartFilters.setFilter('selectedService', label);
  };

  return (
    <BaseDonutChart
      title="서비스별 현황"
      data={serviceData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
      onSegmentClick={handleSegmentClick}
      activeSegment={getActiveSegment()}
    />
  );
};

export default ProjectServiceDonutChart;