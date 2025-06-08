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

export const initialSalesByPayment = {
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
  sfaSalesType: '',
  sfaClassification: '',
  itemAmount: '',
  paymentAmount: '',
  description: '',
  salesByItems: [],
  salesByPayments: [],
  isProject: false,
  isSameBilling: true,
};

export const INITIAL_PAYMENT_ID_STATE = {
  id: null,
  documentId: null,
};
