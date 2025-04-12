// src/features/project/containers/ProjectContainer.jsx

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useProject } from '../context/ProjectProvider';
import useProjectStore from '../hooks/useProjectStore';
import { Section } from '../../../shared/components/ui/layout/components';
import { projectTaskInitialState } from '../../../shared/constants/initialFormState';

// 커스텀 훅 사용
import { useCodebook } from '../../../shared/hooks/useCodebook';
import useProjectSubmit from '../hooks/useProjectSubmit';
import useProjectTask from '../hooks/useProjectTask';

// Redux 액션
import {
  updateFormField,
  resetForm,
} from '../../../store/slices/pageFormSlice';

// Layout
import ProjectListLayout from '../layouts/ProjectListLayout';
import ProjectAddLayout from '../layouts/ProjectAddLayout';
import ProjectDetailLayout from '../layouts/ProjectDetailLayout';

// Components
import ProjectDetailContainer from './ProjectDetailContainer';
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

  // API 데이터 상태 조회
  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'priority_level', // 우선순위(긴급,중요,중간,낮음)
    'task_progress', // 작업진행률
    'fy', // 회계년도
    'importance_level', //중요도
    'pjt_status', // 프로젝트 상태
  ]);

  // 칸반 보드 훅 사용
  const { buckets, loadTemplate, resetKanbanBoard } = useProjectTask(
    projectTaskInitialState,
  );

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
  const handleTemplateSelect = async (templateId) => {
    if (!templateId) return;

    try {
      await loadTemplate(templateId);
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  /**
   * 폼 제출 핸들러
   */
  const onFormSubmit = (e) => {
    handleFormSubmit(e, buckets);
  };

  /**
   * 폼 초기화 핸들러
   */
  const handleReset = () => {
    dispatch(resetForm());
    resetKanbanBoard();
    notification.info({
      message: '폼 초기화',
      description: '모든 입력 내용이 초기화되었습니다.',
    });
  };

  // 폼 섹션에 전달할 속성
  const formProps = {
    // codebooks,
    handleTemplateSelect,
    updateField,
    handleFormSubmit: onFormSubmit,
    handleReset,
    isSubmitting,
  };

  // 칸반보드 섹션에 전달할 속성
  // const kanbanProps = {
  //   codebooks,
  // };

  return (
    <>
      <Section>
        {/* 프로젝트 목록/현황 레이아웃 */}
        {components.projectTable && (
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
        )}

        {/* 프로젝트 추가 레이아웃 */}
        {components.projectAddSection && (
          <ProjectAddLayout formProps={formProps} codebooks={codebooks} />
        )}

        {/* 프로젝트 상세 섹션 */}
        {components.projectDetailSection && <ProjectDetailLayout />}
      </Section>

      {/* 프로젝트 드로어 */}
      {/* {drawer.visible && <ProjectDrawer drawer={drawer} />} */}
    </>
  );
};

export default ProjectContainer;
