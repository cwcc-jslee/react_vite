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

  if (Array.isArray(item.projectTasks)) {
    for (const task of item.projectTasks) {
      if (task.taskProgress?.name !== '100%') {
        const taskEnd = dayjs(task.planEndDate);
        if (today.isAfter(taskEnd, 'day')) return 'delayed';
        if (taskEnd.diff(today, 'day') <= 3) return 'imminent';
      }
    }
  }
  return 'normal';
}
