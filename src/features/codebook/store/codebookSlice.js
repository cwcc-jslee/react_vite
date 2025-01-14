// src/features/codebook/store/codebookSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../../shared/api/apiClient';
import { FREQUENT_CODETYPES } from '../constants';
import { buildMultipleCodebookTypesQuery } from '../api/queries';

// createAsyncThunk를 사용해 비동기 액션을 생성
// API 호출과 데이터 처리를 담당하는 비동기 함수 정의
// 에러 처리를 위해 rejectWithValue 사용
export const fetchFrequentCodebooks = createAsyncThunk(
  'codebook/fetchFrequentCodebooks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Starting to fetch codebooks...');
      const query = buildMultipleCodebookTypesQuery(FREQUENT_CODETYPES);
      console.log('Built query:', query);

      const response = await apiClient.get(`/api/codebooks?${query}`);
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
          // documentId: item.documentId,
          code: item.code,
          name: item.name,
          sort: item.sort,
          type: type,
        });

        return acc;
      }, {});

      // 빈 배열로 초기화되지 않은 코드타입이 있다면 추가
      FREQUENT_CODETYPES.forEach((type) => {
        if (!groupedData[type]) {
          groupedData[type] = { data: [] };
        }
      });

      console.log('Processed Grouped Data:', groupedData);
      return groupedData;
    } catch (error) {
      console.error('Error in fetchFrequentCodebooks:', error);
      return rejectWithValue(error.message);
    }
  },
);

const codebookSlice = createSlice({
  name: 'codebook',
  initialState: {
    status: 'idle', // API 호출 상태 관리 ('idle', 'loading', 'succeeded', 'failed')
    error: null, // 에러 정보 저장
    typeSpecificData: {}, // 코드북 데이터 저장장
    loadedTypes: [], // Set을 배열로 변경
  },
  reducers: {
    // 상태 초기화 로직
    clearCodebook: (state) => {
      state.status = 'idle';
      state.error = null;
      state.typeSpecificData = {};
      state.loadedTypes = [];
    },
  },
  // 비동기 작업의 각 상태(pending, fulfilled, rejected)에 대한 처리
  // 로딩 상태, 성공 시 데이터 저장, 실패 시 에러 처리
  extraReducers: (builder) => {
    builder
      .addCase(fetchFrequentCodebooks.pending, (state) => {
        console.log('Codebook fetch pending');
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFrequentCodebooks.fulfilled, (state, action) => {
        console.log('Codebook fetch fulfilled:', action.payload);
        state.status = 'succeeded';
        state.typeSpecificData = {
          ...state.typeSpecificData,
          ...action.payload,
        };
        // loadedTypes 배열 업데이트
        FREQUENT_CODETYPES.forEach((type) => {
          if (!state.loadedTypes.includes(type)) {
            state.loadedTypes.push(type);
          }
        });
      })
      .addCase(fetchFrequentCodebooks.rejected, (state, action) => {
        console.log('Codebook fetch rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCodebook } = codebookSlice.actions;

// 상태에서 필요한 데이터를 선택하는 selector 함수들
// 컴포넌트에서 상태 접근을 위한 인터페이스 제공
export const selectCodebookStatus = (state) => state.codebook.status;
export const selectCodebookError = (state) => state.codebook.error;
export const selectCodebookByType = (type) => (state) =>
  state.codebook.typeSpecificData[type];
export const selectLoadedTypes = (state) => state.codebook.loadedTypes;

export default codebookSlice.reducer;
