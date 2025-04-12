// src/features/codebook/store/codebookSlice.js
// 코드북 데이터를 관리하는 리덕스 슬라이스입니다.
// 코드북 타입별 데이터를 캐시하고, 필요할 때 선택적으로 가져올 수 있는 기능을 제공합니다.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../shared/api/apiService';
import { buildMultipleCodebookTypesQuery } from '../../shared/api/queries';

// 단일 코드북 타입 데이터를 가져오는 비동기 액션
export const fetchCodebookByType = createAsyncThunk(
  'codebook/fetchCodebookByType',
  async (codeType, { rejectWithValue }) => {
    try {
      console.log(`Fetching codebook for type: ${codeType}`);
      const query = buildMultipleCodebookTypesQuery([codeType]);
      console.log('Built query:', query);

      const response = await apiClient.get(`/codebooks?${query}`);
      console.log('API Response:', response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response data structure');
      }

      // API 응답 데이터를 파싱
      const items = response.data.data.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        sort: item.sort,
        type: item.codetype.type,
      }));

      console.log(`Processed ${items.length} items for type ${codeType}`);

      // 코드북 타입과 데이터를 함께 반환
      return {
        type: codeType,
        data: {
          data: items,
        },
      };
    } catch (error) {
      console.error(`Error in fetchCodebookByType(${codeType}):`, error);
      return rejectWithValue(error.message);
    }
  },
);

// 여러 코드북 타입 데이터를 한 번에 가져오는 비동기 액션
export const fetchCodebooksByTypes = createAsyncThunk(
  'codebook/fetchCodebooksByTypes',
  async (codeTypes, { rejectWithValue, getState }) => {
    try {
      console.log('Starting to fetch codebooks for types:', codeTypes);

      // 현재 스토어에 있는 코드북 데이터 및 로드된 타입 정보 가져오기
      const { codebook } = getState();
      const loadedTypes = codebook.loadedTypes;

      // 이미 로드된 타입을 필터링하여 API 호출 최소화
      const typesToFetch = codeTypes.filter(
        (type) => !loadedTypes.includes(type),
      );

      if (typesToFetch.length === 0) {
        console.log('All requested codebook types already loaded');
        return {};
      }

      console.log('Fetching these codebook types:', typesToFetch);
      const query = buildMultipleCodebookTypesQuery(typesToFetch);
      console.log('Built query:', query);

      const response = await apiClient.get(`/codebooks?${query}`);
      console.log('API Response:', response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response data structure');
      }

      // API 응답 데이터를 codetype별로 그룹화
      const groupedData = response.data.data.reduce((acc, item) => {
        const type = item.codetype.type;

        if (!acc[type]) {
          acc[type] = { data: [] };
        }

        acc[type].data.push({
          id: item.id,
          code: item.code,
          name: item.name,
          sort: item.sort,
          type: type,
        });

        return acc;
      }, {});

      // 빈 배열로 초기화되지 않은 코드타입이 있다면 추가
      typesToFetch.forEach((type) => {
        if (!groupedData[type]) {
          groupedData[type] = { data: [] };
        }
      });

      console.log('Processed Grouped Data:', groupedData);
      return {
        data: groupedData,
        types: typesToFetch,
      };
    } catch (error) {
      console.error('Error in fetchCodebooksByTypes:', error);
      return rejectWithValue(error.message);
    }
  },
);

