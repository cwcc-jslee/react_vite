/**
 * @file projectDataUtils.js
 * @description 프로젝트 데이터 처리 관련 유틸리티 함수들
 */

import { aggregateTaskScheduleStatus } from './scheduleStatusUtils';
import {
  updateProjectsWithProgress,
  calculateProgressDistribution,
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

  // 진행중(88) 프로젝트만 필터링
  const inProgressProjects = allProjects.filter(
    (project) => project.pjtStatus?.id === 88,
  );

  // 기존 기능들은 진행중 프로젝트만 대상으로 처리
  const projectScheduleStatus = calculateProjectScheduleStatus(
    inProgressProjects,
    getScheduleStatus,
  );
  const projectsWithProgress = updateProjectsWithProgress(inProgressProjects);
  const taskScheduleStatus = aggregateTaskScheduleStatus(inProgressProjects);
  const remainingPeriodStatus = calculateRemainingPeriods(inProgressProjects);
  const progressDistribution = calculateProgressDistribution(projectsWithProgress);

  // 디버깅 로그
  console.log('====== 프로젝트 진행률 분포 결과', progressDistribution);

  // 프로젝트 상태별 카운터는 모든 프로젝트(종료 제외) 대상
  const projectStatusCount = calculateProjectStatusCount(allProjects);

  // 프로젝트 타입별 카운터는 모든 프로젝트(종료 제외) 대상
  const projectTypeCount = calculateProjectTypeCount(allProjects);

  // 팀별 카운터는 모든 프로젝트(종료 제외) 대상
  const teamCount = calculateTeamCount(allProjects);

  // 서비스별 카운터는 모든 프로젝트(종료 제외) 대상
  const serviceCount = calculateServiceCount(allProjects);

  return {
    // 프로젝트 일정 상태 (정상/지연/임박)
    projectScheduleStatus: projectScheduleStatus,
    // 태스크 일정 상태 (정상/지연/임박)
    taskScheduleStatus: taskScheduleStatus,
    // 프로젝트 남은 기간별 분포
    projectRemainingPeriod: remainingPeriodStatus,
    // 프로젝트 상태별 카운터 (보류/시작전/대기/진행중/검수)
    projectStatusCount: projectStatusCount,
    // 프로젝트 타입별 카운터 (매출/투자)
    projectTypeCount: projectTypeCount,
    // 팀별 프로젝트 카운터
    projectTeamCount: teamCount,
    // 서비스별 프로젝트 카운터
    projectServiceCount: serviceCount,
    // 프로젝트 진행률별 분포 (0-25%, 26-50%, ...)
    projectProgressDistribution: progressDistribution,
    // 진행률 계산된 프로젝트 목록 (내부 처리용)
    projectsWithProgress,
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
 * 프로젝트 상태별 카운터 계산 함수
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 상태별 카운터 객체
 */
export const calculateProjectStatusCount = (projects) => {
  const statusCount = {
    pending: 0, // 85: 보류
    notStarted: 0, // 86: 시작전
    waiting: 0, // 87: 대기
    inProgress: 0, // 88: 진행중
    review: 0, // 89: 검수
  };

  if (!Array.isArray(projects)) {
    return statusCount;
  }

  projects.forEach((project) => {
    const statusId = project.pjtStatus?.id;

    switch (statusId) {
      case 85:
        statusCount.pending++;
        break;
      case 86:
        statusCount.notStarted++;
        break;
      case 87:
        statusCount.waiting++;
        break;
      case 88:
        statusCount.inProgress++;
        break;
      case 89:
        statusCount.review++;
        break;
      default:
        break;
    }
  });

  return statusCount;
};

/**
 * 프로젝트 타입별 카운터 계산 함수
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 타입별 카운터 객체
 */
export const calculateProjectTypeCount = (projects) => {
  console.log('=== calculateProjectTypeCount 시작 ===');
  console.log('전체 프로젝트 수:', projects?.length || 0);

  const typeCount = {
    revenue: 0, // 매출
    investment: 0, // 투자
  };

  if (!Array.isArray(projects)) {
    console.log('❌ projects가 배열이 아님:', typeof projects);
    return typeCount;
  }

  projects.forEach((project, index) => {
    const projectType = project.projectType;
    console.log(`프로젝트 ${index + 1}:`, {
      id: project.id,
      projectType: projectType,
    });

    if (projectType === 'revenue') {
      typeCount.revenue++;
    } else if (projectType === 'investment') {
      typeCount.investment++;
    } else {
      console.log(`⚠️ 알 수 없는 projectType: "${projectType}"`);
    }
  });

  console.log('최종 타입별 카운트:', typeCount);
  console.log('=== calculateProjectTypeCount 종료 ===');
  return typeCount;
};

/**
 * 팀별 카운터 계산 함수 (동적 팀 이름 기준)
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 팀별 카운터 객체
 */
export const calculateTeamCount = (projects) => {
  const teamCount = {};

  if (!Array.isArray(projects)) {
    return teamCount;
  }

  projects.forEach((project) => {
    const teamName = project.team?.name;

    if (teamName) {
      if (teamCount[teamName]) {
        teamCount[teamName]++;
      } else {
        teamCount[teamName] = 1;
      }
    }
  });

  return teamCount;
};

/**
 * 서비스별 카운터 계산 함수 (동적 서비스 이름 기준)
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 서비스별 카운터 객체
 */
export const calculateServiceCount = (projects) => {
  const serviceCount = {};

  if (!Array.isArray(projects)) {
    return serviceCount;
  }

  projects.forEach((project) => {
    const serviceName = project.service?.name;

    if (serviceName) {
      if (serviceCount[serviceName]) {
        serviceCount[serviceName]++;
      } else {
        serviceCount[serviceName] = 1;
      }
    }
  });

  return serviceCount;
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
