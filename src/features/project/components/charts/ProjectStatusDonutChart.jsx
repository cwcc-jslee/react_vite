// src/features/project/components/charts/ProjectStatusDonutChart.jsx
// 프로젝트 상태별 도넛 차트 (보류, 시작전, 대기, 진행중, 검수)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';
import { useProjectStore } from '../../hooks/useProjectStore';
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABEL_TO_KEY,
  PROJECT_STATUS_KEY_TO_LABEL,
} from '../../constants/projectStatusConstants';

/**
 * 프로젝트 상태별 도넛 차트 컴포넌트
 * 보류, 시작전, 대기, 진행중, 검수 상태의 프로젝트 수를 시각화
 */
const ProjectStatusDonutChart = ({ projectStatus = {}, isFiltered = false }) => {
  const { actions, dashboardData } = useProjectStore();

  // 상태별 데이터 및 색상 정의 (상수 사용)
  const statusData = [
    {
      label: '진행중',
      value: projectStatus.inProgress || 0,
      ...PROJECT_STATUS_COLORS.inProgress
    },
    {
      label: '대기',
      value: projectStatus.waiting || 0,
      ...PROJECT_STATUS_COLORS.waiting
    },
    {
      label: '검수',
      value: projectStatus.review || 0,
      ...PROJECT_STATUS_COLORS.review
    },
    {
      label: '보류',
      value: projectStatus.pending || 0,
      ...PROJECT_STATUS_COLORS.pending
    },
    {
      label: '시작전',
      value: projectStatus.notStarted || 0,
      ...PROJECT_STATUS_COLORS.notStarted
    },
  ];

  // 활성 세그먼트 결정 (상수 사용)
  const getActiveSegment = () => {
    const selectedStatus = dashboardData.activeFilters?.selectedStatus;
    return selectedStatus ? PROJECT_STATUS_KEY_TO_LABEL[selectedStatus] : null;
  };

  // 세그먼트 클릭 핸들러 (상수 사용)
  const handleSegmentClick = (label) => {
    console.log('ProjectStatusDonutChart - 세그먼트 클릭:', label);

    const filterValue = PROJECT_STATUS_LABEL_TO_KEY[label];
    if (filterValue) {
      actions.chartFilters.setFilter('selectedStatus', filterValue);
    }
  };

  return (
    <BaseDonutChart
      title="프로젝트 상태"
      data={statusData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
      onSegmentClick={handleSegmentClick}
      activeSegment={getActiveSegment()}
    />
  );
};

export default ProjectStatusDonutChart;