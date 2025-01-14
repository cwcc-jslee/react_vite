// src/features/codebook/constants/index.js

// 자주 사용되는 코드 유형 (앱 초기화 시 로드)
export const FREQUENT_CODETYPES = [
  'sfa_sales_type', // 매출유형
  'sfa_percentage', // 매출확률
  'sfa_classification', // 매출구분
  'fy', // 회계연도
  'sfa_profit_margin', // 이익,마진
  'pjt_progress', //프로젝트 진행률
  're_payment_method', // 결제구분
];

// 덜 빈번한 코드 유형 (필요시 로드)
// export const INFREQUENT_CODETYPES = [
//   'sfa_classification', // 매출구분 -> 매출품목
//   'business_type', // 업태
//   'business_item', // 업종
//   'business_scale', // 기업규모
//   'region', // 지역
//   'employee', // 직원수
// ];
