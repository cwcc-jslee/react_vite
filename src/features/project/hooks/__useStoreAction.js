import { useDispatch } from 'react-redux';
import {
  setPage,
  setPageSize,
  fetchProjects,
  fetchProjectDetail,
  setFilters,
  resetFilters,
} from '../../../store/slices/projectSlice';

/**
 * 프로젝트 관련 Redux 액션들을 관리하는 Custom Hook
 * @returns {Object} 프로젝트 관련 액션 함수들
 */
export const useStoreAction = () => {
  const dispatch = useDispatch();

  // 페이지네이션 관련 액션
  const handlePageChange = (page) => {
    dispatch(setPage(page));
    dispatch(fetchProjects());
  };

  const handlePageSizeChange = (pageSize) => {
    dispatch(setPageSize(pageSize));
    dispatch(fetchProjects());
  };

  // 필터 관련 액션
  const handleFilterChange = (filters) => {
    dispatch(setFilters(filters));
    dispatch(fetchProjects());
  };

  const handleFilterReset = () => {
    dispatch(resetFilters());
    dispatch(fetchProjects());
  };

  // 프로젝트 상세 정보 관련 액션
  const handleProjectDetail = (projectId) => {
    dispatch(fetchProjectDetail(projectId));
  };

  // 프로젝트 목록 새로고침
  const refreshProjectList = () => {
    dispatch(fetchProjects());
  };

  return {
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleFilterReset,
    handleProjectDetail,
    refreshProjectList,
  };
};
