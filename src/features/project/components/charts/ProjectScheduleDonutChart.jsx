// src/features/project/components/charts/ProjectScheduleDonutChart.jsx
// 프로젝트 일정 상태별 도넛 차트 (정상, 지연, 임박)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';

/**
 * 프로젝트 일정 상태별 도넛 차트 컴포넌트  
 * 정상, 지연, 임박 상태의 프로젝트 수를 시각화
 */
const ProjectScheduleDonutChart = ({ scheduleStatus = {}, isFiltered = false }) => {
  // 일정 상태 데이터 추출
  const projectData = scheduleStatus.projectScheduleStatus || scheduleStatus.project || {};
  
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

  return (
    <BaseDonutChart
      title="일정 상태"
      data={scheduleData}
      isFiltered={isFiltered}
      totalLabel="진행중 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
    />
  );
};

export default ProjectScheduleDonutChart;