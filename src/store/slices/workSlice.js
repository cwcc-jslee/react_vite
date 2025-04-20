// src/store/slices/workSlice.js
/**
 * 프로젝트 데이터 상태 관리 슬라이스
 * - 프로젝트 목록, 페이지네이션, 필터링 관리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { workApiService } from '../../features/work/services/workApiService';

// 비동기 액션 생성
export const fetchWorks = createAsyncThunk(
  'work/fetchWorks',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // 워크슬라이스의 상태 참조
      const { pagination: storePagination, filters: storeFilters } = state.work;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };
      const filters = params.filters || storeFilters || {};
      // console.log(`###########################`);

      // API 호출 코드 (workApiService 사용)
      const response = await workApiService.getWorkList({
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

// 프로젝트 생성 액션
export const createWork = createAsyncThunk(
  'work/createWork',
  async (workData, { rejectWithValue }) => {
    // try {
    //   // 데이터 스네이크 케이스 변환 등 전처리 로직
    //   const preparedData = convertKeysToSnakeCase(workData);
    //   // API 호출
    //   const response = await workApiService.createWork(preparedData);
    //   return response.data;
    // } catch (error) {
    //   return rejectWithValue(
    //     error.response?.data?.error?.message || error.message,
    //   );
    // }
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
  // form: {
  //   data: {},
  //   errors: {},
  //   isSubmitting: false,
  // },
};

const workSlice = createSlice({
  name: 'work',
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

    // 필터 초기화화
    resetFilters: (state) => {
      state.filters = {};
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
      .addCase(fetchWorks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        notification.error({
          message: '데이터 조회 실패',
          description: action.payload || '작업 목록을 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 생성
      .addCase(createWork.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createWork.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.data = {};
        state.form.errors = {};
        notification.success({
          message: '작업 생성 완료',
          description: '새 작업이 성공적으로 생성되었습니다.',
        });
        // 성공 후 목록에 추가하거나, 목록 새로고침을 위한 상태 설정 가능
      })
      .addCase(createWork.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors = {
          ...state.form.errors,
          submit: action.payload,
        };
        notification.error({
          message: '작업 생성 실패',
          description: action.payload || '작업 생성 중 오류가 발생했습니다.',
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  updateFormField,
  resetForm,
  setFormErrors,
} = workSlice.actions;

export default workSlice.reducer;
