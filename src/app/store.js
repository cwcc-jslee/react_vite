// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import authReducer from '../features/auth/store/authSlice';
// import codebookReducer from '../features/codebook/store/codebookSlice';

// Immer MapSet 플러그인 활성화
enableMapSet();

// 초기 스토어 설정
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // codebook: codebookReducer,
    // 다른 리듀서들도 여기에 추가...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // non-serializable 값 허용
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
