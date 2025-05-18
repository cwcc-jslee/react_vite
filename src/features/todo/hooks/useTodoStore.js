/**
 * @file useTodoStore.js
 * @description todo 관련 Redux 상태 관리 훅
 *
 * 주요 기능:
 * 1. Todo 데이터 조회
 * 2. Work 데이터 조회
 * 3. 폼 상태 관리
 * 4. 필터 상태 관리
 * 5. 로딩 상태 관리
 */

import { useSelector, useDispatch } from 'react-redux';
import {
  setPage,
  setPageSize,
  setWorkPage,
  setWorkPageSize,
  setFilters,
  setWorkFilters,
  resetFilters,
  resetWorkFilters,
  updateFormField,
  resetForm,
  initializeFormData,
  setFormErrors,
  setFormSubmitting,
  setFormIsValid,
  fetchTodos,
  fetchWorks,
} from '../../../store/slices/todoSlice';

/**
 * Todo 데이터 관리 훅
 * Todo 데이터, Work 데이터, 폼 상태, 필터 상태를 관리
 */
export const useTodoStore = () => {
  const dispatch = useDispatch();

  // Todo 데이터
  const items = useSelector((state) => state.todo.items);
  const status = useSelector((state) => state.todo.status);
  const error = useSelector((state) => state.todo.error);
  const pagination = useSelector((state) => state.todo.pagination);
  const filters = useSelector((state) => state.todo.filters);

  // Work 데이터
  const works = useSelector((state) => state.todo.work.items);
  const workStatus = useSelector((state) => state.todo.work.status);
  const workError = useSelector((state) => state.todo.work.error);
  const workPagination = useSelector((state) => state.todo.work.pagination);
  const workFilters = useSelector((state) => state.todo.work.filters);

  // 폼 상태
  const form = useSelector((state) => state.todo.form);

  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
        dispatch(
          fetchTodos({
            pagination: {
              ...pagination,
              current: page,
            },
          }),
        );
      },
      setPageSize: (size) => {
        dispatch(setPageSize(size));
        dispatch(
          fetchTodos({
            pagination: {
              ...pagination,
              pageSize: size,
              current: 1,
            },
          }),
        );
      },
    },

    // 페이지네이션 액션
    workPagination: {
      setPage: (page) => {
        dispatch(setWorkPage(page));
        dispatch(
          fetchWorks({
            pagination: {
              ...workPagination,
              current: page,
            },
          }),
        );
      },
      setPageSize: (size) => {
        dispatch(setWorkPageSize(size));
        dispatch(
          fetchWorks({
            pagination: {
              ...workPagination,
              pageSize: size,
              current: 1,
            },
          }),
        );
      },
    },

    // 필터 액션
    filter: {
      setFilters: (filterValues) => {
        dispatch(setFilters(filterValues));
        dispatch(fetchTodos({ filters: { ...filters, ...filterValues } }));
      },
      resetFilters: () => {
        dispatch(resetFilters());
        // dispatch(fetchTasks());
      },
    },

    // 필터 액션
    workFilter: {
      setFilters: (filterValues) => {
        dispatch(setWorkFilters(filterValues));
        dispatch(fetchWorks({ filters: { ...workFilters, ...filterValues } }));
      },
      resetFilters: () => {
        dispatch(resetWorkFilters());
        dispatch(fetchWorks());
      },
    },

    // Todo 데이터 조회
    getTodos: (params) => {
      dispatch(fetchTodos(params));
    },

    // Work 데이터 조회
    getWorks: (params) => {
      dispatch(fetchWorks(params));
    },

    // 폼 액션
    form: {
      updateField: (name, value) => dispatch(updateFormField({ name, value })),
      initializeForm: (formData) => {
        dispatch(resetForm());
        dispatch(initializeFormData(formData));
      },
      setErrors: (errors) => dispatch(setFormErrors(errors)),
      setSubmitting: (isSubmitting) =>
        dispatch(setFormSubmitting(isSubmitting)),
      setValid: (isValid) => dispatch(setFormIsValid(isValid)),
      resetForm: () => dispatch(resetForm()),
      getFormData: () => form.data,
      getFormErrors: () => form.errors,
      isSubmitting: () => form.isSubmitting,
      isValid: () => form.isValid,
    },
  };

  return {
    // Todo 데이터
    items,
    status,
    error,
    pagination,
    filters,

    // Work 데이터
    works,
    workStatus,
    workError,
    workPagination,
    workFilters,
    form,

    // 액션
    actions,

    // 로딩 상태
    isTodoLoading: status === 'loading',
    isWorkLoading: workStatus === 'loading',
    hasTodoError: status === 'failed',
    hasWorkError: workStatus === 'failed',
  };
};

export default useTodoStore;
