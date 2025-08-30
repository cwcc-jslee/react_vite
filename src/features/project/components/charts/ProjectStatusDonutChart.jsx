// src/features/project/components/charts/ProjectStatusDonutChart.jsx
// 프로젝트 상태별 도넛 차트 (보류, 시작전, 대기, 진행중, 검수)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';

/**
 * 프로젝트 상태별 도넛 차트 컴포넌트
 * 보류, 시작전, 대기, 진행중, 검수 상태의 프로젝트 수를 시각화
 */
const ProjectStatusDonutChart = ({ projectStatus = {}, isFiltered = false }) => {
  // 상태별 데이터 및 색상 정의
  const statusData = [
    { 
      label: '진행중', 
      value: projectStatus.inProgress || 0, 
      color: '#10B981', 
      bgColor: 'rgba(16, 185, 129, 0.8)' 
    },
    { 
      label: '대기', 
      value: projectStatus.waiting || 0, 
      color: '#F59E0B', 
      bgColor: 'rgba(245, 158, 11, 0.8)' 
    },
    { 
      label: '검수', 
      value: projectStatus.review || 0, 
      color: '#8B5CF6', 
      bgColor: 'rgba(139, 92, 246, 0.8)' 
    },
    { 
      label: '보류', 
      value: projectStatus.pending || 0, 
      color: '#EF4444', 
      bgColor: 'rgba(239, 68, 68, 0.8)' 
    },
    { 
      label: '시작전', 
      value: projectStatus.notStarted || 0, 
      color: '#6B7280', 
      bgColor: 'rgba(107, 114, 128, 0.8)' 
    },
  ];

  return (
    <BaseDonutChart
      title="프로젝트 상태"
      data={statusData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
    />
  );
};

export default ProjectStatusDonutChart;