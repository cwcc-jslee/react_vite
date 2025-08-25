/**
 * @file projectListUtils.js
 * @description 프로젝트 목록 관련 유틸리티 함수들
 */

import { getScheduleStatus, getTaskStatus } from './scheduleStatusUtils';
import { calculateProjectProgress } from './projectProgressUtils';

/**
 * 프로젝트 아이템들에 일정 상태, 태스크 상태, 진행률을 추가하는 함수
 * @param {Array} items - 원본 프로젝트 아이템 배열
 * @returns {Array} - 강화된 데이터가 추가된 프로젝트 아이템 배열
 */
export const enhanceItemsWithScheduleStatus = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    scheduleStatus: getScheduleStatus(item),
    taskStatus: getTaskStatus(item),
    calculatedProgress: calculateProjectProgress(item.projectTasks),
  }));
};

/**
 * 프로젝트 상태별 통계를 계산하는 함수
 * @param {Array} items - 프로젝트 아이템 배열
 * @returns {Object} - 상태별 통계 객체
 */
export const calculateProjectStatusStats = (items) => {
  const stats = {
    total: 0,
    byStatus: {},
    byScheduleStatus: {
      normal: 0,
      imminent: 0,
      delayed: 0,
    },
  };

  if (!Array.isArray(items)) {
    return stats;
  }

  stats.total = items.length;

  items.forEach((item) => {
    // 프로젝트 상태별 통계
    const statusName = item.pjtStatus?.name || '알 수 없음';
    stats.byStatus[statusName] = (stats.byStatus[statusName] || 0) + 1;

    // 일정 상태별 통계
    const scheduleStatus = getScheduleStatus(item);
    if (scheduleStatus && stats.byScheduleStatus[scheduleStatus] !== undefined) {
      stats.byScheduleStatus[scheduleStatus]++;
    }
  });

  return stats;
};

/**
 * 프로젝트 목록 데이터를 검증하는 함수
 * @param {Array} items - 프로젝트 아이템 배열
 * @returns {Object} - 검증 결과
 */
export const validateProjectListData = (items) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!Array.isArray(items)) {
    validation.isValid = false;
    validation.errors.push('프로젝트 데이터가 배열이 아닙니다');
    return validation;
  }

  if (items.length === 0) {
    validation.warnings.push('프로젝트 목록이 비어있습니다');
  }

  // 각 프로젝트 아이템 검증
  items.forEach((item, index) => {
    if (!item.id) {
      validation.warnings.push(`프로젝트 ${index + 1}번에 ID가 없습니다`);
    }
    
    if (!item.pjtStatus) {
      validation.warnings.push(`프로젝트 ${index + 1}번에 상태 정보가 없습니다`);
    }
    
    if (!item.planEndDate) {
      validation.warnings.push(`프로젝트 ${index + 1}번에 계획 종료일이 없습니다`);
    }
  });

  return validation;
};

/**
 * 프로젝트 목록을 특정 기준으로 필터링하는 함수
 * @param {Array} items - 프로젝트 아이템 배열
 * @param {Object} filters - 필터 조건
 * @returns {Array} - 필터링된 프로젝트 배열
 */
export const filterProjectItems = (items, filters = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.filter((item) => {
    // 상태 필터
    if (filters.status && item.pjtStatus?.name !== filters.status) {
      return false;
    }

    // 일정 상태 필터
    if (filters.scheduleStatus) {
      const itemScheduleStatus = getScheduleStatus(item);
      if (itemScheduleStatus !== filters.scheduleStatus) {
        return false;
      }
    }

    // 태스크 상태 필터
    if (filters.taskStatus) {
      const itemTaskStatus = getTaskStatus(item);
      if (itemTaskStatus !== filters.taskStatus) {
        return false;
      }
    }

    // 검색어 필터 (프로젝트명)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const projectName = item.name?.toLowerCase() || '';
      if (!projectName.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * 로딩 상태와 에러 상태에 따른 UI 표시 데이터를 반환하는 함수
 * @param {string} status - 현재 상태 ('loading', 'succeeded', 'failed', 'idle')
 * @param {string} error - 에러 메시지
 * @returns {Object} - UI 표시용 데이터
 */
export const getListUIState = (status, error) => {
  return {
    isLoading: status === 'loading',
    hasError: status === 'failed',
    errorMessage: error || null,
    isEmpty: status === 'succeeded' && !error,
    showSkeleton: status === 'loading' || status === 'idle',
  };
};