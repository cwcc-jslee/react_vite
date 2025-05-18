/**
 * Todo 페이지 데이터 관리
 * - Task 데이터 조회, Work 데이터 조회, 폼 상태 관리
 * - 페이지 설정, 필터 설정, 폼 데이터 업데이트
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { todoApiService } from '../../features/todo/services/todoApiService';
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  FORM_INITIAL_STATE,
} from '../../features/todo/constants/initialState';

// Todo 데이터 조회 - 스토어 내 필터만 사용하도록 수정
export const fetchTodos = createAsyncThunk(
  'todo/fetchTodos',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Todo 슬라이스의 상태 참조
      const { pagination: storePagination, filters: storeFilters } = state.todo;

      // 페이지네이션만 파라미터 우선, 필터는 항상 스토어 사용
      const pagination =
        params.pagination || storePagination || DEFAULT_PAGINATION;

      // 항상 스토어의 필터 사용 (params.filters는 무시)
      const filters = storeFilters || DEFAULT_FILTERS;

      // API 호출 코드 (todoApiService 사용)
      const response = await todoApiService.getTodoList({
        pagination,
        filters,
        ...params.additionalParams, // additionalParams는 유지 (정렬 등의 파라미터)
      });

      // 응답 데이터의 키를 카멜케이스로 변환하여 반환
      return {
        data: convertKeysToCamelCase(response.data),
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          'Todo 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// Todo Work 데이터 조회
export const fetchWorks = createAsyncThunk(
  'todo/fetchWorks',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // 워크슬라이스의 상태 참조
      const { pagination: storePagination, filters: storeFilters } =
        state.todo.work;

      // 페이지네이션만 파라미터 우선, 필터는 항상 스토어 사용
      const pagination =
        params.pagination || storePagination || DEFAULT_PAGINATION;

      // 항상 스토어의 필터 사용
      const filters = storeFilters || {};
      console.log('>>>>>>>>filters', filters);

      // API 호출 코드 (workApiService 사용)
      const response = await todoApiService.getWorkList({
        pagination,
        filters,
        ...params.additionalParams,
      });

      // 응답 데이터의 키를 카멜케이스로 변환하여 반환
      return {
        data: convertKeysToCamelCase(response.data),
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          'Work 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 필터 변경 후 데이터를 자동으로 조회하는 Thunk 추가
export const updateFiltersAndFetch = createAsyncThunk(
  'todo/updateFiltersAndFetch',
  async (filterUpdates, { dispatch }) => {
    // 1. 필터 업데이트
    dispatch(setFilters(filterUpdates));

    // 2. 업데이트된 필터로 데이터 조회
    return dispatch(fetchTodos()).unwrap();
  },
);

// Work 필터 변경 후 데이터 조회하는 Thunk
export const updateWorkFiltersAndFetch = createAsyncThunk(
  'todo/updateWorkFiltersAndFetch',
  async (filterUpdates, { dispatch }) => {
    // 1. 필터 업데이트
    dispatch(setWorkFilters(filterUpdates));

    // 2. 업데이트된 필터로 데이터 조회
    return dispatch(fetchWorks()).unwrap();
  },
);

// Todo 초기 상태
const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: { ...DEFAULT_FILTERS },
  pagination: { ...DEFAULT_PAGINATION },

  // WORK 상태
  work: {
    items: [],
    status: 'idle',
    error: null,
    filters: {},
    pagination: { ...DEFAULT_PAGINATION },
  },

  // 폼 상태
  form: { ...FORM_INITIAL_STATE },
};

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // TASK 페이지 설정
    setPage: (state, action) => {
      state.task.pagination.current = Number(action.payload);
    },

    setPageSize: (state, action) => {
      state.task.pagination.pageSize = Number(action.payload);
      state.task.pagination.current = 1; // ud398uc774uc9c0 ud06cuae30 ubcc0uacbd uc2dc uccab ud398uc774uc9c0ub85c
    },

    // WORK 페이지 설정
    setWorkPage: (state, action) => {
      state.work.pagination.current = Number(action.payload);
    },

    setWorkPageSize: (state, action) => {
      state.work.pagination.pageSize = Number(action.payload);
      state.work.pagination.current = 1;
    },

    // Todo 필터 업데이트
    // 필터 업데이트 리듀서 개선
    setFilters: (state, action) => {
      // 기존 필터와 새 필터를 병합 (최상위 필드 단위로만 병합)
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // 필터 변경 시 첫 페이지로 리셋
      state.pagination.current = 1;
    },

    // 깊은 병합을 위한 특정 필드 업데이트 리듀서 추가
    updateNestedFilter: (state, action) => {
      const { path, operator, value } = action.payload;

      // 경로가 있는 경우 중첩 필드 업데이트
      if (path && path.length > 0) {
        let current = state.filters;

        // 마지막 경로 요소 전까지 객체 구조 생성/탐색
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        // 마지막 경로 요소에 값 설정
        const lastKey = path[path.length - 1];
        current[lastKey] = { [operator]: value };
      }

      // 필터 변경 시 첫 페이지로 리셋
      state.pagination.current = 1;
    },

    // 배열에 요소 추가/업데이트 리듀서 (예: $and 배열 업데이트)
    updateFilterArray: (state, action) => {
      const { arrayPath, index, value } = action.payload;

      let current = state.filters;

      // 배열 경로 탐색
      for (let i = 0; i < arrayPath.length; i++) {
        const key = arrayPath[i];
        if (!current[key]) {
          current[key] = Array.isArray(current[key]) ? [] : {};
        }
        current = current[key];
      }

      // 특정 인덱스 업데이트 또는 추가
      if (Array.isArray(current)) {
        if (index !== undefined && index >= 0 && index < current.length) {
          // 기존 인덱스 업데이트
          current[index] = value;
        } else {
          // 새 항목 추가
          current.push(value);
        }
      }

      // 필터 변경 시 첫 페이지로 리셋
      state.pagination.current = 1;
    },

    // 필터 교체 리듀서 추가
    replaceFilters: (state, action) => {
      // 기존 필터를 완전히 새 필터로 교체
      state.filters = action.payload;
      // 필터 변경 시 첫 페이지로 리셋
      state.pagination.current = 1;
    },

    // WORK 필터 업데이트
    setWorkFilters: (state, action) => {
      state.work.filters = {
        ...state.work.filters,
        ...action.payload,
      };
      state.work.pagination.current = 1; // ud544ud130 ubcc0uacbd uc2dc uccab ud398uc774uc9c0ub85c
    },

    // Todo 필터 초기화
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination = { ...DEFAULT_PAGINATION };
    },

    // WORK 필터 초기화
    resetWorkFilters: (state) => {
      state.work.filters = { $and: [] };
      state.work.pagination = { ...DEFAULT_PAGINATION };
    },

    // 폼 필드 업데이트
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form.data[name] = value;

      // 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors[name] = null;
      }
    },

    // 폼 초기화
    resetForm: (state) => {
      state.form = { ...FORM_INITIAL_STATE };
    },

    // 폼 데이터 일괄 업데이트
    initializeFormData: (state, action) => {
      state.form.data = {
        ...state.form.data,
        ...action.payload,
      };
      state.form.errors = {};
    },

    // 폼 오류 상태 설정
    setFormErrors: (state, action) => {
      state.form.errors = action.payload;
    },

    // 폼 제출 상태 설정
    setFormSubmitting: (state, action) => {
      state.form.isSubmitting = action.payload;
    },

    // 폼 유효성 검사 상태 설정
    setFormIsValid: (state, action) => {
      state.form.isValid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Todo 데이터 조회
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        notification.error({
          message: 'Todo 데이터 조회 실패',
          description: action.payload || 'Todo 목록을 불러오는데 실패했습니다.',
        });
      })

      // WORK 데이터 조회
      .addCase(fetchWorks.pending, (state) => {
        state.work.status = 'loading';
        state.work.error = null;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.work.status = 'succeeded';
        state.work.items = action.payload.data;
        state.work.pagination.total = action.payload.meta.pagination.total;
        state.work.error = null;
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.work.status = 'failed';
        state.work.error = action.payload;
        notification.error({
          message: 'WORK 데이터 조회 실패',
          description: action.payload || 'WORK 목록을 불러오는데 실패했습니다.',
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  setWorkPage,
  setWorkPageSize,
  setFilters,
  replaceFilters,
  setWorkFilters,
  resetFilters,
  resetWorkFilters,
  updateFormField,
  setFormErrors,
  setFormSubmitting,
  resetForm,
  initializeFormData,
  setFormIsValid,
  updateNestedFilter,
  updateFilterArray,
} = todoSlice.actions;

export default todoSlice.reducer;
