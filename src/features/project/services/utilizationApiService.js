// src/features/project/services/utilizationApiService.js
/**
 * 투입률 API 서비스
 * Work 데이터를 기반으로 투입률을 계산
 */

import { apiService } from '@shared/api/apiService';
import { handleApiError } from '@shared/api/errorHandlers';
import { normalizeResponse } from '@shared/api/normalize';
import { buildUtilizationQuery, buildUsersQuery, buildTeamsQuery, buildUserTeamHistoriesQuery } from '../api/utilizationQueries';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { getUserMembershipDays } from '../utils/teamHistoryUtils';

/**
 * 근무일수 계산 (주말 제외, 공휴일 미적용)
 */
const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    // 주말(토:6, 일:0) 제외
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * Work 데이터를 사용자별로 그룹화
 */
const groupWorksByUser = (works) => {
  const grouped = {};

  works.forEach((work) => {
    const userId = work.user?.id;
    if (!userId) return;

    if (!grouped[userId]) {
      grouped[userId] = {
        userId,
        userName: work.user?.username || '알 수 없음',
        teamId: work.team?.id || work.user?.team?.id,
        teamName: work.team?.name || work.user?.team?.name || '미지정',
        works: [],
        totalWorkHours: 0,
      };
    }

    grouped[userId].works.push(work);
    grouped[userId].totalWorkHours += parseFloat(work.workHours || 0);
  });

  return Object.values(grouped);
};

/**
 * Work 데이터를 팀별로 그룹화
 */
const groupWorksByTeam = (works) => {
  const grouped = {};

  works.forEach((work) => {
    const teamId = work.team?.id || work.user?.team?.id;
    const teamName = work.team?.name || work.user?.team?.name || '미지정';

    if (!grouped[teamId]) {
      grouped[teamId] = {
        teamId,
        teamName,
        works: [],
        users: new Set(),
      };
    }

    grouped[teamId].works.push(work);
    if (work.user?.id) {
      grouped[teamId].users.add(work.user.id);
    }
  });

  return Object.values(grouped).map((group) => ({
    ...group,
    users: Array.from(group.users),
    memberCount: group.users.length,
  }));
};

/**
 * 투입률 계산
 */
