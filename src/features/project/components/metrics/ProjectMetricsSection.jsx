// src/features/project/components/metrics/ProjectMetricsSection.jsx
// Tier 1: 프로젝트 핵심 지표를 카드 형태로 표시하는 섹션

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import MetricCard from '@shared/components/ui/card/MetricCard';
import { Progress } from '@shared/components/ui/index';
import CompactStatusBadge from '../ui/CompactStatusBadge';
import ApprovalStatusBadge from '../ui/ApprovalStatusBadge';
import { PROJECT_EXCEPTION_STATUS } from '../../constants/projectStatusConstants';

/**
 * 프로젝트 핵심 지표 섹션 컴포넌트
 * 핵심 지표를 카드 형태로 표시
 */
const ProjectMetricsSection = ({
  data = {},
  projectMetrics = {},
  onStatusClick,
}) => {
  const {
    calculatedProgress,
    completedTasksCount,
    totalPlannedHours,
    validation,
  } = projectMetrics;

  const totalTasks = data.projectTasks?.length || 0;

  // 상태 이력에서 최신 변경 정보 추출
  const statusMetadata = useMemo(() => {
    const statusChanges = data.projectStatusChanges || [];
    const currentApprovalStatus = data.currentApprovalStatus;

    // 최신 이력이 없으면 기본값
    if (statusChanges.length === 0) {
      return {
        currentStatus: data.pjtStatus?.name || '시작전',
        previousStatus: null,
        statusDetail: null,
        approvalStatus: null,
        requestedAt: null,
        changedBy: null,
        requestedStatus: null, // 요청된 상태 (pending일 때)
      };
    }

    // 최신 이력 (첫 번째 항목 - API에서 최신순으로 정렬되어 옴)
    const latestChange = statusChanges[0];

    // pending 상태일 때는 승인 전/후 상태 표시
    if (currentApprovalStatus === 'pending') {
      return {
        currentStatus: latestChange.fromStatus?.name || data.pjtStatus?.name || '시작전', // 승인 전 상태
        previousStatus: null,
        statusDetail: latestChange.statusDetail || null,
        approvalStatus: latestChange.approvalStatus || null,
        requestedAt: latestChange.requestedAt || null,
        changedBy: latestChange.requestedBy?.username || null,
        requestedStatus: latestChange.toStatus?.name || null, // 승인 후 상태
      };
    }

    // approved/rejected 상태일 때는 기존 방식 (전 상태 → 현 상태)
    return {
      currentStatus: data.pjtStatus?.name || '시작전',
      previousStatus: latestChange.fromStatus?.name || null,
      statusDetail: latestChange.statusDetail || null,
      approvalStatus: latestChange.approvalStatus || null,
      requestedAt: latestChange.requestedAt || null,
      changedBy: latestChange.requestedBy?.username || null,
      requestedStatus: null,
    };
  }, [data.projectStatusChanges, data.pjtStatus, data.currentApprovalStatus]);

  // 프로젝트 기간 포맷
  const formatProjectDuration = () => {
    const startDate = data.startDate || data.planStartDate;
    const endDate = data.endDate || data.planEndDate;

    if (!startDate && !endDate) return '-';

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-600">
          {startDate || '-'}
        </div>
        <div className="text-xs text-gray-400">~</div>
        <div className="text-sm text-gray-600">
          {endDate || '-'}
        </div>
      </div>
    );
  };

  // 투입/계획시간 상태
  const getTimeStatus = () => {
    const spent = data.totalProjectHours || 0;
    const planned = totalPlannedHours || 1;
    const percentage = (spent / planned) * 100;

    if (percentage > 100) return 'danger';
    if (percentage > 80) return 'warning';
    return 'default';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* 1. 진행상태/진행률 통합 카드 */}
      <MetricCard 
        title={
          <div className="flex items-center justify-between w-full">
            <span>진행상태</span>
            <ApprovalStatusBadge status={statusMetadata.approvalStatus} />
          </div>
        } 
        icon="📊"
      >
        {data.isClosed ? (
          /* 종료 상태인 경우 */
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-md text-sm font-bold bg-gray-100 text-gray-700 border border-gray-300">
                종료
              </span>
              <span className="text-sm text-gray-600">
                {data.projectClosure?.closureType?.name || ''}
              </span>
            </div>
            {data.projectClosure?.closureDate && (
              <div className="text-xs text-gray-500">
                종료일: {data.projectClosure.closureDate}
              </div>
            )}
          </div>
        ) : (
          /* 진행 중인 경우: 진행상태 + 승인상태 + 진행률 */
          <div className="flex flex-col gap-3">
            {/* 진행상태 및 승인상태 */}
            <CompactStatusBadge
              currentStatus={statusMetadata.currentStatus}
              previousStatus={statusMetadata.previousStatus}
              statusDetail={statusMetadata.statusDetail}
              approvalStatus={statusMetadata.approvalStatus}
              isException={statusMetadata.currentStatus === PROJECT_EXCEPTION_STATUS}
              onClick={onStatusClick}
              timeAgo={statusMetadata.requestedAt}
              changedBy={statusMetadata.changedBy}
              requestedStatus={statusMetadata.requestedStatus}
            />

            {/* 진행률 */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">진행률</span>
                <span className="text-sm font-bold text-blue-600">
                  {calculatedProgress}%
                </span>
              </div>
              <Progress
                percent={calculatedProgress}
                status={calculatedProgress >= 100 ? 'success' : 'normal'}
                size="small"
                showInfo={false}
              />
            </div>
          </div>
        )}
      </MetricCard>

      {/* 2. TASK 카드 */}
      <MetricCard title="TASK" icon="✅">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-700">
              {completedTasksCount}
            </span>
            <span className="text-lg text-gray-400">/ {totalTasks}</span>
          </div>
          <Progress
            percent={totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0}
            status="normal"
            size="small"
            showInfo={false}
          />
          <div className="text-xs text-gray-500">
            완료: {completedTasksCount}개 · 진행: {totalTasks - completedTasksCount}개
          </div>
        </div>
      </MetricCard>

      {/* 3. 투입/계획시간 카드 */}
      <MetricCard
        title="투입/계획시간"
        icon="⏱️"
        variant={getTimeStatus()}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">투입</span>
              <span className="text-lg font-semibold text-gray-700">
                {data.totalProjectHours || 0}h
              </span>
            </div>
            <span className="text-gray-300">/</span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">계획</span>
              <span className="text-lg font-semibold text-gray-700">
                {totalPlannedHours}h
              </span>
            </div>
          </div>
          <Progress
            percent={Math.min(
              ((data.totalProjectHours || 0) / (totalPlannedHours || 1)) * 100,
              100
            )}
            status={
              data.totalProjectHours > totalPlannedHours
                ? 'exception'
                : 'normal'
            }
            size="small"
            showInfo={false}
          />
          <div className="text-xs text-gray-500">
            {data.totalProjectHours > totalPlannedHours ? (
              <span className="text-red-600 font-medium">
                초과: {data.totalProjectHours - totalPlannedHours}h
              </span>
            ) : (
              <span>
                남은: {totalPlannedHours - (data.totalProjectHours || 0)}h
              </span>
            )}
          </div>
        </div>
      </MetricCard>

      {/* 4. 프로젝트 기간 카드 */}
      <MetricCard title="프로젝트 기간" icon="📅">
        <div className="flex flex-col gap-1">
          {formatProjectDuration()}
          {data.startDate && data.endDate && (
            <div className="text-xs text-gray-500 mt-2">
              총 {Math.ceil(
                (new Date(data.endDate) - new Date(data.startDate)) /
                (1000 * 60 * 60 * 24)
              )}일
            </div>
          )}
        </div>
      </MetricCard>
    </div>
  );
};

ProjectMetricsSection.propTypes = {
  data: PropTypes.object.isRequired,
  projectMetrics: PropTypes.shape({
    calculatedProgress: PropTypes.number,
    completedTasksCount: PropTypes.number,
    totalPlannedHours: PropTypes.number,
    validation: PropTypes.object,
  }).isRequired,
  onStatusClick: PropTypes.func,
};

export default ProjectMetricsSection;
