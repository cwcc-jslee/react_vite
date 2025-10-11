// src/features/project/layouts/ProjectUtilizationLayout.jsx

import React from 'react';
import UtilizationDashboardSection from '../sections/UtilizationDashboardSection';

/**
 * 프로젝트 투입률을 보여주는 레이아웃 컴포넌트
 * 전체, 팀별, 사용자별 투입률 차트로 구성
 */
const ProjectUtilizationLayout = () => {
  return (
    <>
      {/* 투입률 대시보드 섹션 */}
      <UtilizationDashboardSection />
    </>
  );
};

export default ProjectUtilizationLayout;
