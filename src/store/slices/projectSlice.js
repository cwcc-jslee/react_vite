/**
 * 프로젝트 데이터 상태 관리 슬라이스
 * - 프로젝트 목록, 페이지네이션, 필터링 관리
 * - 프로젝트 상세 정보 관리
 * - 프로젝트 CRUD 작업 처리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { projectApiService } from '../../features/project/services/projectApiService';

// 필터 기본값 상수 정의
const DEFAULT_FILTERS = {
  pjt_status: { $in: [88, 89] }, // 진행중(88), 검수중(89)
  work_type: 'project', // 작업 유형이 'project'인 값
};

// 페이지네이션 기본값 상수 정의
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
};

// 프로젝트 목록 조회 액션
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination: storePagination, filters: storeFilters } =
        state.project;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };
      const filters = params.filters || storeFilters || {};

      const response = await projectApiService.getProjectList({
        pagination,
        filters,
        ...params.additionalParams,
      });

      return {
        data: convertKeysToCamelCase(response.data),
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 프로젝트 상세 조회 액션
export const fetchProjectDetail = createAsyncThunk(
  'project/fetchProjectDetail',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApiService.getProjectDetail(projectId);
      return convertKeysToCamelCase(response.data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 상세 정보를 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 프로젝트 생성 액션
export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue, dispatch }) => {
    try {
      const response = await projectApiService.createProject(projectData);

      // 생성 성공 시 목록 새로고침
      dispatch(fetchProjects());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || error.message,
      );
    }
  },
);

// 초기 상태
const initialState = {
  items: [],
  selectedItem: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: DEFAULT_FILTERS,
  pagination: DEFAULT_PAGINATION,
  form: {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: '',
    priority: '',
    manager: '',
    members: [],
    attachments: [],
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

    // 필터 초기화 (기본값으로 리셋)
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination = { ...DEFAULT_PAGINATION };
    },

    // 선택된 항목 초기화
    clearSelectedItem: (state) => {
      state.selectedItem = initialState.selectedItem;
    },

    // 폼 데이터 변경
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form[name] = value;

      // 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors[name] = null;
      }
    },

    // 폼 데이터 초기화
    resetForm: (state) => {
      state.form = initialState.form;
    },

    // 폼 에러 설정
    setFormErrors: (state, action) => {
      state.form.errors = action.payload;
    },

    // 폼 제출 상태 설정
    setFormSubmitting: (state, action) => {
      state.form.isSubmitting = action.payload;
    },

    // 폼 유효성 설정
    setFormIsValid: (state, action) => {
      state.form.isValid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 프로젝트 목록 조회
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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
        notification.error({
          message: '데이터 조회 실패',
          description:
            action.payload || '프로젝트 목록을 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 상세 조회
      .addCase(fetchProjectDetail.pending, (state) => {
        state.selectedItem.status = 'loading';
        state.selectedItem.error = null;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.selectedItem.status = 'succeeded';
        state.selectedItem.data = action.payload[0];
        state.selectedItem.error = null;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.selectedItem.status = 'failed';
        state.selectedItem.data = null;
        state.selectedItem.error = action.payload;
        notification.error({
          message: '상세 정보 조회 실패',
          description:
            action.payload || '프로젝트 상세 정보를 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 생성
      .addCase(createProject.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form = initialState.form;
        notification.success({
          message: '프로젝트 생성 완료',
          description: '새 프로젝트가 성공적으로 생성되었습니다.',
        });
      })
      .addCase(createProject.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors = {
          ...state.form.errors,
          submit: action.payload,
        };
        notification.error({
          message: '프로젝트 생성 실패',
          description:
            action.payload || '프로젝트 생성 중 오류가 발생했습니다.',
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  clearSelectedItem,
  updateFormField,
  setFormErrors,
  setFormSubmitting,
  resetForm,
  setFormIsValid,
} = projectSlice.actions;

export default projectSlice.reducer;
