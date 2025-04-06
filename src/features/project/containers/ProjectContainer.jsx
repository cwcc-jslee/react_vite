// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useProjectPage from '../hooks/useProjectPage';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import ProjectTable from '../components/tables/ProjectTable';
import ProjectAddContainer from './ProjectAddContainer';

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
  } = useProjectPage();

  // 레이아웃 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);

  return (
    <>
      <Section>
        {components.projectTable && (
          <ProjectTable
            items={items}
            pagination={pagination}
            loading={loading}
            error={error}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
          />
        )}
        {components.projectAddSection && <ProjectAddContainer />}
      </Section>
      {/* {drawerState.visible && <ProjectDrawer />} */}
    </>
  );
};

export default ProjectContainer;
