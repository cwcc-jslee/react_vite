// src/features/project/hooks/useUtilization.js
/**
 * 투입률 데이터 관리를 위한 커스텀 훅
 * React Query를 사용하여 서버 상태 관리
 */

import { useQuery } from '@tanstack/react-query';
import { utilizationApiService } from '../services/utilizationApiService';
import { utilizationWeeklyService } from '../services/utilizationWeeklyService';
import dayjs from 'dayjs';

/**
 * 기간 타입에 따른 날짜 범위 계산
 */
const getDateRangeByPeriod = (period) => {
  const today = dayjs();

  switch (period) {
    case 'daily':
      return {
        startDate: today.format('YYYY-MM-DD'),
        endDate: today.format('YYYY-MM-DD'),
      };
    case 'weekly':
      // 이번 주 월요일 ~ 금요일
      const startOfWeek = today.startOf('week').add(1, 'day'); // 월요일
      const endOfWeek = today.endOf('week').subtract(1, 'day'); // 금요일
      return {
        startDate: startOfWeek.format('YYYY-MM-DD'),
        endDate: endOfWeek.format('YYYY-MM-DD'),
      };
    case 'monthly':
      return {
        startDate: today.startOf('month').format('YYYY-MM-DD'),
        endDate: today.endOf('month').format('YYYY-MM-DD'),
      };
    default:
      return {
        startDate: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'),
        endDate: today.endOf('week').subtract(1, 'day').format('YYYY-MM-DD'),
      };
  }
};

/**
 * 투입률 데이터 조회 훅
 */
export const useUtilization = (filters = {}) => {
  const { period = 'weekly', startDate, endDate, teamId } = filters;

  // 날짜 범위 계산
  const dateRange = startDate && endDate
    ? { startDate, endDate }
    : getDateRangeByPeriod(period);

  // React Query를 사용한 데이터 조회
  const query = useQuery({
    queryKey: ['utilization', dateRange.startDate, dateRange.endDate, teamId],
    queryFn: () =>
      utilizationApiService.getUtilizationData({
        ...dateRange,
        teamId,
      }),
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    cacheTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    dateRange,
  };
};

/**
 * 팀 목록 조회 훅
 */
export const useTeamList = (includeNonTrackedTeams = false) => {
  const query = useQuery({
    queryKey: ['teams', includeNonTrackedTeams],
    queryFn: async () => {
      const { apiService } = await import('@shared/api/apiService');
      const { convertKeysToCamelCase } = await import('@shared/utils/transformUtils');
      const { buildTeamsQuery } = await import('../api/utilizationQueries');

      const teamQuery = buildTeamsQuery({ includeNonTrackedTeams });
      const response = await apiService.get(`/teams?${teamQuery}`);
      const normalized = response.data?.data || response.data || [];
      return convertKeysToCamelCase(normalized);
    },
    staleTime: 1000 * 60 * 10, // 10분간 fresh 상태 유지
    cacheTime: 1000 * 60 * 60, // 1시간 캐시 유지
  });

  return {
    teams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

/**
 * 사용자 목록 조회 훅
 */
export const useUserList = (includeNonTrackedTeams = false) => {
  const query = useQuery({
    queryKey: ['users', 'all', includeNonTrackedTeams],
    queryFn: async () => {
      const { apiService } = await import('@shared/api/apiService');
      const { convertKeysToCamelCase } = await import('@shared/utils/transformUtils');
      const { buildUsersQuery } = await import('../api/utilizationQueries');

      const userQuery = buildUsersQuery({
        blocked: false,
        includeNonTrackedTeams
      });
      const response = await apiService.get(`/users?${userQuery}`);
      const rawUsers = response.data || [];
      return Array.isArray(rawUsers)
        ? convertKeysToCamelCase(rawUsers)
        : convertKeysToCamelCase(rawUsers.data || []);
    },
    staleTime: 1000 * 60 * 10, // 10분간 fresh 상태 유지
    cacheTime: 1000 * 60 * 60, // 1시간 캐시 유지
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

/**
 * 투입률 통합 훅 (데이터 + 팀 목록)
 */
export const useUtilizationWithTeams = (filters = {}) => {
  const utilization = useUtilization(filters);
  const teamList = useTeamList();

  return {
    utilization,
    teams: teamList.teams,
    isLoading: utilization.isLoading || teamList.isLoading,
    isError: utilization.isError || teamList.isError,
    error: utilization.error || teamList.error,
  };
};

/**
 * 주별 투입률 데이터 조회 훅
 */
export const useWeeklyUtilization = (filters = {}) => {
  const { startDate, endDate, teamId, userId, includeNonTrackedTeams = false } = filters;

  // React Query를 사용한 주별 데이터 조회
  const query = useQuery({
    queryKey: ['utilization', 'weekly', startDate, endDate, teamId, userId, includeNonTrackedTeams],
    queryFn: () =>
      utilizationWeeklyService.getWeeklyUtilizationData({
        startDate,
        endDate,
        teamId,
        userId,
        includeNonTrackedTeams,
      }),
    enabled: !!(startDate && endDate), // startDate와 endDate가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    cacheTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * 주별 투입률 통합 훅 (주별 데이터 + 팀 목록 + 사용자 목록)
 */
export const useWeeklyUtilizationWithTeams = (filters = {}) => {
  const { includeNonTrackedTeams = false } = filters;

  const weeklyUtilization = useWeeklyUtilization(filters);
  const teamList = useTeamList(includeNonTrackedTeams);
  const userList = useUserList(includeNonTrackedTeams);

  return {
    weeklyUtilization,
    teams: teamList.teams,
    users: userList.users,
    isLoading: weeklyUtilization.isLoading || teamList.isLoading || userList.isLoading,
    isError: weeklyUtilization.isError || teamList.isError || userList.isError,
    error: weeklyUtilization.error || teamList.error || userList.error,
  };
};
