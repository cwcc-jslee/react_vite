// src/features/project/services/utilizationWeeklyService.js
/**
 * 주별 투입률 API 서비스
 * 특정 기간의 주별 투입률 데이터 계산
 */

import { apiService } from '@shared/api/apiService';
import { handleApiError } from '@shared/api/errorHandlers';
import { normalizeResponse } from '@shared/api/normalize';
import { buildUtilizationQuery, buildUsersQuery, buildUserTeamHistoriesQuery } from '../api/utilizationQueries';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { getUserMembershipDays } from '../utils/teamHistoryUtils';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * 근무일수 계산 (주말 제외)
 */
const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * 기간을 주 단위로 분할
 */
const splitIntoWeeks = (startDate, endDate) => {
  const weeks = [];
  let currentStart = dayjs(startDate).startOf('isoWeek'); // 월요일 시작
  const end = dayjs(endDate);

  let weekNumber = 1;

  while (currentStart.isBefore(end) || currentStart.isSame(end, 'day')) {
    const weekEnd = currentStart.endOf('isoWeek').isAfter(end)
      ? end
      : currentStart.endOf('isoWeek');

    // 실제 조회 기간과 겹치는 부분만
    const actualStart = currentStart.isBefore(dayjs(startDate))
      ? dayjs(startDate)
      : currentStart;
    const actualEnd = weekEnd.isAfter(dayjs(endDate))
      ? dayjs(endDate)
      : weekEnd;

    weeks.push({
      weekNumber,
      startDate: actualStart.format('YYYY-MM-DD'),
      endDate: actualEnd.format('YYYY-MM-DD'),
      workingDays: calculateWorkingDays(
        actualStart.format('YYYY-MM-DD'),
        actualEnd.format('YYYY-MM-DD')
      ),
      label: `W${weekNumber} (${actualStart.format('MM/DD')}~${actualEnd.format('MM/DD')})`,
    });

    currentStart = currentStart.add(1, 'week');
    weekNumber++;
  }

  return weeks;
};

/**
 * 투입률 계산
 */
const calculateUtilization = (workHours, baseHours) => {
  if (baseHours === 0) return 0;
  return Math.round((workHours / baseHours) * 100 * 10) / 10;
};

/**
 * 사용자 상태 판단
 */
const getUserStatus = (utilization, workHours) => {
  if (workHours === 0) return 'missing_work';
  if (utilization < 50) return 'low';
  return 'normal';
};

/**
 * 특정 주의 투입률 계산
 */
const processWeekUtilization = (works, users, weekInfo, userId = null, teamHistories = []) => {
  const { workingDays, startDate, endDate } = weekInfo;
  const dailyHours = 8;

  // userId 필터가 있으면 해당 사용자만 필터링
  const targetUsers = userId
    ? users.filter((user) => user.id === userId)
    : users;

  // Work 데이터를 사용자별로 그룹화
  const userWorksMap = {};
  works.forEach((work) => {
    const userId = work.user?.id;
    if (!userId) return;

    if (!userWorksMap[userId]) {
      userWorksMap[userId] = {
        userId,
        userName: work.user?.username,
        teamId: work.team?.id || work.user?.team?.id,
        teamName: work.team?.name || work.user?.team?.name,
        totalWorkHours: 0,
        workDays: new Set(),
      };
    }

    const workHours = parseFloat(work.workHours || 0);
    const nonBillableHours = parseFloat(work.nonBillableHours || 0);
    const overtimeHours = parseFloat(work.overtimeHours || 0);
    const totalHours = workHours + nonBillableHours + overtimeHours;

    userWorksMap[userId].totalWorkHours += totalHours;
    userWorksMap[userId].workDays.add(work.workDate);
  });

  // 팀별 데이터 구성
  const teamMap = {};
  targetUsers.forEach((user) => {
    const userId = user.id;
    const teamId = user.team?.id;
    const teamName = user.team?.name || '미지정';

    if (!teamMap[teamId]) {
      teamMap[teamId] = {
        teamId,
        teamName,
        memberCount: 0,
        baseHours: 0,
        workHours: 0,
        members: [],
      };
    }

    // 팀 이력 기반 소속 일수 계산 (팀 이력이 없으면 전체 근무일 사용)
    const membershipDays = getUserMembershipDays(
      teamHistories,
      userId,
      teamId,
      startDate,
      endDate,
      workingDays
    );

    const baseHours = membershipDays * dailyHours;
    const userWork = userWorksMap[userId] || { totalWorkHours: 0, workDays: new Set() };
    const workHours = userWork.totalWorkHours;
    const utilization = calculateUtilization(workHours, baseHours);

    teamMap[teamId].memberCount++;
    teamMap[teamId].baseHours += baseHours;
    teamMap[teamId].workHours += workHours;
    teamMap[teamId].members.push({
      userId,
      userName: user.username,
      membershipDays,
      baseHours,
      workHours: Math.round(workHours * 10) / 10,
      utilization,
      status: getUserStatus(utilization, workHours),
      workDays: userWork.workDays.size,
    });
  });

  // 팀별 투입률 계산
  const byTeam = Object.values(teamMap).map((team) => ({
    ...team,
    utilization: calculateUtilization(team.workHours, team.baseHours),
    workHours: Math.round(team.workHours * 10) / 10,
  }));

  // 전체 요약 (필터링된 사용자 기준)
  const totalUsers = targetUsers.length;
  const totalBaseHours = totalUsers * workingDays * dailyHours;
  const totalWorkHours = byTeam.reduce((sum, team) => sum + team.workHours, 0);
  const totalUtilization = calculateUtilization(totalWorkHours, totalBaseHours);

  return {
    summary: {
      totalUtilization,
      totalUsers,
      totalBaseHours,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
    },
    byTeam: byTeam.sort((a, b) => b.utilization - a.utilization),
  };
};

