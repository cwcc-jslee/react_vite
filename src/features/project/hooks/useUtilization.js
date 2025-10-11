// src/features/project/hooks/useUtilization.js
/**
 * 투입률 데이터 관리를 위한 커스텀 훅
 * React Query를 사용하여 서버 상태 관리
 */

import { useQuery } from '@tanstack/react-query';
import { utilizationApiService } from '../services/utilizationApiService';
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
export const useTeamList = () => {
  const query = useQuery({
    queryKey: ['teams'],
    queryFn: () => utilizationApiService.getTeamList(),
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
