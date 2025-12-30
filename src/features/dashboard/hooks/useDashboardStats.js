// src/features/dashboard/hooks/useDashboardStats.js
/**
 * 대시보드 통계 데이터 조회 훅
 */

import { useQuery } from '@tanstack/react-query';
import { buildDashboardStatsQuery } from '../api/queries';
import { REFRESH_INTERVALS } from '../constants/dashboardConstants';

export const useDashboardStats = () => {
  const query = useQuery({
    ...buildDashboardStatsQuery(),
    refetchInterval: REFRESH_INTERVALS.dashboardStats, // 30초마다 자동 갱신
    refetchOnWindowFocus: true,
  });

  return {
    stats: query.data || { inProgress: 0, completed: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
