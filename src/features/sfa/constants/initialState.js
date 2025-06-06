/**
 * @file initialState.js
 * @description SFA 관련 Redux 스토어의 초기 상태 상수 정의
 */

export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  total: 0,
};

export const DEFAULT_FILTERS = {
  $and: [],
};

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
    salesItems: [],
    salesByPayments: [],
    sfaCustomers: [],
    revenueSources: [],
    isProject: false,
    isSameRevenueSource: false,
    sfaClassification: '',
  },
  errors: null,
  isSubmitting: false,
  isValid: true,
};
