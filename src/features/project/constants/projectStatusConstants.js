// src/features/project/constants/projectStatusConstants.js

/**
 * 프로젝트 상태 관련 상수 정의
 * - 상태 코드, 라벨, 색상 매핑을 중앙에서 관리
 * - 코드 중복 제거 및 유지보수성 향상
 *
 * @date 2025-12-24
 * @version 4.0.0
 * @changes 검수 단계 2단계로 통합 (중간검수/최종검수)
 *   - 85: 보류 → 보류/대기
 *   - 86: 시작전 → 시작전 (유지)
 *   - 87: 대기/기관검수 → 중간검수 (내부+기관 통합)
 *   - 88: 진행중 → 진행중 (유지)
 *   - 89: 검수/고객검수 → 최종검수 (고객 검수)
 *   - 90: 종료 (신규 추가)
 */

// ============================================================
// 1. 프로젝트 상태 코드 상수 (DB ID 값)
// ============================================================

/**
 * 프로젝트 상태 코드 (DB의 실제 ID 값)
 */
export const PROJECT_STATUS_CODES = {
  PENDING_WAITING: 85,  // 보류/대기
  NOT_STARTED: 86,      // 시작전
  INTERIM_REVIEW: 87,   // 중간검수 (내부/기관)
  IN_PROGRESS: 88,      // 진행중
  FINAL_REVIEW: 89,     // 최종검수 (고객)
  CLOSED: 90,           // 종료
};

// ============================================================
// 2. 영문 키 ↔ 코드 매핑
// ============================================================

/**
 * 영문 키 → 상태 코드 매핑
 * @example PROJECT_STATUS_MAP.inProgress // 88
 */
export const PROJECT_STATUS_MAP = {
  pendingWaiting: PROJECT_STATUS_CODES.PENDING_WAITING,    // 85
  notStarted: PROJECT_STATUS_CODES.NOT_STARTED,            // 86
  interimReview: PROJECT_STATUS_CODES.INTERIM_REVIEW,      // 87
  inProgress: PROJECT_STATUS_CODES.IN_PROGRESS,            // 88
  finalReview: PROJECT_STATUS_CODES.FINAL_REVIEW,          // 89
  closed: PROJECT_STATUS_CODES.CLOSED,                     // 90
};

/**
 * 상태 코드 → 영문 키 역매핑
 * @example PROJECT_STATUS_CODE_TO_KEY[88] // 'inProgress'
 */
export const PROJECT_STATUS_CODE_TO_KEY = {
  [PROJECT_STATUS_CODES.PENDING_WAITING]: 'pendingWaiting',
  [PROJECT_STATUS_CODES.NOT_STARTED]: 'notStarted',
  [PROJECT_STATUS_CODES.INTERIM_REVIEW]: 'interimReview',
  [PROJECT_STATUS_CODES.IN_PROGRESS]: 'inProgress',
  [PROJECT_STATUS_CODES.FINAL_REVIEW]: 'finalReview',
  [PROJECT_STATUS_CODES.CLOSED]: 'closed',
};

// ============================================================
// 3. 한글 라벨 ↔ 영문 키 매핑
// ============================================================

/**
 * 한글 라벨 → 영문 키 매핑 (UI에서 사용)
 * @example PROJECT_STATUS_LABEL_TO_KEY['진행중'] // 'inProgress'
 */
export const PROJECT_STATUS_LABEL_TO_KEY = {
  '보류/대기': 'pendingWaiting',
  '시작전': 'notStarted',
  '중간검수': 'interimReview',
  '진행중': 'inProgress',
  '고객검수': 'finalReview',
  '종료': 'closed',
};

/**
 * 영문 키 → 한글 라벨 역매핑
 * @example PROJECT_STATUS_KEY_TO_LABEL.inProgress // '진행중'
 */
export const PROJECT_STATUS_KEY_TO_LABEL = {
  pendingWaiting: '보류/대기',
  notStarted: '시작전',
  interimReview: '중간검수',
  inProgress: '진행중',
  finalReview: '고객검수',
  closed: '종료',
};

// ============================================================
// 4. 차트 색상 정의
// ============================================================

/**
 * 프로젝트 상태별 차트 색상 (도넛 차트 등에서 사용)
 * - color: 차트 세그먼트 색상
 * - bgColor: 배경색 (투명도 포함)
 */
