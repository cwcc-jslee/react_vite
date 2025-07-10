// src/features/sfa/constants/formInitialState.js
export const FORM_LIMITS = {
  MAX_SALES_ITEMS: 3,
  MAX_SALES_PAYMENTS: 3,
  MAX_SALES_REVENUES: 10,
};

export const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
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
};

export const initialFormState = {
  name: '',
  customer: {},
  sfaSalesType: null,
  sfaClassification: null,
  paymentAmount: '',
  description: '',
  salesByItems: [],
  sfaByPayments: [],
  sfaDraftPayments: [], // 초안 결제매출
  isProject: false,
  isSameBilling: true,
};

export const INITIAL_PAYMENT_ID_STATE = {
  id: null,
  documentId: null,
};
