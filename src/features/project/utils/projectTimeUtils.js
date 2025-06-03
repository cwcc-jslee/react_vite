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
 * 계획시간 검증 결과를 계산하는 함수
 * @param {number} totalAmount - 프로젝트 총 금액
 * @param {number} totalPlannedHours - 총 계획 시간
 * @returns {Object} - 검증 결과 정보
 */
export const validateProjectPlanningHours = (
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
      hourlyRate: 0,
    };
  }

  // 시간당 단가 계산 (기본값: 10만원)
  const hourlyRate = 100000;
  const expectedHours = Math.round(totalAmount / hourlyRate);

  // 검증 결과 계산
  const difference = totalPlannedHours - expectedHours;
  const percentage = Math.round((difference / expectedHours) * 100);

  // 상태 결정
  let status = 'normal';
  let message = '적정';

  if (percentage < -20) {
    status = 'warning';
    message = '부족';
  } else if (percentage > 20) {
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
