// src/features/dashboard/constants/dashboardConstants.js
/**
 * 대시보드 관련 상수 정의
 */

import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * 통계 카드 설정
 */
export const STAT_CARD_CONFIGS = {
  pending: {
    id: 'pending',
    label: '승인 대기',
    icon: Clock,
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-200',
  },
  inProgress: {
    id: 'inProgress',
    label: '진행 중',
    icon: AlertCircle,
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
  },
  completed: {
    id: 'completed',
    label: '완료',
    icon: CheckCircle,
    color: 'green',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    textColor: 'text-green-900',
    borderColor: 'border-green-200',
  },
};

/**
 * 차트 색상
 */
export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  gray: '#6B7280',
};

/**
 * 자동 새로고침 간격 (밀리초)
 */
export const REFRESH_INTERVALS = {
  dashboardStats: 30000, // 30초
  approvalPending: 60000, // 1분
  myProjects: 120000, // 2분
};

/**
 * 승인 상태 라벨
 */
export const APPROVAL_STATUS_LABELS = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '반려',
};

/**
 * 승인 상태 색상
 */
export const APPROVAL_STATUS_COLORS = {
  pending: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};
