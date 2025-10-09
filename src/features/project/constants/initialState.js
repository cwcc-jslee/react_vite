// src/features/project/constants/initialState.js
// import { getCommonTaskState } from '@/shared/constants/commonState';

/**
 * 프로젝트 관련 초기 상태 상수
 * @date 25.04.09
 * @version 1.0.0
 */

// 필터 기본값 상수 정의
export const DEFAULT_FILTERS = {
  is_closed: { $eq: false },
  // pjt_status: { $in: [88] }, // 대기(87), 진행중(88), 검수중(89)
  // work_type: 'project', // 작업 유형이 'project'인 값
};

// 페이지네이션 기본값 상수 정의
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// 프로젝트 비용 관련 상수 정의
export const PROJECT_COST_CONSTANTS = {
  HOURLY_RATE: 94000, // 시간당 비용 (원)
};

// 프로젝트 상태 초기값
export const PROJECT_STATUS_INITIAL_STATE = {
  data: {
    inProgress: 0,
    pending: 0,
    waiting: 0,
    notStarted: 0,
    review: 0,
    recentlyCompleted: 0,
    total: 0,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 프로젝트 진행률 초기값
export const PROJECT_PROGRESS_INITIAL_STATE = {
  data: {
    distribution: {},
    total: 0,
    ranges: {},
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 로딩 상태 초기값
export const LOADING_STATE_INITIAL_STATE = {
  loading: false,
  error: null,
};

// 진행률 로딩 상태 초기값
export const PROGRESS_LOADING_STATE_INITIAL_STATE = {
  loadingProgress: false,
  errorProgress: null,
};

export const SCHEDULE_STATUS_INITIAL_STATE = {
  data: {
    normal: 0,
    delayed: 0,
    imminent: 0,
    total: 0,
  },
  status: 'idle',
  error: null,
};
// 대시보드 초기 상태
// export const DASHBOARD_INITIAL_STATE = {
//   projectStatus: PROJECT_STATUS_INITIAL_STATE,
//   projectProgress: PROJECT_PROGRESS_INITIAL_STATE,
//   scheduleStatus: SCHEDULE_STATUS_INITIAL_STATE,
// };

// 프로젝트 폼 초기 상태
export const FORM_INITIAL_STATE = {
  data: {
    projectType: 'revenue',
    name: '',
    customer: null,
    sfa: '',
    service: null,
    team: null,
    pjtStatus: null,
    importanceLevel: null,
    fy: null,
    planStartDate: '',
    planEndDate: '',
    templateId: '',
    remarks: '',
  },
  errors: {},
  isSubmitting: false,
  isValid: false,
  mode: 'create',
  editingId: null,
  isDirty: false,
};

// 프로젝트 선택 항목 초기 상태
export const SELECTED_ITEM_INITIAL_STATE = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  works: {
    items: [],
    status: 'idle',
    error: null,
    pagination: { ...DEFAULT_PAGINATION },
  },
};

// 기본 프로젝트 상태
export const projectInitialState = {
  name: '',
  customer: '',
  sfa: '',
  service: '',
  team: '',
};

// 프로젝트  초기 상태
export const initialState = {
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
      workType: '',
      fy: { id: 114, code: '25', name: '25년' },
    },
    errors: {},
    isSubmitting: false,
  },
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
};

// 프로젝트 폼 초기화 함수 (재사용성 높임)
export const getInitialProjectForm = (existingData = null) => ({
  data: existingData || { ...projectInitialState },
  errors: {},
  isSubmitting: false,
});
