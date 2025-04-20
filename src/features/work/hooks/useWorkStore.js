// src/features/work/hooks/useWorkStore.js
/**
 * 프로젝트 페이지 상태 관리를 위한 커스텀 훅
 * pageState 슬라이스를 사용하여 프로젝트 관련 상태와 액션을 제공합니다.
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorks,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
} from '../../../store/slices/workSlice';

/**
 * 프로젝트 페이지 상태 관리 훅
 * 페이지 초기화, 목록 조회, 페이지네이션, 필터링, 상세 조회 등의 기능 제공
 */
export const useWorkStore = () => {
  const dispatch = useDispatch();
  const workState = useSelector((state) => state.work);
  const uiState = useSelector((state) => state.ui);
  const { items, pagination, filters, status, error } = workState;

  // 페이지 초기화 (컴포넌트 마운트 시 호출)
  useEffect(() => {
    // 3. 필터 설정
    const defaultFilters = {
      // pjt_status: { $in: [88, 89] }, // 진행중(88), 검수중(89)
    };

    // 4. 필터 적용 및 초기 프로젝트 목록 로드
    dispatch(setFilters(defaultFilters));
    dispatch(fetchWorks());

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 필요한 정리 작업 수행
      // dispatch(clearSelectedItem());
    };
  }, [dispatch]);

  // 프로젝트 목록 새로고침
  const refreshWorks = useCallback(
    (params = {}) => {
      dispatch(fetchWorks(params));
    },
    [dispatch],
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page) => {
      dispatch(setPage(page));
      dispatch(fetchWorks({ pagination: { current: page } }));
    },
    [dispatch],
  );

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback(
    (size) => {
      dispatch(setPageSize(size));
      dispatch(fetchWorks({ pagination: { current: 1, pageSize: size } }));
    },
    [dispatch],
  );

  // 필터 설정 핸들러
  const handleFilterChange = useCallback(
    (filterValues) => {
      dispatch(setFilters(filterValues));
      dispatch(fetchWorks({ filters: filterValues }));
    },
    [dispatch],
  );

  // 필터 초기화 핸들러
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchWorks({ filters: {} }));
  }, [dispatch]);

  return {
    // 스토어 상태
    items,
    pagination,
    filters,
    status,
    error,
    loading: status === 'loading',

    // 데이터 관련 액션 메서드
    refreshWorks,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleResetFilters,
  };
};

export default useWorkStore;
