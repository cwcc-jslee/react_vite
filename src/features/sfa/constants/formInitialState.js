// src/features/sfa/constants/formInitialState.js
export const FORM_LIMITS = {
  MAX_SALES_ITEMS: 3,
  MAX_SALES_PAYMENTS: 3,
};

export const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
};

export const initialSalesByPayment = {
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
  sfaSalesType: '',
  sfaClassification: '',
  customer: '',
  sellingPartner: '',
  itemAmount: '',
  paymentAmount: '',
  description: '',
  salesByItems: [],
  salesByPayments: [],
};
