// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProject } from '../context/ProjectProvider';
import useProjectStore from '../hooks/useProjectStore';
import { Section } from '../../../shared/components/ui/layout/components';
import { Row, Col } from '../../../shared/components/ui';

// Layouts
import ProjectListLayout from '../layouts/ProjectListLayout';

// Components
import ProjectAddContainer from './ProjectAddContainer';
import ProjectDrawer from '../components/drawer/ProjectDrawer';
import ProjectDetailContainer from './ProjectDetailContainer';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const ProjectContainer = () => {
  // 프로젝트 페이지 상태 및 액션 훅
  const {
    items,
    pagination,
    filters,
    loading,
    error,
    handlePageChange,
    handlePageSizeChange,
    loadProjectDetail,
  } = useProjectStore();

  // 레이아웃 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);
  const drawer = useSelector((state) => state.ui.drawer);
  // status 상태 가져오기
  const { state } = useProject();
  const {
    projectStatus,
    projectProgress,
    monthlyStats,
    loading: stateLoading,
    error: stateError,
  } = state;

  // 차트 데이터 객체
  const chartsData = {
    projectStatus,
    projectProgress,
    monthlyStats,
  };

  return (
    <>
      <Section>
        {/* 프로젝트 목록/현황 레이아웃 */}
        <ProjectListLayout
          chartsData={chartsData}
          items={items}
          pagination={pagination}
          loading={loading}
          error={error}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          loadProjectDetail={loadProjectDetail}
          uiComponents={components}
        />
        {components.projectAddSection && <ProjectAddContainer />}
        {components.projectDetailSection && <ProjectDetailContainer />}
      </Section>
      {drawer.visible && <ProjectDrawer drawer={drawer} />}
    </>
  );
};

export default ProjectContainer;
