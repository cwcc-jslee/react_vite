// src/features/project/layouts/ProjectListLayout.jsx

import React from 'react';
import ProjectSingleTaskListSection from '../sections/ProjectSingleTaskListSection';

/**
 * 프로젝트 목록/현황을 보여주는 레이아웃 컴포넌트
 * 상단에 차트 섹션과 하단에 테이블 섹션으로 구성
 *
 */
const ProjectSingleTaskLayout = () => {
  return (
    <>
      {/* 차트 섹션 (상태, 진행률, 트리맵) */}

      {/* 테이블 섹션 */}
      <ProjectSingleTaskListSection
      // handlePageChange={handlePageChange}
      // handlePageSizeChange={handlePageSizeChange}
      // loadProjectDetail={loadProjectDetail}
      />
    </>
  );
};

export default ProjectSingleTaskLayout;
