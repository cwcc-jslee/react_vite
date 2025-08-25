/**
 * @file progressDisplayUtils.js
 * @description 프로젝트 진행률 표시 관련 유틸리티 함수들
 */

import { calculateProjectProgress } from './projectProgressUtils';

/**
 * 진행률에 따른 색상 클래스 반환
 * @param {number} progress - 진행률 (0-100)
 * @returns {Object} - 텍스트 및 배경 색상 클래스
 */
export const getProgressColorClasses = (progress) => {
  if (progress >= 75) {
    return {
      textClass: 'text-green-600',
      bgClass: 'bg-green-500',
      badgeClass: 'bg-green-100 text-green-800'
    };
  } else if (progress >= 50) {
    return {
      textClass: 'text-blue-600',
      bgClass: 'bg-blue-500',
      badgeClass: 'bg-blue-100 text-blue-800'
    };
  } else if (progress >= 25) {
    return {
      textClass: 'text-orange-600',
      bgClass: 'bg-orange-500',
      badgeClass: 'bg-orange-100 text-orange-800'
    };
  } else {
    return {
      textClass: 'text-red-600',
      bgClass: 'bg-red-500',
      badgeClass: 'bg-red-100 text-red-800'
    };
  }
};

/**
 * 진행률에 따른 상태 반환
 * @param {number} progress - 진행률 (0-100)
 * @returns {string} - 진행률 상태 ('success', 'normal')
 */
export const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success';
  return 'normal';
};

/**
 * 프로젝트 데이터에서 계산된 진행률을 우선적으로 반환
 * @param {Object} projectData - 프로젝트 데이터
 * @param {Array} projectTasks - 프로젝트 태스크 배열
 * @returns {number} - 최종 진행률
 */
export const getDisplayProgress = (projectData, projectTasks) => {
  // 1순위: calculatedProgress (가중평균 계산 결과)
  if (projectData?.calculatedProgress !== undefined) {
    return projectData.calculatedProgress;
  }

  // 2순위: 실시간 계산 (projectProgressUtils 사용)
  if (projectTasks?.length > 0) {
    const calculated = calculateProjectProgress(projectTasks);
    return calculated;
  }

  // 3순위: 기존 projectProgress 값
  if (projectData?.projectProgress !== undefined) {
    return projectData.projectProgress;
  }

  // 4순위: 단순 완료 비율 (fallback)
  if (projectTasks?.length > 0) {
    const completedCount = projectTasks.filter(task => {
      const progressCode = task.taskProgress?.code;
      return progressCode === '100' || progressCode === 100 || task.isCompleted;
    }).length;
    const simpleProgress = Math.round((completedCount / projectTasks.length) * 100);
    return simpleProgress;
  }

  return 0;
};

/**
 * 진행률 표시용 컴포넌트 데이터 생성
 * @param {Object} projectData - 프로젝트 데이터
 * @param {Array} projectTasks - 프로젝트 태스크 배열
 * @param {Object} options - 옵션 설정
 * @returns {Object} - 진행률 표시용 데이터
 */
export const generateProgressDisplayData = (projectData, projectTasks, options = {}) => {
  const progress = getDisplayProgress(projectData, projectTasks);
  const colorClasses = getProgressColorClasses(progress);
  const status = getProgressStatus(progress);
  
  const completedTasks = projectTasks?.filter(task => {
    const progressCode = task.taskProgress?.code;
    return progressCode === '100' || progressCode === 100 || task.isCompleted;
  }).length || 0;
  
  const totalTasks = projectTasks?.length || 0;

  return {
    progress,
    status,
    colorClasses,
    completedTasks,
    totalTasks,
    taskRatio: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '-',
    hasValidData: totalTasks > 0,
    displayText: options.showPercentage !== false ? `${progress}%` : progress.toString()
  };
};

/**
 * 진행률 차이 계산 및 분석
 * @param {number} calculatedProgress - 가중평균 계산 진행률
 * @param {number} simpleProgress - 단순 비율 계산 진행률
 * @returns {Object} - 진행률 차이 분석 결과
 */
export const analyzeProgressDifference = (calculatedProgress, simpleProgress) => {
  const difference = calculatedProgress - simpleProgress;
  const percentDiff = simpleProgress > 0 ? Math.round((difference / simpleProgress) * 100) : 0;
  
  let analysis = '동일';
  if (Math.abs(difference) >= 10) {
    analysis = difference > 0 ? '가중평균이 높음' : '단순비율이 높음';
  } else if (Math.abs(difference) >= 5) {
    analysis = difference > 0 ? '가중평균이 약간 높음' : '단순비율이 약간 높음';
  }
  
  return {
    difference,
    percentDiff,
    analysis,
    hasSignificantDiff: Math.abs(difference) >= 5
  };
};