// src/store/slices/projectSlice.js
/**
 * 프로젝트 데이터 상태 관리 슬라이스
 * - 프로젝트 목록, 페이지네이션, 필터링 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 비동기 액션 생성
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { pagination = { current: 1, pageSize: 20 }, filters = {} } =
        params;

      // API 호출 코드 (projectApiService 사용)
      const response = await projectApiService.getProjectList({
        pagination,
        filters,
      });

      return {
        data: response.data,
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || error.message,
      );
    }
  },
);

// 프로젝트 생성 액션
export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      // 데이터 스네이크 케이스 변환 등 전처리 로직
      const preparedData = convertKeysToSnakeCase(projectData);

      // API 호출
      const response = await projectApiService.createProject(preparedData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || error.message,
      );
    }
  },
);

const initialState = {
  // 데이터 상태
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // 페이지네이션 상태
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },

  // 필터 상태
  filters: {},

  // 폼 상태
  form: {
    data: {},
    errors: {},
    isSubmitting: false,
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // 페이지네이션 변경
    setPage: (state, action) => {
      state.pagination.current = Number(action.payload);
    },

    setPageSize: (state, action) => {
      state.pagination.pageSize = Number(action.payload);
      state.pagination.current = 1; // 페이지 크기 변경 시 첫 페이지로
    },

    // 필터 변경
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.current = 1; // 필터 변경 시 첫 페이지로
    },

    // 폼 데이터 변경
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form.data = {
        ...state.form.data,
        [name]: value,
      };

      // 해당 필드 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors = {
          ...state.form.errors,
          [name]: undefined,
        };
      }
    },

    // 폼 데이터 초기화
    resetForm: (state, action) => {
      state.form.data = action.payload || {};
      state.form.errors = {};
      state.form.isSubmitting = false;
    },

    // 폼 에러 설정
    setFormErrors: (state, action) => {
      state.form.errors = {
        ...state.form.errors,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // 프로젝트 목록 조회
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // 프로젝트 생성
      .addCase(createProject.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.data = {};
        state.form.errors = {};
        // 성공 후 목록에 추가하거나, 목록 새로고침을 위한 상태 설정 가능
      })
      .addCase(createProject.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors = {
          ...state.form.errors,
          submit: action.payload,
        };
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  updateFormField,
  resetForm,
  setFormErrors,
} = projectSlice.actions;

export default projectSlice.reducer;
