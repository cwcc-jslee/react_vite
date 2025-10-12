// src/features/project/utils/teamHistoryUtils.js

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * 특정 기간 동안 사용자가 특정 팀에 소속된 일수 계산
 * @param {Array} teamHistories - 사용자의 팀 이력 배열
 * @param {number} userId - 사용자 ID
 * @param {number} teamId - 팀 ID
 * @param {string} periodStart - 기간 시작일 (YYYY-MM-DD)
 * @param {string} periodEnd - 기간 종료일 (YYYY-MM-DD)
 * @returns {number} 소속 일수 (주말 제외)
 */
export const calculateTeamMembershipDays = (
  teamHistories,
  userId,
  teamId,
  periodStart,
  periodEnd
) => {
  // 해당 사용자 & 팀의 이력 필터링
  const relevantHistories = teamHistories.filter(
    (history) =>
      history.user?.id === userId &&
      history.team?.id === teamId
  );

  if (relevantHistories.length === 0) {
    return 0;
  }

  let totalDays = 0;

  relevantHistories.forEach((history) => {
    // 이력의 실제 시작일과 종료일 계산
    const historyStart = dayjs(history.startDate);
    const historyEnd = history.endDate ? dayjs(history.endDate) : dayjs(periodEnd);

    // 조회 기간과 겹치는 구간 계산
    const overlapStart = historyStart.isAfter(dayjs(periodStart))
      ? historyStart
      : dayjs(periodStart);
    const overlapEnd = historyEnd.isBefore(dayjs(periodEnd))
      ? historyEnd
      : dayjs(periodEnd);

    // 겹치는 기간이 있으면 근무일 계산
    if (overlapStart.isSameOrBefore(overlapEnd)) {
      totalDays += calculateWorkingDays(
        overlapStart.format('YYYY-MM-DD'),
        overlapEnd.format('YYYY-MM-DD')
      );
    }
  });

  return totalDays;
};

/**
 * 근무일수 계산 (주말 제외)
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 * @returns {number} 근무일수
 */
export const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 일요일(0), 토요일(6) 제외
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * 특정 날짜에 사용자가 소속된 팀 조회
 * @param {Array} teamHistories - 사용자의 팀 이력 배열
 * @param {number} userId - 사용자 ID
 * @param {string} targetDate - 조회 날짜 (YYYY-MM-DD)
 * @returns {Object|null} 팀 정보 또는 null
 */
export const getTeamAtDate = (teamHistories, userId, targetDate) => {
  const target = dayjs(targetDate);

  const history = teamHistories.find(
    (h) =>
      h.user?.id === userId &&
      dayjs(h.startDate).isSameOrBefore(target) &&
      (!h.endDate || dayjs(h.endDate).isSameOrAfter(target))
  );

  return history ? history.team : null;
};

/**
 * 특정 날짜에 특정 팀에 소속된 모든 사용자 ID 조회
 * @param {Array} teamHistories - 팀 이력 배열
 * @param {number} teamId - 팀 ID
 * @param {string} targetDate - 조회 날짜 (YYYY-MM-DD)
 * @returns {Array<number>} 사용자 ID 배열
 */
export const getTeamMembersAtDate = (teamHistories, teamId, targetDate) => {
  const target = dayjs(targetDate);

  const members = teamHistories.filter(
    (h) =>
      h.team?.id === teamId &&
      dayjs(h.startDate).isSameOrBefore(target) &&
      (!h.endDate || dayjs(h.endDate).isSameOrAfter(target))
  );

  return members.map((m) => m.user?.id).filter((id) => id != null);
};

/**
 * 사용자별 팀 소속 기간 맵 생성
 * @param {Array} teamHistories - 팀 이력 배열
 * @param {Array} users - 사용자 목록
 * @param {string} periodStart - 기간 시작일
 * @param {string} periodEnd - 기간 종료일
 * @returns {Object} { userId: { teamId: membershipDays } }
 */
export const buildUserTeamMembershipMap = (
  teamHistories,
  users,
  periodStart,
  periodEnd
) => {
  const membershipMap = {};

  users.forEach((user) => {
    membershipMap[user.id] = {};

    // 사용자의 모든 팀 이력 조회
    const userHistories = teamHistories.filter((h) => h.user?.id === user.id);

    // 각 팀별로 소속 일수 계산
    const uniqueTeams = [
      ...new Set(userHistories.map((h) => h.team?.id).filter((id) => id != null)),
    ];

    uniqueTeams.forEach((teamId) => {
      const days = calculateTeamMembershipDays(
        teamHistories,
        user.id,
        teamId,
        periodStart,
        periodEnd
      );
      if (days > 0) {
        membershipMap[user.id][teamId] = days;
      }
    });
  });

  return membershipMap;
};

/**
 * 사용자가 특정 기간 동안 현재 팀에 소속된 일수 계산
 * 팀 이력이 없으면 전체 근무일 반환 (기존 로직 유지)
 * @param {Array} teamHistories - 팀 이력 배열
 * @param {number} userId - 사용자 ID
 * @param {number} currentTeamId - 현재 팀 ID
 * @param {string} periodStart - 기간 시작일
 * @param {string} periodEnd - 기간 종료일
 * @param {number} totalWorkingDays - 전체 근무일수 (폴백용)
 * @returns {number} 소속 일수
 */
export const getUserMembershipDays = (
  teamHistories,
  userId,
  currentTeamId,
  periodStart,
  periodEnd,
  totalWorkingDays
) => {
  // 팀 이력이 없으면 전체 근무일 반환 (하위 호환성)
  if (!teamHistories || teamHistories.length === 0) {
    return totalWorkingDays;
  }

  // 해당 사용자의 이력 조회
  const userHistories = teamHistories.filter((h) => h.user?.id === userId);

  // 사용자 이력이 없으면 전체 근무일 반환 (하위 호환성)
  if (userHistories.length === 0) {
    return totalWorkingDays;
  }

  // 현재 팀에 소속된 일수 계산
  const membershipDays = calculateTeamMembershipDays(
    teamHistories,
    userId,
    currentTeamId,
    periodStart,
    periodEnd
  );

  return membershipDays;
};
