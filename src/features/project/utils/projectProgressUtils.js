/**
 * @file projectProgressUtils.js
 * @description 프로젝트 진행률 계산 관련 유틸리티 함수들
 */

/**
 * 프로젝트 진행률 계산 함수
 * Task별 계획시간을 가중치로 사용한 가중평균 방식
 * @param {Array} projectTasks - 프로젝트 태스크 배열
 * @returns {number} - 계산된 진행률 (0-100)
 */
export const calculateProjectProgress = (projectTasks) => {
  if (!projectTasks || projectTasks.length === 0) {
    return 0;
  }

  // isProgress가 true인 태스크만 필터링
  const progressEnabledTasks = projectTasks.filter(
    (task) => task.isProgress === true,
  );

  console.log('>>>>progressEnabledTasks', progressEnabledTasks);

  // 진행률 계산 대상 태스크가 없으면 0 반환
  if (progressEnabledTasks.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedProgress = 0;

  progressEnabledTasks.forEach((task) => {
    // Task 진행률 (code 값을 숫자로 변환, 기본값 0)
    const taskProgressValue = task.taskProgress?.code
      ? parseInt(task.taskProgress.code, 10)
      : 0;

    // Task 가중치 (계획시간 기준, 없으면 1로 설정)
    const taskWeight = task.planningTimeData?.totalPlannedHours || 1;

    totalWeight += taskWeight;
    weightedProgress += taskProgressValue * taskWeight;
  });

  // 가중 평균 계산
  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
};

/**
 * 프로젝트별 진행률 업데이트 함수
 * @param {Array} projects - 프로젝트 배열
 * @returns {Array} - 진행률이 추가된 프로젝트 배열
 */
export const updateProjectsWithProgress = (projects) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project) => ({
    ...project,
    calculatedProgress: calculateProjectProgress(project.projectTasks),
  }));
};

/**
 * 진행률별 프로젝트 분포 계산 함수
 * @param {Array} projectsWithProgress - 진행률이 계산된 프로젝트 배열
 * @returns {Object} - 진행률별 분포 객체
 */
export const calculateProgressDistribution = (projectsWithProgress) => {
  const distribution = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-90': 0,
    '91-100': 0,
    total: projectsWithProgress.length,
  };

  projectsWithProgress.forEach((project) => {
    const progress = project.calculatedProgress || 0;

    if (progress >= 0 && progress <= 25) {
      distribution['0-25']++;
    } else if (progress >= 26 && progress <= 50) {
      distribution['26-50']++;
    } else if (progress >= 51 && progress <= 75) {
      distribution['51-75']++;
    } else if (progress >= 76 && progress <= 90) {
      distribution['76-90']++;
    } else if (progress >= 91 && progress <= 100) {
      distribution['91-100']++;
    }
  });

  return distribution;
};

/**
 * 진행률 통계 정보 생성 함수
 * @param {Array} projectsWithProgress - 진행률이 계산된 프로젝트 배열
 * @returns {Object} - 진행률 통계 객체
 */
export const generateProgressStats = (projectsWithProgress) => {
  if (
    !Array.isArray(projectsWithProgress) ||
    projectsWithProgress.length === 0
  ) {
    return {
      totalProjects: 0,
      averageProgress: 0,
      distribution: calculateProgressDistribution([]),
      sampleProjects: [],
    };
  }

  const totalProgress = projectsWithProgress.reduce(
    (sum, project) => sum + (project.calculatedProgress || 0),
    0,
  );

  const averageProgress = Math.round(
    totalProgress / projectsWithProgress.length,
  );

  const distribution = calculateProgressDistribution(projectsWithProgress);

  const sampleProjects = projectsWithProgress.slice(0, 3).map((p) => ({
    id: p.id,
    calculatedProgress: p.calculatedProgress,
    taskCount: p.projectTasks?.length || 0,
  }));

  return {
    totalProjects: projectsWithProgress.length,
    averageProgress,
    distribution,
    sampleProjects,
  };
};
