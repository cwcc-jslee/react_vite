// src/features/project/constants/initialState.js
// import { getCommonTaskState } from '@/shared/constants/commonState';

// 기본 프로젝트 상태
export const projectInitialState = {
  name: '',
  customer: '',
  sfa: '',
  service: '',
  team: '',
};

// 프로젝트 Redux 초기 상태
export const projectReduxInitialState = {
  // 데이터 상태
  items: [],
  selectedProject: null,
  status: 'idle',
  error: null,

  // 페이지네이션 상태
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },

  // 필터 상태
  filters: {},

  // 폼은 필요할 때만 생성
  form: {
    data: {
      pjtStatus: { id: 86, code: '시작전', name: '시작전' },
      importanceLevel: { id: 121, code: 'medium', name: '중간' },
    },
    errors: {},
    isSubmitting: false,
  },
};

// 프로젝트 폼 초기화 함수 (재사용성 높임)
export const getInitialProjectForm = (existingData = null) => ({
  data: existingData || { ...projectInitialState },
  errors: {},
  isSubmitting: false,
});
