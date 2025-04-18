// src/store/index.js
// src/app/store.js 파일 수정(25.03.28)
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

// 기존 리듀서
import authReducer from '../features/auth/store/authSlice';
import codebookReducer from '../features/codebook/store/codebookSlice';

// 새로 추가된 리듀서
import uiReducer from './slices/uiSlice';

// 페이지 상태 관리 리듀서 (새로 추가)
import pageStateReducer from './slices/pageStateSlice';
import pageFormReducer from './slices/pageFormSlice';

// 변경 삭제 예정
// import projectReducer from '../features/project/store/projectSlice';
import kanbanReducer from '../features/project/store/kanbanSlice';
// import sfaReducer from './slices/sfaSlice';
// import customerReducer from './slices/customerSlice';

// Immer MapSet 플러그인 활성화
enableMapSet();

// 통합된 스토어 설정
export const store = configureStore({
  reducer: {
    // 기존 리듀서
    auth: authReducer,
    codebook: codebookReducer,

    // 새로 추가된 리듀서
    ui: uiReducer,

    // 새로운 페이지 상태 관리 리듀서 (project, customer, sfa, work 등 통합)
    pageState: pageStateReducer,
    pageForm: pageFormReducer,

    // 삭제, 이동 예정
    // project: projectReducer, // 삭제 예정..
    projectTask: kanbanReducer,
    // sfa: sfaReducer, // 아직 구현되지 않은 경우 주석 처리
    // customer: customerReducer, // 아직 구현되지 않은 경우 주석 처리
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: false, // non-serializable 값 허용
      // 비직렬화 가능한 값에 대한 무시 패턴
      ignoredActions: ['your-action/type'],
      ignoredPaths: ['some.path'],
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
