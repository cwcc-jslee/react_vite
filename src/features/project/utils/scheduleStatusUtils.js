import dayjs from 'dayjs';

/**
 * 프로젝트의 일정 상태(normal, imminent, delayed)를 계산하는 함수
 * @param {object} item 프로젝트 객체
 * @returns {string|null} 일정 상태 ('normal', 'imminent', 'delayed')
 */
export function getScheduleStatus(item) {
  const validStatus = ['진행중', '대기', '검수'];
  if (!item) return null;

  // 시작전, 보류는 일정 상태 계산하지 않음
  if (item.pjtStatus?.name === '시작전' || item.pjtStatus?.name === '보류')
    return null;

  // 완료일 비교 로직
  if (item.pjtStatus?.name === '완료') {
    if (!item.planEndDate || !item.endDate) return null;
    const plan = dayjs(item.planEndDate);
    const end = dayjs(item.endDate);
    return end.isAfter(plan, 'day') ? 'delayed' : 'normal';
  }

  if (!validStatus.includes(item.pjtStatus?.name)) return null;
  const today = dayjs();
  const plan = dayjs(item.planEndDate);

  if (today.isAfter(plan, 'day')) return 'delayed';
  if (plan.diff(today, 'day') <= 3) return 'imminent';

  return 'normal';
}

/**
 * 프로젝트의 개별 태스크 일정 지연 상태를 계산하는 함수
 * @param {object} item 프로젝트 객체
 * @returns {string} 태스크 상태 ('정상', '지연-N')
 */
export function getTaskStatus(item) {
  if (!item || !Array.isArray(item.projectTasks) || item.projectTasks.length === 0) {
    return '정상';
  }

  const today = dayjs();
  let delayedTaskCount = 0;

  for (const task of item.projectTasks) {
    // 완료되지 않은 태스크만 체크
    if (task.taskProgress?.name !== '100%' && task.planEndDate) {
      const taskEnd = dayjs(task.planEndDate);
      if (today.isAfter(taskEnd, 'day')) {
        delayedTaskCount++;
      }
    }
  }

  return delayedTaskCount > 0 ? `지연-${delayedTaskCount}` : '정상';
}

/**
 * 개별 태스크의 일정 상태를 계산하는 함수
 * @param {object} task 태스크 객체
 * @returns {string|null} 태스크 일정 상태 ('normal', 'imminent', 'delayed')
 */
export function getTaskScheduleStatus(task) {
  // 완료된 태스크는 일정 상태 계산하지 않음
  if (task.taskProgress?.name === '100%') {
    return null;
  }

  if (!task.planEndDate) {
    return null;
  }

  const today = dayjs();
  const taskEnd = dayjs(task.planEndDate);

  if (today.isAfter(taskEnd, 'day')) {
    return 'delayed';
  }
  
  if (taskEnd.diff(today, 'day') <= 3) {
    return 'imminent';
  }

  return 'normal';
}

/**
 * 전체 프로젝트의 태스크 일정 상태를 집계하는 함수
 * @param {Array} projects 프로젝트 배열
 * @returns {object} 태스크 일정 상태 집계 결과
 */
export function aggregateTaskScheduleStatus(projects) {
  const taskStatus = {
    normal: 0,
    delayed: 0,
    imminent: 0,
    total: 0,
  };

  if (!Array.isArray(projects)) {
    return taskStatus;
  }

  projects.forEach(project => {
    if (Array.isArray(project.projectTasks)) {
      project.projectTasks.forEach(task => {
        taskStatus.total++;
        const status = getTaskScheduleStatus(task);
        
        if (status) {
          taskStatus[status]++;
        } else {
          // 완료된 태스크나 계획일이 없는 태스크는 정상으로 분류
          taskStatus.normal++;
        }
      });
    }
  });

  return taskStatus;
}
