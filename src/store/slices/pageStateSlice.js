// src/store/slices/pageStateSlice.js
/**
 * 페이지 상태 관리를 위한 Redux 슬라이스
 * 각 페이지의 공통 상태(목록, 페이지네이션, 필터 등)를 관리합니다.
 * 페이지 간 이동 시 상태를 초기화하거나 유지할 수 있습니다.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '../../shared/services/notification';
import { snakeToCamelCase } from '../../shared/utils/transformUtils';

// 초기 상태 정의
const initialState = {
  // 현재 활성화된 페이지 경로 (예: 'project', 'customer', 'sfa', 'work')
  currentPath: '',
  // 뷰 상태 (목록 보기 방식)
  viewMode: 'list', // 'list' | 'grid' | 'table' | 'kanban' 등

  // 공통 데이터 목록 상태
  items: [],
  // 선택된 항목(상세 조회용)
  selectedItem: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },

  // 페이지네이션 상태
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },

  // 필터 상태
  filters: {},

  // 로딩 상태
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'

  // 오류 메시지
  error: null,
};

/**
 * 데이터 목록 조회 비동기 액션 생성 함수
 * 각 페이지별로 API 서비스를 달리 사용할 수 있도록 팩토리 함수로 구현
 * @param {string} pageType - 페이지 타입 ('project', 'customer', 등)
 * @param {Function} apiFunction - API 호출 함수 (파라미터를 받아 Promise 반환)
 */
export const createFetchItems = (pageType, apiFunction) =>
  createAsyncThunk(
    `pageState/${pageType}/fetchItems`,
    async (params = {}, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const { pagination } = state.pageState;

        // 파라미터가 없으면 현재 상태의 페이지네이션 사용
        const queryParams = {
          pagination: {
            current: params.pagination?.current || pagination.current,
            pageSize: params.pagination?.pageSize || pagination.pageSize,
          },
          filters: params.filters || state.pageState.filters,
          // 추가적인 파라미터가 있으면 여기서 병합
          // ...params.additionalParams,
        };

        const response = await apiFunction(queryParams);

        return {
          data: response.data,
          meta: response.meta,
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.error?.message ||
            `${pageType} 목록을 불러오는 중 오류가 발생했습니다.`,
        );
      }
    },
  );

/**
 * 상세 조회 비동기 액션 생성 함수
 * @param {string} pageType - 페이지 타입 ('project', 'customer', 등)
 * @param {Function} apiFunction - API 호출 함수 (id를 받아 Promise 반환)
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.useDrawer - 드로어를 사용할지 여부 (기본값: false)
 * @param {string} options.componentName - useDrawer가 false일 때 활성화할 컴포넌트 이름 (기본값: `${pageType}DetailSection`)
 * @param {Function} options.onSuccess - 성공 시 추가 처리 콜백 함수 (선택사항)
 */
export const createFetchDetail = (pageType, apiFunction, options = {}) =>
  createAsyncThunk(
    `pageState/${pageType}/fetchDetail`,
    async (itemId, { rejectWithValue, dispatch }) => {
      try {
        const response = await apiFunction(itemId);

        // 옵션 설정 (기본값 지정)
        const {
          useDrawer = false,
          componentName = `${pageType}DetailSection`,
          onSuccess = null,
        } = options;

        // UI 상태 업데이트 (드로어 또는 컴포넌트)
        if (useDrawer) {
          // 드로어 사용 시 드로어 상태 업데이트
          dispatch({
            type: 'ui/setDrawer',
            payload: {
              visible: true,
              baseMode: `${pageType}Detail`,
              data: response.data,
            },
          });
        } else {
          // 드로어 미사용 시 해당 컴포넌트 활성화
          dispatch({
            type: 'ui/setPageLayout',
            payload: {
              components: {
                [componentName]: true,
              },
            },
          });
        }

        // 성공 시 추가 콜백 실행 (있는 경우)
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data, dispatch);
        }

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.error?.message ||
            `${pageType} 상세 정보를 불러오는 중 오류가 발생했습니다.`,
        );
      }
    },
  );

/**
 * 데이터 생성 비동기 액션 생성 함수
 * @param {string} pageType - 페이지 타입 ('project', 'customer', 등)
 * @param {Function} apiFunction - API 호출 함수 (데이터를 받아 Promise 반환)
 * @param {Function} fetchItems - 생성 후 목록을 새로고침할 액션
 */
export const createAddItem = (pageType, apiFunction, fetchItems) =>
  createAsyncThunk(
    `pageState/${pageType}/addItem`,
    async (itemData, { rejectWithValue, dispatch }) => {
      try {
        // 폼 데이터 전처리
        // const preparedData = prepareFormData(itemData);
        const preparedData = itemData;

        // API 호출
        const response = await apiFunction(preparedData);

        // 성공 알림
        notification.success({
          message: `${pageType} 생성 성공`,
          description: `${pageType}가 성공적으로 생성되었습니다.`,
        });

        // 성공 시 목록 다시 로드
        dispatch(fetchItems());

        return response.data;
      } catch (error) {
        // 에러 메시지 표시
        notification.error({
          message: `${pageType} 생성 실패`,
          description:
            error.response?.data?.error?.message ||
            `${pageType} 생성 중 오류가 발생했습니다.`,
        });

        return rejectWithValue(
          error.response?.data?.error?.message ||
            `${pageType} 생성 중 오류가 발생했습니다.`,
        );
      }
    },
  );

/**
 * 데이터 수정 비동기 액션 생성 함수
 * @param {string} pageType - 페이지 타입 ('project', 'customer', 등)
 * @param {Function} apiFunction - API 호출 함수 (id와 데이터를 받아 Promise 반환)
 * @param {Function} fetchItems - 수정 후 목록을 새로고침할 액션
 */
