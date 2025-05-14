// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Section } from '../../../shared/components/ui/layout/components';
import { PAGE_MENUS } from '@shared/constants/navigation';

// 커스텀 훅 사용
import { useProject } from '../context/ProjectProvider';
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
  const { layout, components } = useSelector((state) => state.ui.pageLayout);
  const drawer = useSelector((state) => state.ui.drawer);

  // 프로젝트 상태 데이터 가져오기
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

  // 컴포넌트 마운트 시 프로젝트 목록 조회
  useEffect(() => {
    actions.refreshList();

    // 컴포넌트 언마운트 시 정리
    return () => {
      // actions.filter.resetFilters();
    };
  }, []); // 빈 의존성 배열로 마운트 시 1회만 실행

  // 목록 레이아웃에 사용할 props
  const listLayoutProps = {
    components,
    chartsData,
  };

  return (
    <>
      <Section>
        {/* 레이아웃 타입에 따라 직접 조건부 렌더링 */}
        {layout === 'list' && <ProjectListLayout {...listLayoutProps} />}
        {layout === 'detail' && <ProjectDetailLayout />}
        {layout === 'search' && <ProjectSearchLayout {...listLayoutProps} />}
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
