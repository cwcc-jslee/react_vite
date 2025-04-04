// src/features/project/hooks/useProjectPage.js
/**
 * 프로젝트 페이지 상태 관리를 위한 커스텀 훅
 * pageState 슬라이스를 사용하여 프로젝트 페이지 상태를 관리합니다.
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
} from '../store/projectPageActions';

/**
 * 프로젝트 페이지 상태 관리 훅
 * 페이지 초기화, 목록 조회, 페이지네이션, 필터링 등의 기능 제공
 */
export const useProjectPage = () => {
  const dispatch = useDispatch();
  const pageState = useSelector((state) => state.pageState);
  const {
    items,
    pagination,
    filters,
    selectedItem,
    status,
    detailStatus,
    deleteStatus,
    error,
    // form,
  } = pageState;

  // 페이지 초기화 (컴포넌트 마운트 시 호출)
  useEffect(() => {
    dispatch(setCurrentPath(PROJECT_PAGE_TYPE));
    // 초기 프로젝트 목록 로드
    dispatch(fetchProjects());

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 필요한 정리 작업 수행
    };
  }, [dispatch]);

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
    (current, size) => {
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
      dispatch(fetchProjectDetail(projectId));
    },
    [dispatch],
  );

  // 프로젝트 생성
  const handleCreateProject = useCallback(
    async (projectData) => {
      const resultAction = await dispatch(createProject(projectData));
      return !resultAction.error;
    },
    [dispatch],
  );

  // 프로젝트 수정
  const handleUpdateProject = useCallback(
    async (projectId, data) => {
      const resultAction = await dispatch(
        updateProject({ itemId: projectId, data }),
      );
      return !resultAction.error;
    },
    [dispatch],
  );

  // 프로젝트 삭제
  const handleDeleteProject = useCallback(
    async (projectId) => {
      const resultAction = await dispatch(deleteProject(projectId));
      return !resultAction.error;
    },
    [dispatch],
  );

  // 선택된 프로젝트 초기화
  const clearSelectedProject = useCallback(() => {
    dispatch(clearSelectedItem());
  }, [dispatch]);

  return {
    // 상태
    // projects: items,
    items,
    pagination,
    filters,
    selectedProject: selectedItem,
    loading: status === 'loading',
    detailLoading: detailStatus === 'loading',
    deleteLoading: deleteStatus === 'loading',
    error,

    // 액션 메서드
    refreshProjects,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleResetFilters,
    loadProjectDetail,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    clearSelectedProject,
  };
};

export default useProjectPage;
