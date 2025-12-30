// src/features/dashboard/api/queries.js
/**
 * React Query 쿼리 빌더
 */

import { approvalApiService } from './approvalApiService';

/**
 * 대시보드 통계 쿼리 빌더
 */
export const buildDashboardStatsQuery = () => ({
  queryKey: ['dashboard', 'stats'],
  queryFn: () => approvalApiService.getDashboardStats(),
  staleTime: 30000, // 30초
  cacheTime: 60000, // 1분
});

/**
 * 승인 대기 목록 쿼리 빌더
 */
export const buildApprovalPendingQuery = () => ({
  queryKey: ['approvals', 'pending'],
  queryFn: () => approvalApiService.getApprovalPendingList(),
  staleTime: 60000, // 1분
  cacheTime: 120000, // 2분
});

/**
 * 승인 상세 쿼리 빌더
 * @param {string} projectId - 프로젝트 ID
 */
export const buildApprovalDetailQuery = (projectId) => ({
  queryKey: ['approvals', 'detail', projectId],
  queryFn: () => approvalApiService.getApprovalDetail(projectId),
  enabled: !!projectId,
});
