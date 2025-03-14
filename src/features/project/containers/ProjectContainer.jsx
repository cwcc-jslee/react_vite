// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect } from 'react';
import { useProject } from '../context/ProjectProvider';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import ProjectMenu from '../components/ProjectMenu';
import ProjectTable from '../components/tables/ProjectTable';
import ProjectAddSection from '../components/compose/ProjectAddSection';
// import ProjectDrawer from '../components/drawer/ProjectDrawer';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const ProjectContainer = () => {
  // 레이아웃 관련 상태 가져오기
  const { pageLayout, drawerState } = useProject();
  const { components } = pageLayout;

  console.log(`DrawerState : `, drawerState);

  return (
    <>
      <Section>
        <ProjectMenu />
        <br></br>
        {components.projectTable && <ProjectTable />}
        {components.projectAddSection && <ProjectAddSection />}
      </Section>
      {/* {drawerState.visible && <ProjectDrawer />} */}
    </>
  );
};

export default ProjectContainer;
