// src/features/sfa/constants/formInitialState.js
export const FORM_LIMITS = {
  MAX_SALES_ITEMS: 3,
  MAX_SALES_PAYMENTS: 3,
  MAX_SALES_REVENUES: 10,
};

export const initialSalesByItem = {
  teamId: '',
  teamName: '',
  itemId: '',
  itemName: '',
};

export const initialSfaByPayment = {
  revenueSource: {},
  billingType: '',
  isConfirmed: false,
  probability: '',
  amount: '',
  profitAmount: '',
  isProfit: false,
  marginProfitValue: '',
  recognitionDate: '',
  scheduledDate: '',
  memo: '',
  paymentLabel: '',
  teamAllocations: [], // 팀별 할당 정보
};

// 🎯 폼 기본값 상태 (add 모드 진입 시 사용)
export const DEFAULT_FORM_STATE = {
  name: '',
  customer: null,
  sfaSalesType: null,
  sfaClassification: null,
  paymentAmount: 0,
  itemAmount: 0,
  description: '',
  sfaByItems: [],
  sfaByPayments: [],
  sfaDraftItems: [], // 편집 모드에서 사용하는 임시 사업부 매출 정보
  isProject: false,
  isSameBilling: true,
  isMultiTeam: false, // 다중 사업부 여부
};

// 🗑️ 완전 빈값 상태 (레이아웃 종료 시 사용)
export const EMPTY_FORM_STATE = {};

// 🔄 하위 호환성을 위한 기존 이름 유지
export const initialFormState = DEFAULT_FORM_STATE;

export const INITIAL_PAYMENT_ID_STATE = {
  id: null,
  documentId: null,
};
