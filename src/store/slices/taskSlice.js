/**
 * 프로젝트 작업(할일) 데이터 상태 관리 슬라이스
 * - 작업 목록, 페이지네이션, 필터링 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { workApiService } from '../../features/work/services/workApiService';

// 필터 기본값 상수 정의
const DEFAULT_FILTERS = {};

// 페이지네이션 기본값 상수 정의
const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

// 비동기 액션 생성
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // 태스크 슬라이스의 상태 참조
      const { pagination: storePagination, filters: storeFilters } = state.task;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };
      const filters = params.filters || storeFilters || {};

      // API 호출 코드 (workApiService 사용)
      const response = await workApiService.getTaskList({
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
          '작업 목록을 불러오는 중 오류가 발생했습니다.',
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
  pagination: { ...DEFAULT_PAGINATION },

  // 필터 상태
  filters: { ...DEFAULT_FILTERS },
};

const taskSlice = createSlice({
  name: 'task',
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

    // 필터 초기화
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination = { ...DEFAULT_PAGINATION };
    },
  },
  extraReducers: (builder) => {
    builder
      // 작업 목록 조회
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        notification.error({
          message: '데이터 조회 실패',
          description: action.payload || '작업 목록을 불러오는데 실패했습니다.',
        });
      });
  },
});

export const { setPage, setPageSize, setFilters, resetFilters } =
  taskSlice.actions;

export default taskSlice.reducer;
