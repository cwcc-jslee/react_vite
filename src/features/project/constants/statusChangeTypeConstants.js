// src/features/project/constants/statusChangeTypeConstants.js
/**
 * 프로젝트 상태 변경 유형 상수
 * - project_status_changes 테이블의 name 필드에 사용
 */

/**
 * 상태 변경 유형 코드
 */
export const STATUS_CHANGE_TYPE_CODES = {
  CREATE: 'CREATE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  INTERIM_REVIEW: 'INTERIM_REVIEW',
  FINAL_REVIEW: 'FINAL_REVIEW',
  CLOSE: 'CLOSE',
  RESUME: 'RESUME',
};

/**
 * 상태 변경 유형 정의
 */
export const STATUS_CHANGE_TYPE = {
  CREATE: {
    code: 'CREATE',
    label: '신규등록',
    description: '프로젝트 최초 생성',
  },
  STATUS_CHANGE: {
    code: 'STATUS_CHANGE',
    label: '상태변경',
    description: '일반 상태 전환',
  },
  INTERIM_REVIEW: {
    code: 'INTERIM_REVIEW',
    label: '중간검수',
    description: '중간검수 요청',
  },
  FINAL_REVIEW: {
    code: 'FINAL_REVIEW',
    label: '고객검수',
    description: '고객검수 요청',
  },
  CLOSE: {
    code: 'CLOSE',
    label: '종료',
    description: '프로젝트 종료 요청',
  },
  RESUME: {
    code: 'RESUME',
    label: '재개',
    description: '보류→진행 등 재시작',
  },
};

/**
 * 코드로 라벨 조회
 * @param {string} code - 상태 변경 유형 코드
 * @returns {string} 라벨
 */
export const getStatusChangeTypeLabel = (code) => {
  if (!code) return '미분류';
  const type = Object.values(STATUS_CHANGE_TYPE).find((t) => t.code === code);
  return type?.label || '미분류';
};

/**
 * 코드로 상태 변경 유형 객체 조회
 * @param {string} code - 상태 변경 유형 코드
 * @returns {object|null} 상태 변경 유형 객체
 */
export const getStatusChangeType = (code) => {
  return Object.values(STATUS_CHANGE_TYPE).find((t) => t.code === code) || null;
};

/**
 * 상태 변경에 따른 유형 코드 결정
 * @param {string} fromStatusName - 이전 상태명 (한글)
 * @param {string} toStatusName - 변경할 상태명 (한글)
 * @returns {string} 상태 변경 유형 코드
 */
export const determineStatusChangeType = (fromStatusName, toStatusName) => {
  // 중간검수
  if (toStatusName === '중간검수') {
    return STATUS_CHANGE_TYPE_CODES.INTERIM_REVIEW;
  }
  // 고객검수
  if (toStatusName === '고객검수') {
    return STATUS_CHANGE_TYPE_CODES.FINAL_REVIEW;
  }
  // 종료
  if (toStatusName === '종료') {
    return STATUS_CHANGE_TYPE_CODES.CLOSE;
  }
  // 재개 (보류/대기에서 다른 상태로)
  if (fromStatusName === '보류/대기' && toStatusName !== '보류/대기') {
    return STATUS_CHANGE_TYPE_CODES.RESUME;
  }
  // 그 외 일반 상태 변경
  return STATUS_CHANGE_TYPE_CODES.STATUS_CHANGE;
};
