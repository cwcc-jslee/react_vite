// src/features/project/components/charts/ProjectTeamDonutChart.jsx
// 팀별 도넛 차트 (동적 팀 데이터 기준)

import React from 'react';
import BaseDonutChart from '../../../../shared/components/charts/BaseDonutChart';

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

  return (
    <BaseDonutChart
      title="팀별 현황"
      data={teamData}
      isFiltered={isFiltered}
      totalLabel="총 프로젝트"
      emptyMessage="데이터가 없습니다"
      cutoutPercentage="50%"
    />
  );
};

export default ProjectTeamDonutChart;