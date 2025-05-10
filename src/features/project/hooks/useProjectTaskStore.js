/**
 * @file useProjectTaskStore.js
 * @description 프로젝트 작업 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. 작업 목록 조회 및 페이지네이션
 * 2. 작업 필터링
 *
 * @author [작성자명]
 * @since [버전]
 */

import { useSelector, useDispatch } from 'react-redux';
import {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  fetchTasks,
} from '../../../store/slices/taskSlice';

/**
 * 프로젝트 작업 관련 상태와 액션을 관리하는 커스텀 훅
 * 작업 목록, 필터링 등을 통합 관리
 */
export const useProjectTaskStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.task.items);
  const pagination = useSelector((state) => state.task.pagination);
  const filters = useSelector((state) => state.task.filters);
  const status = useSelector((state) => state.task.status);
  const error = useSelector((state) => state.task.error);

  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
        dispatch(fetchTasks({ pagination: { current: page } }));
      },
      setPageSize: (size) => {
        dispatch(setPageSize(size));
        dispatch(fetchTasks({ pagination: { current: 1, pageSize: size } }));
      },
    },

    // 필터 액션
    filter: {
      setFilters: (filterValues) => {
        dispatch(setFilters(filterValues));
        dispatch(fetchTasks({ filters: filterValues }));
      },
      resetFilters: () => {
        dispatch(resetFilters());
        dispatch(fetchTasks());
      },
      // 초기 필터 설정
      initializeFilters: (initialFilters) => {
        dispatch(setFilters(initialFilters));
        dispatch(fetchTasks({ filters: initialFilters }));
      },
    },

    // 작업 목록 조회
    fetchTasks: (params) => {
      dispatch(fetchTasks(params));
    },

    // 작업 목록 새로고침
    refreshList: () => dispatch(fetchTasks()),
  };

  return {
    // 상태
    items,
    pagination,
    filters,
    status,
    error,

    // 액션
    actions,
  };
};

export default useProjectTaskStore;
