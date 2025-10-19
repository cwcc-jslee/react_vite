// src/features/project/hooks/useTeamWeeklyUtilization.js
/**
 * 팀별 주간 실적 데이터 관리 훅
 */

import { useQuery } from '@tanstack/react-query';
import { teamWeeklyUtilizationService } from '../services/teamWeeklyUtilizationService';

/**
 * 팀별 주간 실적 데이터 조회 훅
 */
export const useTeamWeeklyUtilization = (week, teamId = null) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teamWeeklyUtilization', week, teamId],
    queryFn: () => teamWeeklyUtilizationService.getTeamWeeklyData({ week, teamId }),
    enabled: !!week,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });

  return {
    data: data || null,
    summary: data?.summary || null,
    teams: data?.teams || [],
    period: data?.period || null,
    previousWeek: data?.previousWeek || null,
    isLoading,
    isError,
    error,
    refetch,
  };
};