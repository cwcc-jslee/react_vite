// src/features/project/constants/reviewTypeConstants.js

/**
 * 프로젝트 검수 주체 관련 상수 정의
 * - 검수 타입 코드, 라벨, 색상 매핑을 중앙에서 관리
 *
 * @date 2025-12-26
 * @version 1.0.0
 */

// ============================================================
// 1. 검수 주체 코드 상수 (DB ID 값)
// ============================================================

/**
 * 검수 주체 코드 (DB의 실제 ID 값)
 */
export const REVIEW_TYPE_CODES = {
  INTERNAL: 1,   // 내부검토
  AGENCY: 2,     // 발주기관
  CUSTOMER: 3,   // 고객
};

// ============================================================
// 2. 영문 키 ↔ 코드 매핑
// ============================================================

/**
 * 영문 키 → 검수 주체 코드 매핑
 * @example REVIEW_TYPE_MAP.agency // 2
 */
export const REVIEW_TYPE_MAP = {
  internal: REVIEW_TYPE_CODES.INTERNAL,
  agency: REVIEW_TYPE_CODES.AGENCY,
  customer: REVIEW_TYPE_CODES.CUSTOMER,
};

/**
 * 검수 주체 코드 → 영문 키 역매핑
 * @example REVIEW_TYPE_CODE_TO_KEY[2] // 'agency'
 */
export const REVIEW_TYPE_CODE_TO_KEY = {
  [REVIEW_TYPE_CODES.INTERNAL]: 'internal',
  [REVIEW_TYPE_CODES.AGENCY]: 'agency',
  [REVIEW_TYPE_CODES.CUSTOMER]: 'customer',
};

// ============================================================
// 3. 한글 라벨 ↔ 영문 키 매핑
// ============================================================

/**
 * 한글 라벨 → 영문 키 매핑
 * @example REVIEW_TYPE_LABEL_TO_KEY['발주기관'] // 'agency'
 */
export const REVIEW_TYPE_LABEL_TO_KEY = {
  '내부검토': 'internal',
  '발주기관': 'agency',
  '고객': 'customer',
};

/**
 * 영문 키 → 한글 라벨 역매핑
 * @example REVIEW_TYPE_KEY_TO_LABEL.agency // '발주기관'
 */
export const REVIEW_TYPE_KEY_TO_LABEL = {
  internal: '내부검토',
  agency: '발주기관',
  customer: '고객',
};

// ============================================================
// 4. Badge 색상 정의
// ============================================================

/**
 * 검수 주체별 Badge 색상
 */
export const REVIEW_TYPE_COLORS = {
  internal: 'info',      // 파란색 (내부)
  agency: 'warning',     // 주황색 (기관)
  customer: 'primary',   // 보라색 (고객)
};

// ============================================================
// 5. 검수 주체별 프로젝트 상태 매칭
// ============================================================

/**
 * 어떤 검수 주체가 어떤 프로젝트 상태에서 사용되는지 정의
 */
export const REVIEW_TYPE_STATUS_MAPPING = {
  // 중간검수에서 사용 가능한 검수 주체
  interimReview: ['internal', 'agency'],

  // 최종검수에서 사용 가능한 검수 주체
  finalReview: ['customer'],
};

// ============================================================
// 6. 검수 설명
// ============================================================

/**
 * 검수 주체별 설명
 */
export const REVIEW_TYPE_DESCRIPTIONS = {
  internal: '내부 품질 검수 및 검토',
  agency: '발주기관 검수 (3자간 계약 시 필수)',
  customer: '최종 고객 검수',
};

// ============================================================
// 7. 유틸리티 함수
// ============================================================

/**
 * 영문 키로 검수 주체 코드 조회
 * @param {string} key - 영문 키 (예: 'agency')
 * @returns {number} 검수 주체 코드 (예: 2)
 */
export const getReviewTypeCodeByKey = (key) => REVIEW_TYPE_MAP[key];

/**
 * 검수 주체 코드로 영문 키 조회
 * @param {number} code - 검수 주체 코드 (예: 2)
 * @returns {string} 영문 키 (예: 'agency')
 */
export const getReviewTypeKeyByCode = (code) => REVIEW_TYPE_CODE_TO_KEY[code];

/**
 * 영문 키로 한글 라벨 조회
 * @param {string} key - 영문 키 (예: 'agency')
 * @returns {string} 한글 라벨 (예: '발주기관')
 */
export const getReviewTypeLabelByKey = (key) => REVIEW_TYPE_KEY_TO_LABEL[key];

/**
 * 한글 라벨로 영문 키 조회
 * @param {string} label - 한글 라벨 (예: '발주기관')
 * @returns {string} 영문 키 (예: 'agency')
 */
export const getReviewTypeKeyByLabel = (label) => REVIEW_TYPE_LABEL_TO_KEY[label];

/**
 * 영문 키로 Badge 색상 조회
 * @param {string} key - 영문 키 (예: 'agency')
 * @returns {string} Badge 색상 (예: 'warning')
 */
export const getReviewTypeColorByKey = (key) => REVIEW_TYPE_COLORS[key];

/**
 * 프로젝트 상태에 따라 사용 가능한 검수 주체 목록 반환
 * @param {string} statusKey - 상태 영문 키 (예: 'interimReview')
 * @returns {Array<string>} 사용 가능한 검수 주체 영문 키 배열
 */
export const getAvailableReviewTypesByStatus = (statusKey) => {
  return REVIEW_TYPE_STATUS_MAPPING[statusKey] || [];
};
