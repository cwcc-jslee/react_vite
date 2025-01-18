// src/features/sfa/constants/validationConstants.js

/**
 * 폼 검증 관련 상수 정의
 */

// 검증 에러 그룹
export const ERROR_GROUPS = {
  BASIC_INFO: 'basicInfo',
  SALES_ITEMS: 'salesItems',
  PAYMENTS: 'payments',
};

// 에러 메시지 타입
export const ERROR_TYPES = {
  REQUIRED: 'required',
  INVALID_NUMBER: 'invalidNumber',
  INVALID_RANGE: 'invalidRange',
  INVALID_MARGIN: 'invalidMargin',
};

// 섹션별 제목
export const SECTION_TITLES = {
  [ERROR_GROUPS.BASIC_INFO]: '기본 정보',
  [ERROR_GROUPS.SALES_ITEMS]: '사업부 매출',
  [ERROR_GROUPS.PAYMENTS]: '결제 매출',
};

// 필수 필드 정의
export const REQUIRED_FIELDS = {
  sfaSalesType: '매출유형',
  sfaClassification: '매출구분',
  customer: '고객사',
  name: '건명',
};

// 매출파트너 관련 메시지
export const PARTNER_ERROR_MESSAGE = '매출파트너를 선택해주세요';

// 결제 매출 필수 필드
export const PAYMENT_REQUIRED_FIELDS = {
  billingType: '결제구분',
  probability: '매출확률',
  amount: '매출액',
  marginProfitValue: '이익률/이익금',
  recognitionDate: '매출인식일자',
};

// 검증 규칙
export const VALIDATION_RULES = {
  MAX_SALES_ITEMS: 3,
  MAX_PAYMENTS: 3,
  MIN_MARGIN: 0,
  MAX_MARGIN: 100,
};

// 에러 메시지 템플릿
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field}을(를) 입력해주세요`,
  INTEGER_ONLY: '정수만 입력 가능합니다',
  MARGIN_RANGE: '이익률은 0-100 사이의 값을 입력해주세요',
  MARGIN_LESS_THAN_AMOUNT: '이익금은 매출액보다 작아야 합니다',
  MIN_SALES_ITEMS: '최소 하나의 사업부 매출을 등록해주세요',
  MIN_PAYMENTS: '최소 하나의 결제 매출을 등록해주세요',
  ITEM_FIELDS: (index, fields) =>
    `${index}번 항목: ${fields.join(', ')}을(를) 입력해주세요`,
};
