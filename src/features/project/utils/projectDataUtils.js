/**
 * @file projectDataUtils.js
 * @description 프로젝트 데이터 처리 관련 유틸리티 함수들
 */

import { aggregateTaskScheduleStatus } from './scheduleStatusUtils';
import { 
  updateProjectsWithProgress, 
  generateProgressStats 
} from './projectProgressUtils';
import { calculateRemainingPeriods } from './projectPeriodUtils';

/**
 * 프로젝트 일정 상태 계산 함수
 * @param {Array} projects - 프로젝트 배열
 * @param {Function} getScheduleStatus - 일정 상태 계산 함수
 * @returns {Object} - 프로젝트 일정 상태 집계
 */
export const calculateProjectScheduleStatus = (projects, getScheduleStatus) => {
  const scheduleStatus = {
    normal: 0,
    delayed: 0,
    imminent: 0,
    total: projects.length,
  };

  if (!Array.isArray(projects) || typeof getScheduleStatus !== 'function') {
    return scheduleStatus;
  }

  projects.forEach((project) => {
    const status = getScheduleStatus(project);

    if (status) {
      scheduleStatus[status]++;
    }
  });

  return scheduleStatus;
};

/**
 * 프로젝트 대시보드 데이터 처리 함수
 * @param {Array} allProjects - 전체 프로젝트 배열
 * @param {Function} getScheduleStatus - 일정 상태 계산 함수
 * @returns {Object} - 대시보드 데이터
 */
export const processDashboardData = (allProjects, getScheduleStatus) => {
  if (!Array.isArray(allProjects)) {
    throw new Error('프로젝트 데이터가 배열이 아닙니다.');
  }

  // 프로젝트 시간 상태 계산
  const projectScheduleStatus = calculateProjectScheduleStatus(allProjects, getScheduleStatus);

  // 프로젝트별 진행률 계산 및 업데이트
  const projectsWithProgress = updateProjectsWithProgress(allProjects);

  // 태스크 시간 상태 계산
  const taskScheduleStatus = aggregateTaskScheduleStatus(allProjects);
  
  // 남은 기간별 상태 계산
  const remainingPeriodStatus = calculateRemainingPeriods(allProjects);

  // 진행률 통계 생성
  const progressStats = generateProgressStats(projectsWithProgress);

  // 디버깅 로그
  console.log('====== 프로젝트 진행률 계산 결과', progressStats);

  return {
    // 프로젝트 일정 상태
    project: projectScheduleStatus,
    // 태스크 일정 상태
    task: taskScheduleStatus,
    // 남은 기간별 상태
    remainingPeriod: remainingPeriodStatus,
    // 진행률 계산된 프로젝트 목록
    projectsWithProgress,
    // 진행률별 분포
    progressDistribution: progressStats.distribution,
    // 진행률 통계
    progressStats,
  };
};

/**
 * API 응답 데이터 검증 함수
 * @param {Object} response - API 응답 객체
 * @returns {Object} - 검증 결과
 */
export const validateApiResponse = (response) => {
  const validation = {
    isValid: true,
    errors: [],
    data: null,
  };

  if (!response) {
    validation.isValid = false;
    validation.errors.push('응답 데이터가 없습니다.');
    return validation;
  }

  if (!response.meta || !response.meta.pagination) {
    validation.isValid = false;
    validation.errors.push('페이지네이션 정보를 가져올 수 없습니다.');
    return validation;
  }

  if (!Array.isArray(response.data)) {
    validation.isValid = false;
    validation.errors.push('프로젝트 데이터가 배열 형태가 아닙니다.');
    return validation;
  }

  validation.data = response.data;
  return validation;
};

/**
 * 페이지네이션 계산 함수
 * @param {number} totalItems - 전체 아이템 수
 * @param {number} pageSize - 페이지 크기
 * @returns {Object} - 페이지네이션 정보
 */
export const calculatePagination = (totalItems, pageSize) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    totalItems,
    totalPages,
    pageSize,
    hasMultiplePages: totalPages > 1,
  };
};

/**
 * 프로젝트 데이터 변환 함수
 * @param {Array} rawData - 원본 데이터
 * @param {Function} transformFn - 변환 함수
 * @returns {Array} - 변환된 데이터
 */
export const transformProjectData = (rawData, transformFn) => {
  if (!Array.isArray(rawData)) {
    return [];
  }

  if (typeof transformFn !== 'function') {
    return rawData;
  }

  try {
    return rawData.map(transformFn);
  } catch (error) {
    console.error('프로젝트 데이터 변환 중 오류:', error);
    return rawData;
  }
};