/**
 * 주별 투입률 API 서비스
 */
export const utilizationWeeklyService = {
  /**
   * 주별 투입률 데이터 조회
   */
  getWeeklyUtilizationData: async (params) => {
    try {
      const { startDate, endDate, teamId, userId, includeNonTrackedTeams = false } = params;

      console.log('=== 주별 투입률 API 호출 ===');
      console.log('기간:', startDate, '~', endDate);
      console.log('팀 ID:', teamId);
      console.log('사용자 ID:', userId);
      console.log('work 미추적 팀 포함:', includeNonTrackedTeams);

      // 1. 기간을 주 단위로 분할
      const weeks = splitIntoWeeks(startDate, endDate);
      console.log('주 분할 완료:', weeks.length, '주');

      // 2. 사용자 목록 조회 (한 번만 - 전체 기간 기준)
      const userQuery = buildUsersQuery({
        teamId,
        blocked: false,
        includeNonTrackedTeams
      });
      const userResponse = await apiService.get(`/users?${userQuery}`);
      const rawUsers = userResponse.data || [];
      const users = Array.isArray(rawUsers)
        ? convertKeysToCamelCase(rawUsers)
        : convertKeysToCamelCase(rawUsers.data || []);

      console.log('사용자 목록 조회:', users.length, '명');

      // 3. 팀 이력 조회 (전체 기간 기준)
      const historyQuery = buildUserTeamHistoriesQuery({
        teamId,
        userId,
        startDate,
        endDate,
      });
      const historyResponse = await apiService.get(`/user-team-histories?${historyQuery}`);
      const normalizedHistory = normalizeResponse(historyResponse);
      const teamHistories = convertKeysToCamelCase(normalizedHistory.data || []);

      console.log('팀 이력 조회:', teamHistories.length, '건');

      // 4. 각 주별로 Work 데이터 조회 및 투입률 계산
      const weeklyData = await Promise.all(
        weeks.map(async (weekInfo, index) => {
          const workQuery = buildUtilizationQuery({
            startDate: weekInfo.startDate,
            endDate: weekInfo.endDate,
            teamId,
            userId,
          });

          const workResponse = await apiService.get(`/works?${workQuery}`);
          const normalizedWork = normalizeResponse(workResponse);
          const works = convertKeysToCamelCase(normalizedWork.data || []);

          // 해당 주의 투입률 계산 (팀 이력 포함)
          const utilization = processWeekUtilization(works, users, weekInfo, userId, teamHistories);

          // 이전 주 대비 변화율 계산 (2주차부터)
          let trend = 'stable';
          let changeFromPrevious = 0;

          return {
            ...weekInfo,
            ...utilization,
            trend,
            changeFromPrevious,
          };
        })
      );

      // 이전 주 대비 변화율 계산
      for (let i = 1; i < weeklyData.length; i++) {
        const current = weeklyData[i].summary.totalUtilization;
        const previous = weeklyData[i - 1].summary.totalUtilization;
        weeklyData[i].changeFromPrevious = Math.round((current - previous) * 10) / 10;

        if (weeklyData[i].changeFromPrevious > 2) {
          weeklyData[i].trend = 'up';
        } else if (weeklyData[i].changeFromPrevious < -2) {
          weeklyData[i].trend = 'down';
        } else {
          weeklyData[i].trend = 'stable';
        }
      }

      // 4. 통계 계산
      const utilizationValues = weeklyData.map((w) => w.summary.totalUtilization);
      const averageUtilization =
        Math.round((utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length) * 10) / 10;

      const sortedWeeks = [...weeklyData].sort(
        (a, b) => b.summary.totalUtilization - a.summary.totalUtilization
      );

      const statistics = {
        averageUtilization,
        highestWeek: {
          weekNumber: sortedWeeks[0].weekNumber,
          utilization: sortedWeeks[0].summary.totalUtilization,
          label: sortedWeeks[0].label,
        },
        lowestWeek: {
          weekNumber: sortedWeeks[sortedWeeks.length - 1].weekNumber,
          utilization: sortedWeeks[sortedWeeks.length - 1].summary.totalUtilization,
          label: sortedWeeks[sortedWeeks.length - 1].label,
        },
        trend:
          weeklyData.filter((w) => w.trend === 'up').length >
          weeklyData.filter((w) => w.trend === 'down').length
            ? 'improving'
            : weeklyData.filter((w) => w.trend === 'down').length >
              weeklyData.filter((w) => w.trend === 'up').length
            ? 'declining'
            : 'stable',
      };

      console.log('주별 투입률 계산 완료');
      console.log('평균 투입률:', averageUtilization, '%');
      console.log('추세:', statistics.trend);

      return {
        period: { start: startDate, end: endDate },
        weeks: weeklyData,
        statistics,
      };
    } catch (error) {
      handleApiError(error, '주별 투입률 데이터를 불러오는 중 오류가 발생했습니다.');
      throw error;
    }
  },
};
