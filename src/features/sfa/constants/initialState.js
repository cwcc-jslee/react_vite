/**
 * @file initialState.js
 * @description SFA 관련 Redux 스토어의 초기 상태 상수 정의
 */

export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

export const DEFAULT_FILTERS = {};

export const FORM_INITIAL_STATE = {
  data: {
    // SFA 폼 필드 초기값
    // customerName: '',
    // customerType: '',
    // contactPerson: '',
    // contactPhone: '',
    // contactEmail: '',
    // address: '',
    // businessNumber: '',
    // industry: '',
    // notes: '',
    customer: {},
    sfaByPayments: [],
    sfaByItems: [],
    sfaDraftItems: [], // 편집 모드에서 사용하는 임시 사업부 매출 정보
    isProject: false,
    isSameBilling: true,
    sfaClassification: null,
    sfaSalesType: null,
    name: '',
    description: '',
    itemAmount: 0,
    paymentAmount: 0,
  },
  errors: {},
  isSubmitting: false,
  isValid: true,
};
