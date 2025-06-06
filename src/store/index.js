// src/store/index.js
// src/app/store.js 파일 수정(25.03.28)
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

// 인증, UI, 코드북 리듀서
import authReducer from '../features/auth/store/authSlice';
import codebookReducer from './slices/codebookSlice';
import uiReducer from './slices/uiSlice';

// 페이지 관련 리듀서
import sfaReducer from './slices/sfaSlice';
import projectReducer from './slices/projectSlice';
import todoReducer from './slices/todoSlice';

// 변경예정
import pageStateReducer from './slices/pageStateSlice';
import pageFormReducer from './slices/pageFormSlice';
import workReducer from './slices/workSlice';
import taskReducer from './slices/taskSlice';
import projectBucketReducer from './slices/projectBucketSlice';

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
    sfa: sfaReducer,
    project: projectReducer,
    todo: todoReducer,

    // work 상태 관리 리듀서(다른 페이지에서 사용 필요하여 별도 구성)
    projectBucket: projectBucketReducer,
    task: taskReducer,
    work: workReducer,
    pageState: pageStateReducer,
    pageForm: pageFormReducer,

    // 삭제, 이동 예정
    // project: projectReducer, // 삭제 예정..
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