export const PROJECT_STATUS_COLORS = {
  pendingWaiting: {
    color: '#EF4444',                    // 빨간색 (보류/대기)
    bgColor: 'rgba(239, 68, 68, 0.8)'
  },
  notStarted: {
    color: '#6B7280',                    // 회색 (시작전)
    bgColor: 'rgba(107, 114, 128, 0.8)'
  },
  interimReview: {
    color: '#3B82F6',                    // 파란색 (중간검수)
    bgColor: 'rgba(59, 130, 246, 0.8)'
  },
  inProgress: {
    color: '#10B981',                    // 초록색 (진행중)
    bgColor: 'rgba(16, 185, 129, 0.8)'
  },
  finalReview: {
    color: '#8B5CF6',                    // 보라색 (최종검수)
    bgColor: 'rgba(139, 92, 246, 0.8)'
  },
  closed: {
    color: '#64748B',                    // 슬레이트 (종료)
    bgColor: 'rgba(100, 116, 139, 0.8)'
  },
};

// ============================================================
// 5. 유틸리티 함수
// ============================================================

/**
 * 영문 키로 상태 코드 조회
 * @param {string} key - 영문 키 (예: 'inProgress')
 * @returns {number} 상태 코드 (예: 88)
 */
export const getStatusCodeByKey = (key) => PROJECT_STATUS_MAP[key];

/**
 * 상태 코드로 영문 키 조회
 * @param {number} code - 상태 코드 (예: 88)
 * @returns {string} 영문 키 (예: 'inProgress')
 */
export const getStatusKeyByCode = (code) => PROJECT_STATUS_CODE_TO_KEY[code];

/**
 * 영문 키로 한글 라벨 조회
 * @param {string} key - 영문 키 (예: 'inProgress')
 * @returns {string} 한글 라벨 (예: '진행중')
 */
export const getStatusLabelByKey = (key) => PROJECT_STATUS_KEY_TO_LABEL[key];

/**
 * 한글 라벨로 영문 키 조회
 * @param {string} label - 한글 라벨 (예: '진행중')
 * @returns {string} 영문 키 (예: 'inProgress')
 */
export const getStatusKeyByLabel = (label) => PROJECT_STATUS_LABEL_TO_KEY[label];

/**
 * 영문 키로 색상 정보 조회
 * @param {string} key - 영문 키 (예: 'inProgress')
 * @returns {Object} 색상 객체 { color, bgColor }
 */
export const getStatusColorByKey = (key) => PROJECT_STATUS_COLORS[key];

/**
 * 한글 라벨로 상태 코드 조회
 * @param {string} label - 한글 라벨 (예: '진행중')
 * @returns {number} 상태 코드 (예: 88)
 */
export const getStatusCodeByLabel = (label) => {
  const key = PROJECT_STATUS_LABEL_TO_KEY[label];
  return PROJECT_STATUS_MAP[key];
};

// ============================================================
// 6. 프로젝트 진행 플로우 정의
// ============================================================

/**
 * 프로젝트 표준 진행 플로우 (순차적 프로세스)
 * StatusProgressIndicator에서 사용
 *
 * @description
 * - 정상적인 프로젝트 진행 단계를 순서대로 정의
 * - 보류/대기는 예외 상태이므로 별도 처리
 */
export const PROJECT_STATUS_FLOW = [
  '시작전',
  '진행중',
  '중간검수',
  '최종검수',
  '종료',
];

/**
 * 프로젝트 예외 상태 (플로우 분기)
 * - 보류/대기: 프로젝트가 일시 중단되었거나 대기 중인 상태
 */
export const PROJECT_EXCEPTION_STATUS = '보류/대기';

/**
 * 프로젝트 상태 타입 분류
 */
export const PROJECT_STATUS_TYPES = {
  // 진행 플로우에 포함되는 상태 (영문 키)
  FLOW_STATUSES: ['notStarted', 'inProgress', 'interimReview', 'finalReview', 'closed'],

  // 예외 상태 (플로우 외부)
  EXCEPTION_STATUSES: ['pendingWaiting'],
};

/**
 * 프로젝트 상태별 설명
 */
export const PROJECT_STATUS_DESCRIPTIONS = {
  pendingWaiting: '프로젝트가 보류되었거나 시작 대기 중인 상태',
  notStarted: '프로젝트 준비 단계',
  interimReview: '중간 검수 (내부 또는 발주기관 검수)',
  inProgress: '프로젝트 진행 중',
  finalReview: '고객 검수',
  closed: '프로젝트 종료',
};

/**
 * 프로젝트 상태 전환 규칙
 * 각 상태에서 전환 가능한 다음 상태 목록
 */
export const PROJECT_STATUS_TRANSITIONS = {
  '시작전': ['진행중', '보류/대기', '종료'],
  '보류/대기': ['시작전', '진행중', '종료'],
  '진행중': ['보류/대기', '중간검수', '고객검수', '종료'],  // 중간검수 skip 가능
  '중간검수': ['진행중', '고객검수', '종료'],
  '고객검수': ['진행중', '종료'],
  '종료': [], // 종료는 변경 불가
};

