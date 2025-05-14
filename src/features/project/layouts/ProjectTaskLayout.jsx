// src/features/project/layouts/ProjectListLayout.jsx

import React from 'react';
import ProjectTaskListSection from '../sections/ProjectTaskListSection';

/**
 * 프로젝트 목록/현황을 보여주는 레이아웃 컴포넌트
 * 상단에 차트 섹션과 하단에 테이블 섹션으로 구성
 *
 */
const ProjectTaskLayout = () => {
  return (
    <>
      {/* 테이블 섹션 */}
      <ProjectTaskListSection />
    </>
  );
};

export default ProjectTaskLayout;
