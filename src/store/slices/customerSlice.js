/**
 * CUSTOMER 페이지 데이터 관리
 * - 필터 상태 관리
 * - Customer 목록 조회 및 상태 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { customerService } from '../../features/customer/services/customerService';
import dayjs from 'dayjs';

// 기본 페이지네이션
const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

// 기본 필터 (실제 DB 테이블 구조에 맞춤)
const DEFAULT_FILTERS = {
  // 기본 검색 필드
  name: null, // 고객명
  businessType: null, // 업태
  city: null, // 시/군/구
  address: null, // 주소

  // 관계 필드 (ID 기반)
  coClassification: null, // 기업분류
  businessScale: null, // 기업규모
  region: null, // 지역
  employee: null, // 직원 수
  funnel: null, // 유입경로 (JSON 필드)

  // 날짜 범위 (선택사항)
  dateRange: null,
};

// Customer 목록 조회 액션
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination: storePagination, filters: storeFilters } =
        state.customer;

      const pagination =
        params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };

      const filters = params.filters || storeFilters || {};

      const queryParams = {
        filters: { ...filters },
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      };

      const response = await customerService.getCustomerList(queryParams);

      return {
        data: response.data,
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '고객 목록을 불러오는 중 오류가 발생했습니다.'
      );
    }
  }
);

// Customer 초기 상태
const initialState = {
  // 목록 데이터
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // 페이지네이션
  pagination: { ...DEFAULT_PAGINATION },
  // 필터
  filters: { ...DEFAULT_FILTERS },
};

const customerSlice = createSlice({
  name: 'customer',
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

    // 필터 변경 - 단일 필드
    updateFilterField: (state, action) => {
      const { name, value } = action.payload;
      state.filters[name] = value;
    },

    // 필터 변경 - 여러 필드
    updateFilterFields: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // 필터 초기화
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination.current = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        notification.error({
          title: '오류',
          message: action.payload,
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  updateFilterField,
  updateFilterFields,
  resetFilters,
} = customerSlice.actions;

export default customerSlice.reducer;
