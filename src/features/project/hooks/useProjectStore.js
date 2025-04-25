// src/features/project/hooks/useProjectStore.js
/**
 * 프로젝트 페이지 상태 관리를 위한 커스텀 훅
 * pageState 슬라이스를 사용하여 프로젝트 관련 상태와 액션을 제공합니다.
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentPath,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  clearSelectedItem,
} from '../../../store/slices/pageStateSlice';
import {
  fetchProjects,
  fetchProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  PROJECT_PAGE_TYPE,
} from '../store/projectStoreActions';
import { PAGE_MENUS } from '@shared/constants/navigation';

/**
 * 프로젝트 페이지 상태 관리 훅
 * 페이지 초기화, 목록 조회, 페이지네이션, 필터링, 상세 조회 등의 기능 제공
 */
export const useProjectStore = () => {
  const dispatch = useDispatch();
  const pageState = useSelector((state) => state.pageState);
  const uiState = useSelector((state) => state.ui);
  const {
    items,
    pagination,
    filters,
    selectedItem,
    status,
    detailStatus,
    deleteStatus,
    error,
  } = pageState;

  // 현재 선택된 메뉴 ID
  const activeMenuId = uiState.pageLayout.menu;

  // 프로젝트 목록 새로고침
  const refreshProjects = useCallback(
    (params = {}) => {
      dispatch(fetchProjects(params));
    },
    [dispatch],
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page) => {
      dispatch(setPage(page));
      dispatch(fetchProjects({ pagination: { current: page } }));
    },
    [dispatch],
  );

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback(
    (size) => {
      dispatch(setPageSize(size));
      dispatch(fetchProjects({ pagination: { current: 1, pageSize: size } }));
    },
    [dispatch],
  );

  // 필터 설정 핸들러
  const handleFilterChange = useCallback(
    (filterValues) => {
      dispatch(setFilters(filterValues));
      dispatch(fetchProjects({ filters: filterValues }));
    },
    [dispatch],
  );

  // 필터 초기화 핸들러
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchProjects({ filters: {} }));
  }, [dispatch]);

  // 프로젝트 상세 조회
  const loadProjectDetail = useCallback(
    (projectId) => {
      console.log(`>>>> loadProjectdDetail : `, projectId);
      dispatch(fetchProjectDetail(projectId)).then(() => {
        // 상세 조회 성공 후 메뉴 변경
        const detailMenuConfig = PAGE_MENUS.project.items.detail.config;

        dispatch({
          type: 'ui/changePageMenu',
          payload: {
            menuId: 'detail',
            subMenu: { key: 'projectDetail', menu: 'table' },
            config: detailMenuConfig,
          },
        });
      });
    },
    [dispatch],
  );

  // 메뉴 변경 핸들러
  const changeMenu = useCallback(
    (menuId) => {
      if (!PAGE_MENUS.project.items[menuId]) {
        console.error(`Menu not found: ${menuId}`);
        return;
      }

      const menuConfig = PAGE_MENUS.project.items[menuId].config;

      dispatch({
        type: 'ui/changePageMenu',
        payload: {
          menuId,
          config: menuConfig,
        },
      });

      // 목록 메뉴로 돌아갈 때 목록 새로고침
      if (menuId === 'list') {
        refreshProjects();
      }
    },
    [dispatch, refreshProjects],
  );

  // 목록 화면으로 돌아가기
  const backToList = useCallback(() => {
    // 선택된 항목 초기화
    dispatch(clearSelectedItem());

    // 목록 메뉴로 변경
    changeMenu('list');
  }, [dispatch, changeMenu]);

  // 프로젝트 생성 화면으로 이동
  const goToAddProject = useCallback(() => {
    changeMenu('add');
  }, [changeMenu]);

  // 프로젝트 생성
  const handleCreateProject = useCallback(
    async (projectData) => {
      const resultAction = await dispatch(createProject(projectData));
      if (!resultAction.error) {
        // 생성 성공 시 목록 화면으로 이동
        backToList();
      }
      return !resultAction.error;
    },
    [dispatch, backToList],
  );

  // 프로젝트 수정
  const handleUpdateProject = useCallback(
    async (projectId, data) => {
      const resultAction = await dispatch(
        updateProject({ itemId: projectId, data }),
      );
      if (!resultAction.error) {
        // 수정 성공 시 목록 화면으로 이동
        backToList();
      }
      return !resultAction.error;
    },
    [dispatch, backToList],
  );

  // 프로젝트 삭제
  const handleDeleteProject = useCallback(
    async (projectId) => {
      const resultAction = await dispatch(deleteProject(projectId));
      if (!resultAction.error) {
        // 삭제 성공 시 목록 화면으로 이동
        backToList();
      }
      return !resultAction.error;
    },
    [dispatch, backToList],
  );

  // 현재 보여질 컴포넌트 상태
  const components = uiState.pageLayout.components || {};

  return {
    // 상태
    items,
    pagination,
    filters,
    selectedProject: selectedItem,
    loading: status === 'loading',
    detailLoading: detailStatus === 'loading',
    deleteLoading: deleteStatus === 'loading',
    error,
    activeMenuId,
    components,

    // 메뉴 관련 액션
    changeMenu,
    backToList,
    goToAddProject,

    // 데이터 관련 액션 메서드
    refreshProjects,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleResetFilters,
    loadProjectDetail,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
  };
};

export default useProjectStore;