const codebookSlice = createSlice({
  name: 'codebook',
  initialState: {
    status: 'idle', // API 호출 상태 관리 ('idle', 'loading', 'succeeded', 'failed')
    error: null, // 에러 정보 저장
    typeSpecificData: {}, // 코드북 데이터 저장
    loadedTypes: [], // 로드된 코드북 타입 목록
    pendingTypes: [], // 현재 로딩 중인 타입
  },
  reducers: {
    // 상태 초기화 로직
    clearCodebook: (state) => {
      state.status = 'idle';
      state.error = null;
      state.typeSpecificData = {};
      state.loadedTypes = [];
      state.pendingTypes = [];
    },

    // 특정 타입의 코드북 데이터만 초기화
    clearCodebookByType: (state, action) => {
      const type = action.payload;
      delete state.typeSpecificData[type];
      state.loadedTypes = state.loadedTypes.filter((t) => t !== type);
    },
  },
  // 비동기 작업의 각 상태(pending, fulfilled, rejected)에 대한 처리
  extraReducers: (builder) => {
    builder
      // 단일 타입 코드북 관련 상태 처리
      .addCase(fetchCodebookByType.pending, (state, action) => {
        // 메타데이터에서 codeType 추출
        const codeType = action.meta.arg;
        console.log(`Codebook fetch pending for type: ${codeType}`);

        state.status = 'loading';
        // 현재 로딩 중인 타입에 추가
        if (!state.pendingTypes.includes(codeType)) {
          state.pendingTypes.push(codeType);
        }
      })
      .addCase(fetchCodebookByType.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        console.log(`Codebook fetch fulfilled for type: ${type}`, data);

        // 코드북 데이터 저장
        state.typeSpecificData[type] = data;

        // 로드된 타입에 추가
        if (!state.loadedTypes.includes(type)) {
          state.loadedTypes.push(type);
        }

        // 로딩 중인 타입에서 제거
        state.pendingTypes = state.pendingTypes.filter((t) => t !== type);

        // 모든 로딩이 완료되었는지 확인
        if (state.pendingTypes.length === 0) {
          state.status = 'succeeded';
        }
      })
      .addCase(fetchCodebookByType.rejected, (state, action) => {
        // 메타데이터에서 codeType 추출
        const codeType = action.meta.arg;
        console.log(
          `Codebook fetch rejected for type: ${codeType}`,
          action.payload,
        );

        // 로딩 중인 타입에서 제거
        state.pendingTypes = state.pendingTypes.filter((t) => t !== codeType);

        // 모든 요청이 완료되었으면 상태 변경
        if (state.pendingTypes.length === 0) {
          state.status = 'failed';
          state.error = action.payload;
        }
      })

      // 여러 타입 코드북 관련 상태 처리
      .addCase(fetchCodebooksByTypes.pending, (state, action) => {
        // 메타데이터에서 요청된 타입들 추출
        const codeTypes = action.meta.arg;
        console.log(`Codebook fetch pending for types:`, codeTypes);

        state.status = 'loading';

        // 현재 로딩 중인 타입에 추가 (중복 없이)
        codeTypes.forEach((type) => {
          if (
            !state.pendingTypes.includes(type) &&
            !state.loadedTypes.includes(type)
          ) {
            state.pendingTypes.push(type);
          }
        });
      })
      .addCase(fetchCodebooksByTypes.fulfilled, (state, action) => {
        // 새로 로드된 데이터가 없으면 (이미 모든 타입이 로드되어 있으면) 종료
        if (!action.payload.data) {
          if (state.pendingTypes.length === 0) {
            state.status = 'succeeded';
          }
          return;
        }

        const { data, types } = action.payload;
        console.log(`Codebook fetch fulfilled for types:`, types);

        // 코드북 데이터 저장
        state.typeSpecificData = {
          ...state.typeSpecificData,
          ...data,
        };

        // 로드된 타입에 추가하고 로딩 중인 타입에서 제거
        types.forEach((type) => {
          // 로드된 타입에 추가
          if (!state.loadedTypes.includes(type)) {
            state.loadedTypes.push(type);
          }

          // 로딩 중인 타입에서 제거
          state.pendingTypes = state.pendingTypes.filter((t) => t !== type);
        });

        // 모든 로딩이 완료되었는지 확인
        if (state.pendingTypes.length === 0) {
          state.status = 'succeeded';
        }
      })
      .addCase(fetchCodebooksByTypes.rejected, (state, action) => {
        // 메타데이터에서 요청된 타입들 추출
        const codeTypes = action.meta.arg;
        console.log(
          `Codebook fetch rejected for types:`,
          codeTypes,
          action.payload,
        );

        // 로딩 중인 타입에서 모두 제거
        codeTypes.forEach((type) => {
          state.pendingTypes = state.pendingTypes.filter((t) => t !== type);
        });

        // 모든 요청이 완료되었으면 상태 변경
        if (state.pendingTypes.length === 0) {
          state.status = 'failed';
          state.error = action.payload;
        }
      });
  },
});

export const { clearCodebook, clearCodebookByType } = codebookSlice.actions;

// 셀렉터 함수들
export const selectCodebookStatus = (state) => state.codebook.status;
export const selectCodebookError = (state) => state.codebook.error;
export const selectCodebookByType = (type) => (state) =>
  state.codebook.typeSpecificData[type];
export const selectLoadedTypes = (state) => state.codebook.loadedTypes;
export const selectPendingTypes = (state) => state.codebook.pendingTypes;

// 특정 타입이 로드되었는지 확인하는 셀렉터
export const selectIsTypeLoaded = (type) => (state) =>
  state.codebook.loadedTypes.includes(type);

// 특정 타입이 로딩 중인지 확인하는 셀렉터
export const selectIsTypePending = (type) => (state) =>
  state.codebook.pendingTypes.includes(type);

export default codebookSlice.reducer;
