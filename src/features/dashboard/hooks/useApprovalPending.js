// src/features/dashboard/hooks/useApprovalPending.js
/**
 * 승인 대기 목록 조회 훅
 */

import { useQuery } from '@tanstack/react-query';
import { buildApprovalPendingQuery } from '../api/queries';
import { REFRESH_INTERVALS } from '../constants/dashboardConstants';

export const useApprovalPending = () => {
  const query = useQuery({
    ...buildApprovalPendingQuery(),
    refetchInterval: REFRESH_INTERVALS.approvalPending, // 1분마다 자동 갱신
    refetchOnWindowFocus: true,
  });

  return {
    approvals: query.data?.data || [],
    total: query.data?.meta?.pagination?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
