import { PROJECT_COST_CONSTANTS } from '../constants/initialState';
import { calculateProjectPrice } from './projectPriceUtils';

/**
 * 프로젝트의 총 계획 시간을 계산하는 함수
 * @param {Array} projectTasks - 프로젝트 태스크 배열
 * @returns {number} - 총 계획 시간 (시간 단위)
 */
export const calculateProjectTotalPlannedHours = (projectTasks = []) => {
  if (!Array.isArray(projectTasks) || projectTasks.length === 0) {
    return 0;
  }

  return projectTasks.reduce((total, task) => {
    const plannedHours = task.planningTimeData?.totalPlannedHours || 0;
    return total + plannedHours;
  }, 0);
};

/**
 * 계획시간 검증 결과를 계산하는 함수 (프로젝트 금액 기반)
 * @param {Object} projectData - 프로젝트 데이터 (team, service, sfa 정보 포함)
 * @param {number} totalPlannedHours - 총 계획 시간
 * @returns {Object} - 검증 결과 정보
 */
export const validateProjectPlanningHours = (
  projectData = null,
  totalPlannedHours = 0,
) => {
  // 프로젝트 데이터가 없는 경우
  if (!projectData) {
    return {
      expectedHours: 0,
      difference: 0,
      percentage: 0,
      status: 'disabled',
      message: '정보없음',
      hourlyRate: PROJECT_COST_CONSTANTS.HOURLY_RATE,
      totalAmount: 0,
    };
  }

  // 프로젝트 금액 계산
  const totalAmount = calculateProjectPrice(projectData);

  // 매출정보가 없는 경우
  if (!totalAmount) {
    return {
      expectedHours: 0,
      difference: 0,
      percentage: 0,
      status: 'disabled',
      message: '정보없음',
      hourlyRate: PROJECT_COST_CONSTANTS.HOURLY_RATE,
      totalAmount: 0,
    };
  }

  // 시간당 단가 사용 (94,000원)
  const hourlyRate = PROJECT_COST_CONSTANTS.HOURLY_RATE;
  const expectedHours = Math.round(totalAmount / hourlyRate);

  // 검증 결과 계산
  const difference = totalPlannedHours - expectedHours;
  const percentage = expectedHours > 0 ? Math.round((difference / expectedHours) * 100) : 0;

  // 상태 결정
  let status = 'normal';
  let message = '적정';

  if (percentage < -20) {
    status = 'warning';
    message = '부족';
  } else if (percentage > 5) {
    status = 'error';
    message = '초과';
  } else if (percentage < -10) {
    status = 'caution';
    message = '주의';
  }

  return {
    expectedHours,
    difference,
    percentage,
    status,
    message,
    hourlyRate,
    totalAmount,
  };
};

/**
 * 기존 방식의 계획시간 검증 함수 (하위호환성 유지)
 * @param {number} totalAmount - 프로젝트 총 금액
 * @param {number} totalPlannedHours - 총 계획 시간
 * @returns {Object} - 검증 결과 정보
 */
export const validateProjectPlanningHoursLegacy = (
  totalAmount = 0,
  totalPlannedHours = 0,
) => {
  // 매출정보가 없는 경우
  if (!totalAmount) {
    return {
      expectedHours: 0,
      difference: 0,
      percentage: 0,
      status: 'disabled',
      message: '정보없음',
      hourlyRate: PROJECT_COST_CONSTANTS.HOURLY_RATE,
    };
  }

  // 시간당 단가 사용 (94,000원)
  const hourlyRate = PROJECT_COST_CONSTANTS.HOURLY_RATE;
  const expectedHours = Math.round(totalAmount / hourlyRate);

  // 검증 결과 계산
  const difference = totalPlannedHours - expectedHours;
  const percentage = expectedHours > 0 ? Math.round((difference / expectedHours) * 100) : 0;

  // 상태 결정
  let status = 'normal';
  let message = '적정';

  if (percentage < -20) {
    status = 'warning';
    message = '부족';
  } else if (percentage > 5) {
    status = 'error';
    message = '초과';
  } else if (percentage < -10) {
    status = 'caution';
    message = '주의';
  }

  return {
    expectedHours,
    difference,
    percentage,
    status,
    message,
    hourlyRate,
  };
};
