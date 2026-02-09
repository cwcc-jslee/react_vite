/**
 * BizRadar 페이지 데이터 관리
 * - 공고 목록/상세 조회
 * - 필터 및 페이지네이션
 * - 수정 폼 상태 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bizradarApi } from '@features/bizradar/api/bizradarApi';
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
} from '@features/bizradar/constants/initialState';

// 공고 목록 조회
export const fetchBizradarList = createAsyncThunk(
  'bizradar/fetchList',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination: storePagination, filters: storeFilters } = state.bizradar;

      const pagination = params.pagination || storePagination;
      const filters = params.filters || storeFilters;

      // 필터에서 null/undefined/빈문자열 제거
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      );

      const queryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...cleanFilters,
      };

      const response = await bizradarApi.getList(queryParams);

      return {
        items: response.data || response.items || response,
        total: response.total || response.meta?.total || 0,
        page: response.page || pagination.current,
        pageSize: response.page_size || pagination.pageSize,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || '공고 목록을 불러오는 중 오류가 발생했습니다.'
      );
    }
  }
);

// 공고 상세 조회
export const fetchBizradarDetail = createAsyncThunk(
  'bizradar/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bizradarApi.getDetail(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || '공고 상세 정보를 불러오는 중 오류가 발생했습니다.'
      );
    }
  }
);

// 공고 수정
export const updateBizradarItem = createAsyncThunk(
  'bizradar/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await bizradarApi.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || '공고 수정 중 오류가 발생했습니다.'
      );
    }
  }
);

// 공고 검토 확정
export const confirmBizradarItem = createAsyncThunk(
  'bizradar/confirm',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await bizradarApi.confirm(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || '공고 확정 중 오류가 발생했습니다.'
      );
    }
  }
);

// 초기 상태
const initialState = {
  // 목록 데이터
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // 선택된 항목 (상세 보기용)
  selectedItem: {
    data: null,
    status: 'idle',
    error: null,
  },

  // 페이지네이션
  pagination: { ...DEFAULT_PAGINATION },

  // 필터
  filters: { ...DEFAULT_FILTERS },

  // 수정 폼 상태
  form: {
    data: {},
    errors: {},
    isSubmitting: false,
    isDirty: false,
  },
};

// 슬라이스
const bizradarSlice = createSlice({
  name: 'bizradar',
  initialState,
  reducers: {
    // 페이지 변경
    setPage: (state, action) => {
      state.pagination.current = action.payload;
    },

    // 페이지 크기 변경
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.current = 1;
    },

    // 필터 설정
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.current = 1;
    },

    // 필터 초기화
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination.current = 1;
    },

    // 폼 필드 업데이트
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form.data[name] = value;
      state.form.isDirty = true;
    },

    // 폼 데이터 설정
    setFormData: (state, action) => {
      state.form.data = action.payload || {};
      state.form.errors = {};
      state.form.isDirty = false;
    },

    // 폼 초기화
    resetForm: (state) => {
      state.form = {
        data: {},
        errors: {},
        isSubmitting: false,
        isDirty: false,
      };
    },

    // 선택 항목 초기화
    clearSelectedItem: (state) => {
      state.selectedItem = {
        data: null,
        status: 'idle',
        error: null,
      };
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null;
      state.selectedItem.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 목록 조회
      .addCase(fetchBizradarList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBizradarList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchBizradarList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // 상세 조회
      .addCase(fetchBizradarDetail.pending, (state) => {
        state.selectedItem.status = 'loading';
        state.selectedItem.error = null;
      })
      .addCase(fetchBizradarDetail.fulfilled, (state, action) => {
        state.selectedItem.status = 'succeeded';
        state.selectedItem.data = action.payload;
        // 폼 데이터 초기화
        state.form.data = { ...action.payload };
        state.form.isDirty = false;
      })
      .addCase(fetchBizradarDetail.rejected, (state, action) => {
        state.selectedItem.status = 'failed';
        state.selectedItem.error = action.payload;
      })

      // 수정
      .addCase(updateBizradarItem.pending, (state) => {
        state.form.isSubmitting = true;
        state.form.errors = {};
      })
      .addCase(updateBizradarItem.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.isDirty = false;
        state.selectedItem.data = action.payload;

        // 목록에서 해당 항목 업데이트
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateBizradarItem.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors.submit = action.payload;
      })

      // 검토 확정
      .addCase(confirmBizradarItem.pending, (state) => {
        state.form.isSubmitting = true;
        state.form.errors = {};
      })
      .addCase(confirmBizradarItem.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.isDirty = false;

        // 목록에서 해당 항목 제거 (확정되었으므로 검토 목록에서 제외)
        // 만약 상세 보기 중이었다면 데이터 업데이트
        if (state.selectedItem.data && state.selectedItem.data.id === action.payload.id) {
          state.selectedItem.data = action.payload;
        }

        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(confirmBizradarItem.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors.submit = action.payload;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  updateFormField,
  setFormData,
  resetForm,
  clearSelectedItem,
  clearError,
} = bizradarSlice.actions;

export default bizradarSlice.reducer;