export const createUpdateItem = (pageType, apiFunction, fetchItems) =>
  createAsyncThunk(
    `pageState/${pageType}/updateItem`,
    async ({ itemId, data }, { rejectWithValue, dispatch }) => {
      try {
        // 폼 데이터 전처리
        // const preparedData = prepareFormData(data);
        const preparedData = data;

        // API 호출
        const response = await apiFunction(itemId, preparedData);

        // 성공 알림
        notification.success({
          message: `${pageType} 수정 성공`,
          description: `${pageType}가 성공적으로 수정되었습니다.`,
        });

        // 성공 시 목록 다시 로드
        dispatch(fetchItems());

        return response.data;
      } catch (error) {
        // 에러 메시지 표시
        notification.error({
          message: `${pageType} 수정 실패`,
          description:
            error.response?.data?.error?.message ||
            `${pageType} 수정 중 오류가 발생했습니다.`,
        });

        return rejectWithValue(
          error.response?.data?.error?.message ||
            `${pageType} 수정 중 오류가 발생했습니다.`,
        );
      }
    },
  );

/**
 * 데이터 삭제 비동기 액션 생성 함수
 * @param {string} pageType - 페이지 타입 ('project', 'customer', 등)
 * @param {Function} apiFunction - API 호출 함수 (id를 받아 Promise 반환)
 * @param {Function} fetchItems - 삭제 후 목록을 새로고침할 액션
 */
export const createDeleteItem = (pageType, apiFunction, fetchItems) =>
  createAsyncThunk(
    `pageState/${pageType}/deleteItem`,
    async (itemId, { rejectWithValue, dispatch }) => {
      try {
        // API 호출
        const response = await apiFunction(itemId);

        // 성공 알림
        notification.success({
          message: `${pageType} 삭제 성공`,
          description: `${pageType}가 성공적으로 삭제되었습니다.`,
        });

        // 성공 시 목록 다시 로드
        dispatch(fetchItems());

        return response.data;
      } catch (error) {
        // 에러 메시지 표시
        notification.error({
          message: `${pageType} 삭제 실패`,
          description:
            error.response?.data?.error?.message ||
            `${pageType} 삭제 중 오류가 발생했습니다.`,
        });

        return rejectWithValue(
          error.response?.data?.error?.message ||
            `${pageType} 삭제 중 오류가 발생했습니다.`,
        );
      }
    },
  );

const pageStateSlice = createSlice({
  name: 'pageState',
  initialState,
  reducers: {
    // 현재 페이지 경로 설정
    setCurrentPath: (state, action) => {
      const newPath = action.payload;

      // 페이지가 변경될 때 상태 초기화
      if (state.currentPath !== newPath) {
        state.currentPath = newPath;
        // 페이지 변경 시 상태 초기화
        state.items = [];
        state.pagination = {
          current: 1,
          pageSize: 10,
          total: 0,
        };
        state.filters = {};
        // items 상태 & error
        state.status = 'idle';
        state.error = null;
        // item detail
        state.selectedItem.data = null;
        state.selectedItem.status = 'idle';
        state.selectedItem.error = null;
      }
    },

    // 페이지 변경
    setPage: (state, action) => {
      state.pagination.current = Number(action.payload);
    },

    // 페이지 크기 변경
    setPageSize: (state, action) => {
      state.pagination.pageSize = Number(action.payload);
      state.pagination.current = 1; // 페이지 크기 변경 시 첫 페이지로 리셋
    },

    // 필터 설정
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.current = 1; // 필터 변경 시 첫 페이지로 리셋
    },

    // 필터 초기화
    resetFilters: (state) => {
      state.filters = {};
      state.pagination.current = 1;
    },

    // 선택된 항목 초기화
    clearSelectedItem: (state) => {
      state.selectedItem = {
        data: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
      };
    },

    // 상태 직접 설정 (고급 사용 사례용)
    setState: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
  extraReducers: (builder) => {
    // extraReducers : 스토어에 데이터를 저장하는 작업
    // 비동기 액션의 다양한 상태에 대응하는 리듀서를 정의
    // 각 페이지별 비동기 액션은 해당 페이지에서 생성하고, 이 슬라이스의 리듀서에서 처리합니다.
    // 각 페이지에서 비동기 액션을 생성할 때 extraReducers를 등록해야 합니다.

    // 표준 패턴 구현: 데이터 목록 조회
    builder
      .addMatcher(
        (action) => action.type.endsWith('/fetchItems/pending'),
        (state) => {
          state.status = 'loading';
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/fetchItems/fulfilled'),
        (state, action) => {
          state.status = 'succeeded';
          state.items = snakeToCamelCase(action.payload.data);
          state.pagination.total = action.payload.meta.pagination.total;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/fetchItems/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        },
      )

      // 표준 패턴 구현: 상세 조회
      .addMatcher(
        (action) => action.type.endsWith('/fetchDetail/pending'),
        (state) => {
          state.selectedItem.status = 'loading';
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/fetchDetail/fulfilled'),
        (state, action) => {
          state.selectedItem.status = 'succeeded';
          state.selectedItem.data = action.payload[0];
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/fetchDetail/rejected'),
        (state, action) => {
          state.selectedItem.status = 'failed';
          state.selectedItem.error = action.payload;
        },
      );
  },
});

export const {
  setCurrentPath,
  setSubmitting,
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  clearSelectedItem,
  setState,
} = pageStateSlice.actions;

export default pageStateSlice.reducer;
