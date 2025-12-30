// src/features/dashboard/pages/DashboardPage.jsx
/**
 * 대시보드 메인 페이지
 */

import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useApprovalPending } from '../hooks/useApprovalPending';
import { STAT_CARD_CONFIGS } from '../constants/dashboardConstants';
import StatCard from '../components/cards/StatCard';
import ApprovalPendingWidget from '../components/widgets/ApprovalPendingWidget';

const DashboardPage = () => {
  const { stats, isLoading } = useDashboardStats();
  const { total: approvalPendingCount } = useApprovalPending();

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">DASHBOARD</h1>
        <p className="text-sm text-gray-600 mt-1">
          프로젝트 현황 및 승인 대기 항목을 확인하세요
        </p>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={STAT_CARD_CONFIGS.pending.icon}
          label={STAT_CARD_CONFIGS.pending.label}
          value={approvalPendingCount}
          config={STAT_CARD_CONFIGS.pending}
        />
        <StatCard
          icon={STAT_CARD_CONFIGS.inProgress.icon}
          label={STAT_CARD_CONFIGS.inProgress.label}
          value={stats.inProgress}
          config={STAT_CARD_CONFIGS.inProgress}
        />
        <StatCard
          icon={STAT_CARD_CONFIGS.completed.icon}
          label={STAT_CARD_CONFIGS.completed.label}
          value={stats.completed}
          config={STAT_CARD_CONFIGS.completed}
        />
      </div>

      {/* 위젯 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 승인 대기 위젯 */}
        <ApprovalPendingWidget />

        {/* 내 프로젝트 위젯 (추후 구현) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">내 프로젝트</h3>
          <div className="text-center py-8 text-sm text-gray-500">
            내 프로젝트 위젯 (추후 구현)
          </div>
        </div>
      </div>

      {/* 차트 섹션 (추후 구현) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 분포</h3>
          <div className="text-center py-8 text-sm text-gray-500">
            도넛 차트 (추후 구현)
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">완료 추세</h3>
          <div className="text-center py-8 text-sm text-gray-500">
            라인 차트 (추후 구현)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
