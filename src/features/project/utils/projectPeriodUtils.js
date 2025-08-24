/**
 * @file projectPeriodUtils.js
 * @description 프로젝트 기간 관련 유틸리티 함수들
 */

/**
 * 남은 기간별 상태 계산 함수
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 남은 기간별 상태 객체
 */
export const calculateRemainingPeriods = (projects) => {
  const remainingPeriodStatus = {
    overdue2Month: 0,     // 2달 이상 초과
    overdue1Month: 0,     // 1달 이상 초과
    imminent: 0,          // 임박 (7일 이하)
    oneMonth: 0,          // 1달 이내
    twoMonths: 0,         // 2달 이내
    threeMonths: 0,       // 3달 이내
    longTerm: 0,          // 3달 이상
    total: projects.length,
  };

  if (!Array.isArray(projects)) {
    return remainingPeriodStatus;
  }

  projects.forEach((project) => {
    // endDate가 없으면 planEndDate 사용
    const endDate = project?.endDate || project?.planEndDate;
    
    if (!endDate) return;

    const today = new Date();
    const projectEndDate = new Date(endDate);
    
    // 시간을 제거하고 날짜만 비교
    today.setHours(0, 0, 0, 0);
    projectEndDate.setHours(0, 0, 0, 0);
    
    const diffTime = projectEndDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // 기간 초과
      const overdueDays = Math.abs(diffDays);
      if (overdueDays >= 60) { // 2달(60일) 이상 초과
        remainingPeriodStatus.overdue2Month++;
      } else if (overdueDays >= 30) { // 1달(30일) 이상 초과
        remainingPeriodStatus.overdue1Month++;
      }
    } else if (diffDays <= 7) {
      // 임박 (7일 이하)
      remainingPeriodStatus.imminent++;
    } else if (diffDays <= 30) {
      // 1달 이내
      remainingPeriodStatus.oneMonth++;
    } else if (diffDays <= 60) {
      // 2달 이내
      remainingPeriodStatus.twoMonths++;
    } else if (diffDays <= 90) {
      // 3달 이내
      remainingPeriodStatus.threeMonths++;
    } else {
      // 3달 이상
      remainingPeriodStatus.longTerm++;
    }
  });

  return remainingPeriodStatus;
};

/**
 * 프로젝트 기간 상태 분류 함수
 * @param {Object} project - 프로젝트 객체
 * @returns {string} - 기간 상태 ('overdue2Month', 'overdue1Month', 'imminent', 'oneMonth', 'twoMonths', 'threeMonths', 'longTerm')
 */
export const getProjectPeriodStatus = (project) => {
  if (!project) return null;

  const endDate = project?.endDate || project?.planEndDate;
  if (!endDate) return null;

  const today = new Date();
  const projectEndDate = new Date(endDate);
  
  // 시간을 제거하고 날짜만 비교
  today.setHours(0, 0, 0, 0);
  projectEndDate.setHours(0, 0, 0, 0);
  
  const diffTime = projectEndDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    // 기간 초과
    const overdueDays = Math.abs(diffDays);
    if (overdueDays >= 60) return 'overdue2Month'; // 2달 이상 초과
    if (overdueDays >= 30) return 'overdue1Month'; // 1달 이상 초과
    return 'overdue1Month'; // 기본 초과
  } else if (diffDays <= 7) {
    return 'imminent'; // 임박
  } else if (diffDays <= 30) {
    return 'oneMonth'; // 1달 이내
  } else if (diffDays <= 60) {
    return 'twoMonths'; // 2달 이내
  } else if (diffDays <= 90) {
    return 'threeMonths'; // 3달 이내
  } else {
    return 'longTerm'; // 3달 이상
  }
};

/**
 * 기간 상태별 통계 계산 함수
 * @param {Array} projects - 프로젝트 배열
 * @returns {Object} - 기간 상태별 통계
 */
export const calculatePeriodStats = (projects) => {
  const stats = {
    total: 0,
    overdue: 0,
    upcoming: 0,
    longTerm: 0,
    noDate: 0,
  };

  if (!Array.isArray(projects)) {
    return stats;
  }

  stats.total = projects.length;

  projects.forEach(project => {
    const endDate = project?.endDate || project?.planEndDate;
    
    if (!endDate) {
      stats.noDate++;
      return;
    }

    const periodStatus = getProjectPeriodStatus(project);
    
    if (periodStatus === 'overdue2Month' || periodStatus === 'overdue1Month') {
      stats.overdue++;
    } else if (periodStatus === 'imminent' || periodStatus === 'oneMonth') {
      stats.upcoming++;
    } else {
      stats.longTerm++;
    }
  });

  return stats;
};