// src/features/project/layouts/ProjectListLayout.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import ProjectChartsSection from '../sections/ProjectChartsSection';
import ProjectListSection from '../sections/ProjectListSection';

/**
 * 프로젝트 목록/현황을 보여주는 레이아웃 컴포넌트
 * 상단에 차트 섹션과 하단에 테이블 섹션으로 구성
 *
 */
const ProjectListLayout = ({
  chartsData,
  items,
  pagination,
  loading,
  error,
  handlePageChange,
  handlePageSizeChange,
  loadProjectDetail,
  uiComponents,
}) => {
  const sections = useSelector((state) => state.ui.pageLayout.sections);

  return (
    <>
      {/* 차트 섹션 (상태, 진행률, 트리맵) */}
      {sections.projectCharts && (
        <ProjectChartsSection
          projectStatus={chartsData?.projectStatus}
          projectProgress={chartsData?.projectProgress}
        />
      )}

      {/* 테이블 섹션 */}
      <ProjectListSection
        items={items}
        pagination={pagination}
        loading={loading}
        error={error}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loadProjectDetail={loadProjectDetail}
      />
    </>
  );
};

export default ProjectListLayout;
