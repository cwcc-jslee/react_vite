// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Section } from '../../../shared/components/ui/layout/components';
import {
  setCurrentPath,
  setFilters,
  clearSelectedItem,
} from '../../../store/slices/pageStateSlice';
import { fetchProjects, PROJECT_PAGE_TYPE } from '../store/projectStoreActions';
import { PAGE_MENUS } from '@shared/constants/navigation';

// 커스텀 훅 사용
import { useProject } from '../context/ProjectProvider';
import useProjectStore from '../hooks/useProjectStore';
import useProjectSubmit from '../hooks/useProjectSubmit';
import useProjectTask from '../hooks/useProjectTask';

// Redux 액션
import {
  updateFormField,
  resetForm,
} from '../../../store/slices/pageFormSlice';

// Layout
import ProjectListLayout from '../layouts/ProjectListLayout';
import ProjectSearchLayout from '../layouts/ProjectSearchLayout';
import ProjectWorkLayout from '../layouts/ProjectWorkLayout';
import ProjectAddLayout from '../layouts/ProjectAddLayout';
import ProjectDetailLayout from '../layouts/ProjectDetailLayout';

// Components
import ProjectDrawer from '../components/drawer/ProjectDrawer';

// 알림 서비스 추가
import { notification } from '../../../shared/services/notification';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 상태 관리 및 레이아웃 조합 역할 담당
 * 프로젝트 목록 및 추가 기능을 통합 관리
 *
 * @returns {JSX.Element} 프로젝트 메인 컨테이너
 */
const ProjectContainer = () => {
  const dispatch = useDispatch();
  // 이전 메뉴 상태를 추적하기 위한 ref
  const prevMenuRef = useRef(null);

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
  // Redux 상태에서 현재 레이아웃 설정 가져오기
  const { layout, sections, components } = useSelector(
    (state) => state.ui.pageLayout,
  );
  const drawer = useSelector((state) => state.ui.drawer);
  // 현재 선택된 메뉴 상태 가져오기
  const currentMenu = useSelector((state) => state.ui.pageLayout.menu);

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

  // 프로젝트 추가 관련 상태 및 훅
  // ==========================================
  const { handleFormSubmit, isSubmitting } = useProjectSubmit();

  // 칸반 보드 훅 사용
  const { buckets, loadTemplate, resetKanbanBoard } = useProjectTask();

  // 페이지 초기화 (컴포넌트 마운트 시 호출)
  useEffect(() => {
    // 1. 페이지 경로 설정
    dispatch(setCurrentPath(PROJECT_PAGE_TYPE));

    // 2. 페이지 레이아웃 및 메뉴 초기화
    const defaultMenuId = PAGE_MENUS.project.defaultMenu;
    const defaultMenuConfig = PAGE_MENUS.project.items[defaultMenuId].config;

    dispatch({
      type: 'ui/changePage',
      payload: {
        page: PROJECT_PAGE_TYPE,
        defaultMenu: defaultMenuId,
        defaultComponents: defaultMenuConfig.components,
      },
    });

    // 3. 필터 설정
    const defaultFilters = {
      pjt_status: { $in: [88, 89] }, // 진행중(88), 검수중(89)
      work_type: 'project', // 작업 유형이 'project'인 값
    };

    // 4. 필터 적용 및 초기 프로젝트 목록 로드
    dispatch(setFilters(defaultFilters));
    dispatch(fetchProjects());

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 필요한 정리 작업 수행
      dispatch(clearSelectedItem());
    };
  }, [dispatch]);

  // 메뉴 변경 시 필터 업데이트
  useEffect(() => {
    // 메뉴가 없거나 이전과 동일한 메뉴면 실행하지 않음
    if (!currentMenu || currentMenu === prevMenuRef.current) return;

    // 현재 메뉴에 따라 work_type 필터 설정
    let workTypeFilter = 'project'; // 기본값

    if (currentMenu === 'singletask') {
      workTypeFilter = 'single';
    }

    // 올바른 액션 사용
    dispatch(setFilters({ work_type: workTypeFilter }));

    // API 재요청
    dispatch(fetchProjects());

    // 현재 메뉴 저장
    prevMenuRef.current = currentMenu;
  }, [currentMenu, dispatch]);

  /**
   * 폼 필드 업데이트 이벤트 핸들러
   */
  const updateField = (nameOrEvent, valueOrNothing) => {
    // 이벤트 객체인 경우
    if (nameOrEvent && nameOrEvent.target) {
      const { name, value } = nameOrEvent.target;
      dispatch(updateFormField({ name, value }));
    }
    // name, value 형태로 직접 호출한 경우
    else {
      dispatch(updateFormField({ name: nameOrEvent, value: valueOrNothing }));
    }
  };

  /**
   * 템플릿 선택 핸들러
   */
  // const handleTemplateSelect = async (templateId) => {
  //   if (!templateId) return;

  //   try {
  //     await loadTemplate(templateId);
  //   } catch (error) {
  //     console.error('템플릿 로드 오류:', error);
  //   }
  // };

  /**
   * 폼 제출 핸들러
   */
  // const onFormSubmit = (e) => {
  //   handleFormSubmit(e, buckets);
  // };

  /**
   * 폼 초기화 핸들러
   */
  // const handleReset = () => {
  //   dispatch(resetForm());
  //   resetKanbanBoard();
  //   notification.info({
  //     message: '폼 초기화',
  //     description: '모든 입력 내용이 초기화되었습니다.',
  //   });
  // };

  // 폼 섹션에 전달할 속성
  // const formProps = {
  //   // 필요한 props만 남김
  // };

  // 공통 속성
  // const commonProps = {
  //   components,
  // };

  // 목록 레이아웃에 사용할 props
  const listLayoutProps = {
    components,
    chartsData,
    items,
    pagination,
    loading,
    error,
    handlePageChange,
    handlePageSizeChange,
    loadProjectDetail,
  };

  // 추가 레이아웃에 사용할 props
  // const addLayoutProps = {
  //   components,
  //   ...formProps,
  // };

  // 상세 레이아웃에 사용할 props
  const detailLayoutProps = {
    components,
    // 필요한 상세 props 추가
  };

  console.log(`Rendering ${layout} layout for Project page`);
  console.log(`*******chartdata ${layout} : `, chartsData);

  return (
    <>
      <Section>
        {/* 레이아웃 타입에 따라 직접 조건부 렌더링 */}
        {layout === 'list' && <ProjectListLayout {...listLayoutProps} />}
        {layout === 'search' && <ProjectSearchLayout {...listLayoutProps} />}
        {layout === 'work' && <ProjectWorkLayout />}
        {layout === 'add' && <ProjectAddLayout />}
        {layout === 'detail' && <ProjectDetailLayout {...detailLayoutProps} />}
      </Section>

      {/* 프로젝트 드로어 */}
      {drawer.visible && <ProjectDrawer drawer={drawer} />}
    </>
  );
};

export default ProjectContainer;
