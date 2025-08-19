// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect, useRef } from 'react';
import { Section } from '../../../shared/components/ui/layout/components';
import { useUiStore } from '@shared/hooks/useUiStore';
import { useProjectStore } from '../hooks/useProjectStore';

// Layout
import ProjectListLayout from '../layouts/ProjectListLayout';
import ProjectSearchLayout from '../layouts/ProjectSearchLayout';
import ProjectWorkLayout from '../layouts/ProjectWorkLayout';
import ProjectAddLayout from '../layouts/ProjectAddLayout';
import ProjectDetailLayout from '../layouts/ProjectDetailLayout';
import ProjectTaskLayout from '../layouts/ProjectTaskLayout';
// Components
import ProjectDrawer from '../components/drawer/ProjectDrawer';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 상태 관리 및 레이아웃 조합 역할 담당
 * 프로젝트 목록 및 추가 기능을 통합 관리
 *
 * @returns {JSX.Element} 프로젝트 메인 컨테이너
 */
const ProjectContainer = () => {
  // 프로젝트 스토어 훅 사용
  const { actions } = useProjectStore();

  // 레이아웃 관련 상태 가져오기
  const { pageLayout, drawer } = useUiStore();
  const { layout } = pageLayout;

  // 컴포넌트 마운트 시 프로젝트 목록 조회
  useEffect(() => {
    actions.getProjectList();
    // actions.getProjectsWithSchedule();
    actions.dashboard.fetchStatus(); // 상태와 진행률 데이터를 한 번에 가져옴
    actions.dashboard.fetchDashboardData();

    // 컴포넌트 언마운트 시 정리
    return () => {
      // actions.filter.resetFilters();
    };
  }, []); // 빈 의존성 배열로 마운트 시 1회만 실행

  return (
    <>
      <Section>
        {/* 레이아웃 타입에 따라 직접 조건부 렌더링 */}
        {layout === 'list' && <ProjectListLayout />}
        {layout === 'detail' && <ProjectDetailLayout />}
        {layout === 'search' && <ProjectSearchLayout />}
        {layout === 'work' && <ProjectWorkLayout />}
        {layout === 'task' && <ProjectTaskLayout />}
        {layout === 'add' && <ProjectAddLayout />}
      </Section>

      {/* 프로젝트 드로어 */}
      {drawer.visible && <ProjectDrawer drawer={drawer} />}
    </>
  );
};

export default ProjectContainer;
