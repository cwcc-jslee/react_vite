// src/features/work/hooks/useWorkStore.js
/**
 * 작업(Work) 관련 Redux 상태 관리를 위한 커스텀 훅
 *
 * 주요 기능:
 * 1. 작업 데이터 CRUD 작업
 * 2. Redux 상태 관리
 * 3. 작업 목록 조회 및 필터링
 * 4. 작업 상세 정보 관리
 *
 * 사용 예시:
 * const { works, loading, error, fetchWorks, createWork } = useWorkStore();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorks,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  updateFormField,
  setFormErrors,
  resetForm,
  initializeFormData,
} from '../../../store/slices/workSlice';

/**
 * 작업 관련 상태와 액션을 관리하는 커스텀 훅
 * 작업 목록, 상세 정보, 폼 상태 등을 통합 관리
 */
export const useWorkStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.work.items);
  const pagination = useSelector((state) => state.work.pagination);
  const filters = useSelector((state) => state.work.filters);
  const status = useSelector((state) => state.work.status);
  const error = useSelector((state) => state.work.error);
  const form = useSelector((state) => state.work.form);

  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
        dispatch(fetchWorks({ pagination: { current: page } }));
      },
      setPageSize: (size) => {
        dispatch(setPageSize(size));
        dispatch(fetchWorks({ pagination: { current: 1, pageSize: size } }));
      },
    },

    // 필터 액션
    filter: {
      getFilters: () => filters,
      setFilters: (filterValues) => {
        dispatch(setFilters(filterValues));
        dispatch(fetchWorks({ filters: filterValues }));
      },
      resetFilters: () => {
        dispatch(resetFilters());
        // dispatch(fetchWorks({ filters: {} }));
      },
    },

    // 폼 액션
    form: {
      updateField: (name, value) => dispatch(updateFormField({ name, value })),
      resetForm: () => dispatch(resetForm()),
      setErrors: (errors) => dispatch(setFormErrors(errors)),
      initializeForm: (formData) => {
        dispatch(resetForm());
        dispatch(initializeFormData(formData));
      },
      // 폼 제출 후 처리
      // afterSubmit: () => {
      //   dispatch(resetForm());
      //   dispatch(fetchWorks());
      // },
    },

    // 작업 목록 새로고침
    refreshList: () => dispatch(fetchWorks()),
  };

  return {
    // 상태
    items,
    pagination,
    filters,
    status,
    error,
    form,

    // 액션
    actions,
  };
};

export default useWorkStore;
