// src/features/project/components/charts/ProjectStatusDonutChart.jsx
// 프로젝트 상태별 도넛 차트 (보류/대기, 시작전, 진행중, 중간검수, 고객검수, 종료)

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
 * 보류/대기, 시작전, 진행중, 중간검수, 고객검수, 종료 상태의 프로젝트 수를 시각화
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
      label: '중간검수',
      value: projectStatus.interimReview || 0,
      ...PROJECT_STATUS_COLORS.interimReview
    },
    {
      label: '고객검수',
      value: projectStatus.finalReview || 0,
      ...PROJECT_STATUS_COLORS.finalReview
    },
    {
      label: '보류/대기',
      value: projectStatus.pendingWaiting || 0,
      ...PROJECT_STATUS_COLORS.pendingWaiting
    },
    {
      label: '시작전',
      value: projectStatus.notStarted || 0,
      ...PROJECT_STATUS_COLORS.notStarted
    },
    {
      label: '종료',
      value: projectStatus.closed || 0,
      ...PROJECT_STATUS_COLORS.closed
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