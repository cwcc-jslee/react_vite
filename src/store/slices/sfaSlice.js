/**
 * SFA 페이지 데이터 관리
 * - 폼 상태 관리
 * - SFA 목록 조회 및 상태 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { sfaService } from '../../features/sfa/services/sfaService';
import dayjs from 'dayjs';
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  FORM_INITIAL_STATE,
} from '../../features/sfa/constants/initialState';

// SFA 목록 조회 액션
export const fetchSfas = createAsyncThunk(
  'sfa/fetchSfas',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination: storePagination, filters: storeFilters } = state.sfa;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };

      const filters = params.filters || storeFilters || {};

      const queryParams = {
        // dateRange: {
        //   startDate:
        //     filters.dateRange?.startDate ||
        //     dayjs().startOf('month').format('YYYY-MM-DD'),
        //   endDate:
        //     filters.dateRange?.endDate ||
        //     dayjs().endOf('month').format('YYYY-MM-DD'),
        // },
        // probability: filters.probability || null,
        filters: { ...filters },
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      };

      const response = await sfaService.getSfaList(queryParams);

      return {
        data: convertKeysToCamelCase(response.data),
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          'SFA 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// SFA 초기 상태
const initialState = {
  // 목록 데이터
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // 폼 상태
  form: { ...FORM_INITIAL_STATE },
  // 페이지네이션
  pagination: { ...DEFAULT_PAGINATION },
  // 필터
  filters: { ...DEFAULT_FILTERS },
};

const sfaSlice = createSlice({
  name: 'sfa',
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
      // action.payload가 객체인지 확인
      const payload = typeof action.payload === 'object' ? action.payload : {};

      // 두 번째 인자가 true이면 기존 필터 대체, 아니면 병합
      const replaceMode = action.meta?.replace === true;

      if (replaceMode) {
        // 기존 필터 완전히 대체
        state.filters = { ...payload };
      } else {
        // 기존 필터에 새 필터 병합 (기존 동작)
        state.filters = {
          ...state.filters,
          ...payload,
        };
      }

      state.pagination.current = 1; // 필터 변경 시 첫 페이지로
    },
    // 필터 초기화 (기본값으로 리셋)
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination = { ...DEFAULT_PAGINATION };
    },

    // 필터 단일 필드 업데이트
    updateFilterField: (state, action) => {
      const { name, value } = action.payload;
      state.filters[name] = value;
      state.pagination.current = 1; // 필터 변경 시 첫 페이지로
    },

    // 필터 여러 필드 동시 업데이트
    updateFilterFields: (state, action) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        state.filters[key] = value;
      });
      state.pagination.current = 1;
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
      // SFA 목록 조회
      .addCase(fetchSfas.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSfas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchSfas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        notification.error({
          message: '데이터 조회 실패',
          description: action.payload || 'SFA 목록을 불러오는데 실패했습니다.',
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  updateFilterField,
  updateFilterFields,
  updateFormField,
  setFormErrors,
  setFormSubmitting,
  resetForm,
  initializeFormData,
  setFormIsValid,
} = sfaSlice.actions;

export default sfaSlice.reducer;
