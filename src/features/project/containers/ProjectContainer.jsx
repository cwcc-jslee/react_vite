// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchProjects } from '../store/projectSlice';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import ProjectTable from '../components/tables/ProjectTable';
import ProjectAddContainer from './ProjectAddContainer';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const ProjectContainer = () => {
  // 레이아웃 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);

  console.log(`DrawerState : `, components);

  return (
    <>
      <Section>
        {components.projectTable && <ProjectTable />}
        {components.projectAddSection && <ProjectAddContainer />}
      </Section>
      {/* {drawerState.visible && <ProjectDrawer />} */}
    </>
  );
};

export default ProjectContainer;
