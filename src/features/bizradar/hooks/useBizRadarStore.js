/**
 * BizRadar Redux Store Hook
 * Redux 상태와 액션을 통합 관리
 */
import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchBizradarList,
  fetchBizradarDetail,
  updateBizradarItem,
  confirmBizradarItem,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  updateFormField,
  setFormData,
  resetForm,
  clearSelectedItem,
  clearError,
} from '@/store/slices/bizradarSlice';

export const useBizRadarStore = () => {
  const dispatch = useDispatch();

  // Redux 상태 선택
  const items = useSelector((state) => state.bizradar.items);
  const status = useSelector((state) => state.bizradar.status);
  const error = useSelector((state) => state.bizradar.error);
  const selectedItem = useSelector((state) => state.bizradar.selectedItem);
  const pagination = useSelector((state) => state.bizradar.pagination);
  const filters = useSelector((state) => state.bizradar.filters);
  const form = useSelector((state) => state.bizradar.form);

  // 메모이즈된 액션
  const actions = useMemo(
    () => ({
      // 데이터 조회 액션
      data: {
        fetchList: (params) => dispatch(fetchBizradarList(params)),
        fetchDetail: (id) => dispatch(fetchBizradarDetail(id)),
        update: (id, data) => dispatch(updateBizradarItem({ id, data })),
        confirm: (id, data) => dispatch(confirmBizradarItem({ id, data })),
        clearSelected: () => dispatch(clearSelectedItem()),
        clearError: () => dispatch(clearError()),
      },

      // 페이지네이션 액션
      pagination: {
        setPage: (page) => dispatch(setPage(page)),
        setPageSize: (size) => dispatch(setPageSize(size)),
      },

      // 필터 액션
      filter: {
        setFilters: (filterData) => dispatch(setFilters(filterData)),
        resetFilters: () => dispatch(resetFilters()),
        updateField: (name, value) => dispatch(setFilters({ [name]: value })),
      },

      // 폼 액션
      form: {
        updateField: (name, value) => dispatch(updateFormField({ name, value })),
        setData: (data) => dispatch(setFormData(data)),
        reset: () => dispatch(resetForm()),
      },
    }),
    [dispatch]
  );

  // 편의 함수
  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isEmpty = items.length === 0 && status === 'succeeded';

  // 목록 새로고침
  const refresh = useCallback(() => {
    dispatch(fetchBizradarList());
  }, [dispatch]);

  // 페이지 변경 후 목록 조회
  const changePage = useCallback(
    (page) => {
      dispatch(setPage(page));
      dispatch(fetchBizradarList());
    },
    [dispatch]
  );

  // 페이지 크기 변경 후 목록 조회
  const changePageSize = useCallback(
    (size) => {
      dispatch(setPageSize(size));
      dispatch(fetchBizradarList());
    },
    [dispatch]
  );

  // 필터 적용 후 목록 조회
  const applyFilters = useCallback(
    (filterData) => {
      dispatch(setFilters(filterData));
      dispatch(fetchBizradarList());
    },
    [dispatch]
  );

  // 필터 초기화 후 목록 조회
  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchBizradarList());
  }, [dispatch]);

  return {
    // 상태
    items,
    status,
    error,
    selectedItem,
    pagination,
    filters,
    form,

    // 계산된 상태
    isLoading,
    isError,
    isEmpty,

    // 액션
    actions,

    // 편의 함수
    refresh,
    changePage,
    changePageSize,
    applyFilters,
    clearFilters,
  };
};

export default useBizRadarStore;
