// src/features/dashboard/constants/approvalStyleConstants.js
/**
 * 승인 관련 스타일 상수
 * - 상태 변경 유형별 스타일 매핑
 * - ApprovalCard, ProjectEfficiencyCard 등에서 공통 사용
 */

import {
  STATUS_CHANGE_TYPE_CODES,
  getStatusChangeTypeLabel,
} from '@features/project/constants/statusChangeTypeConstants';

/**
 * 상태 변경 유형별 스타일 매핑
 */
export const APPROVAL_TYPE_STYLES = {
  [STATUS_CHANGE_TYPE_CODES.CREATE]: {
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
  },
  [STATUS_CHANGE_TYPE_CODES.INTERIM_REVIEW]: {
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
  },
  [STATUS_CHANGE_TYPE_CODES.FINAL_REVIEW]: {
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
  },
  [STATUS_CHANGE_TYPE_CODES.CLOSE]: {
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600',
  },
  [STATUS_CHANGE_TYPE_CODES.RESUME]: {
    color: 'bg-teal-100 text-teal-800',
    iconColor: 'text-teal-600',
  },
  [STATUS_CHANGE_TYPE_CODES.STATUS_CHANGE]: {
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600',
  },
};

/**
 * 미분류 스타일 (기본값)
 */
export const DEFAULT_APPROVAL_STYLE = {
  color: 'bg-gray-100 text-gray-800',
  iconColor: 'text-gray-600',
};

/**
 * 승인 관련 공통 색상 상수
 * - 상태별 색상, 액션 버튼 색상, 배경 색상 등
 */
export const APPROVAL_COLORS = {
  // 승인 상태별 색상
  status: {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  },

  // 액션 버튼 색상
  button: {
    approve:
      'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    reject:
      'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    cancel:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
  },

  // 배경 색상
  background: {
    section: 'bg-slate-50',
    card: 'bg-white',
    warning: 'bg-red-50 border-red-200',
    overlay: 'bg-black/50',
  },

  // 텍스트 색상
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    label: 'text-gray-700',
  },
};

/**
 * 공통 트랜지션 클래스
 */
export const TRANSITION_CLASSES = {
  default: 'transition-all duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
  button: 'transition-colors duration-200 active:scale-[0.98]',
};

/**
 * 상태 변경 유형 코드로 스타일 정보 조회
 * @param {string} changeTypeName - 상태 변경 유형 코드 (CREATE, STATUS_CHANGE 등)
 * @returns {object} { label, color, iconColor }
 */
export const getApprovalTypeStyle = (changeTypeName) => {
  const style = APPROVAL_TYPE_STYLES[changeTypeName] || DEFAULT_APPROVAL_STYLE;
  return {
    label: getStatusChangeTypeLabel(changeTypeName),
    ...style,
  };
};