const calculateUtilization = (workHours, baseHours) => {
  if (baseHours === 0) return 0;
  return Math.round((workHours / baseHours) * 100 * 10) / 10; // 소수점 1자리
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
 * 투입률 데이터 계산
 */
const processUtilizationData = (works, users, startDate, endDate, teamHistories = []) => {
  const workingDays = calculateWorkingDays(startDate, endDate);
  const dailyHours = 8;

  console.log('=== 투입률 계산 시작 ===');
  console.log('Work 데이터 개수:', works.length);
  console.log('User 데이터 개수:', users.length);
  console.log('근무일수:', workingDays);

  // Work 데이터를 사용자별로 그룹화
  const userWorksMap = {};
  works.forEach((work, index) => {
    const userId = work.user?.id;
    if (!userId) {
      console.warn('Work 데이터에 user.id 없음:', work);
      return;
    }

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

    // 모든 작업 시간 합산: work_hours + non_billable_hours + overtime_hours
    const workHours = parseFloat(work.workHours || 0);
    const nonBillableHours = parseFloat(work.nonBillableHours || 0);
    const overtimeHours = parseFloat(work.overtimeHours || 0);
    const totalHours = workHours + nonBillableHours + overtimeHours;

    const workDate = work.workDate;

    if (index === 0) {
      console.log('첫 Work 데이터 시간 파싱:', {
        workHours,
        nonBillableHours,
        overtimeHours,
        totalHours,
        workDate,
      });
    }

    userWorksMap[userId].totalWorkHours += totalHours;
    userWorksMap[userId].workDays.add(workDate);
  });

  console.log('사용자별 작업 집계:', Object.keys(userWorksMap).length, '명');
  console.log('첫 번째 사용자 작업 데이터:', Object.values(userWorksMap)[0]);

  // 팀별 데이터 구성
  const teamMap = {};

  users.forEach((user, index) => {
    const userId = user.id;
    const teamId = user.team?.id;
    const teamName = user.team?.name || '미지정';

    if (index === 0) {
      console.log('첫 User 데이터:', { userId, teamId, teamName, username: user.username });
    }

    // 팀 초기화
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

    if (index === 0) {
      console.log('첫 사용자 계산:', {
        userId,
        membershipDays,
        baseHours,
        workHours,
        utilization,
        hasWorkData: !!userWorksMap[userId],
      });
    }

    // 팀에 사용자 추가
    teamMap[teamId].memberCount++;
    teamMap[teamId].baseHours += baseHours;
    teamMap[teamId].workHours += workHours;
    teamMap[teamId].members.push({
      userId,
      userName: user.username,
      membershipDays: workingDays,
      baseHours,
      workHours: Math.round(workHours * 10) / 10,
      utilization,
      status: getUserStatus(utilization, workHours),
      workDays: userWork.workDays.size,
    });
  });

  console.log('팀 구성 완료 - 팀 수:', Object.keys(teamMap).length);
  console.log('첫 번째 팀 데이터:', Object.values(teamMap)[0]);

  // 팀별 투입률 계산
  const byTeam = Object.values(teamMap).map((team) => ({
    ...team,
    utilization: calculateUtilization(team.workHours, team.baseHours),
    workHours: Math.round(team.workHours * 10) / 10,
  }));

  // 전체 요약
  const totalUsers = users.length;
  const totalBaseHours = totalUsers * workingDays * dailyHours;
  const totalWorkHours = byTeam.reduce((sum, team) => sum + team.workHours, 0);
  const totalUtilization = calculateUtilization(totalWorkHours, totalBaseHours);

  return {
    period: {
      start: startDate,
      end: endDate,
      workingDays,
    },
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
 * 투입률 API 서비스
 */
export const utilizationApiService = {
  /**
   * 투입률 데이터 조회
   */
  getUtilizationData: async (params) => {
    try {
      const { startDate, endDate, teamId } = params;

      console.log('=== 투입률 API 호출 ===');
      console.log('기간:', startDate, '~', endDate);
      console.log('팀 ID:', teamId);

      // 1. Work 데이터 조회
      const workQuery = buildUtilizationQuery({
        startDate,
        endDate,
        teamId,
      });
      console.log('Work 쿼리:', `/works?${workQuery.substring(0, 200)}...`);

      const workResponse = await apiService.get(`/works?${workQuery}`);
      const normalizedWork = normalizeResponse(workResponse);
      const works = convertKeysToCamelCase(normalizedWork.data || []);

      console.log('Work 응답 데이터 샘플 (첫 번째):', works[0]);
      console.log('Work 총 개수:', works.length);

      // 2. 사용자 목록 조회 (차단되지 않은 사용자만)
      const userQuery = buildUsersQuery({ teamId, blocked: false });
      console.log('User 쿼리:', `/users?${userQuery.substring(0, 200)}...`);

      const userResponse = await apiService.get(`/users?${userQuery}`);

      // users-permissions API는 data 래핑 없이 직접 배열 반환
      const rawUsers = userResponse.data || [];
      console.log('User 원본 응답 샘플:', rawUsers[0]);

      // camelCase 변환 (users-permissions는 normalize 불필요)
      const users = Array.isArray(rawUsers)
        ? convertKeysToCamelCase(rawUsers)
        : convertKeysToCamelCase(rawUsers.data || []);

      console.log('User 변환 후 샘플 (첫 번째):', users[0]);
      console.log('User 총 개수:', users.length);

      // 3. 팀 이력 조회
      const historyQuery = buildUserTeamHistoriesQuery({
        teamId,
        startDate,
        endDate,
      });
      const historyResponse = await apiService.get(`/user-team-histories?${historyQuery}`);
      const normalizedHistory = normalizeResponse(historyResponse);
      const teamHistories = convertKeysToCamelCase(normalizedHistory.data || []);

      console.log('팀 이력 조회:', teamHistories.length, '건');

      // 4. 투입률 계산 (팀 이력 포함)
      const utilizationData = processUtilizationData(works, users, startDate, endDate, teamHistories);

      console.log('계산 완료 - 팀 수:', utilizationData.byTeam.length);
      console.log('계산 완료 - 전체 투입률:', utilizationData.summary.totalUtilization, '%');

      // 4. 개인별 상위/하위 추출
      const allMembers = utilizationData.byTeam.flatMap((team) =>
        team.members.map((member) => ({
          ...member,
          teamName: team.teamName,
        }))
      );

      const topUsers = allMembers
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 10);

      const bottomUsers = allMembers
        .filter((m) => m.utilization < 70 || m.status === 'missing_work')
        .sort((a, b) => a.utilization - b.utilization)
        .slice(0, 5);

      return {
        ...utilizationData,
        topUsers,
        bottomUsers,
      };
    } catch (error) {
      handleApiError(error, '투입률 데이터를 불러오는 중 오류가 발생했습니다.');
      throw error;
    }
  },

  /**
   * 팀 목록 조회
   */
  getTeamList: async () => {
    try {
      const query = buildTeamsQuery();
      const response = await apiService.get(`/teams?${query}`);
      return convertKeysToCamelCase(normalizeResponse(response).data || []);
    } catch (error) {
      handleApiError(error, '팀 목록을 불러오는 중 오류가 발생했습니다.');
      throw error;
    }
  },
};
