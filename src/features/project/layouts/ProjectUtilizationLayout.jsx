// src/features/project/layouts/ProjectUtilizationLayout.jsx

import React from 'react';
import WeeklyUtilizationDashboardSection from '../sections/WeeklyUtilizationDashboardSection';

/**
 * 프로젝트 투입률을 보여주는 레이아웃 컴포넌트
 * 주별 투입률 추이, 팀별 비교, 상세 데이터 테이블로 구성
 */
const ProjectUtilizationLayout = () => {
  return (
    <>
      {/* 주별 투입률 대시보드 섹션 */}
      <WeeklyUtilizationDashboardSection />
    </>
  );
};

export default ProjectUtilizationLayout;
