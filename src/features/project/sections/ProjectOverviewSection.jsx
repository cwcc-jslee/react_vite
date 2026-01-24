// src/features/project/sections/ProjectOverviewSection.jsx
import React, { useMemo } from 'react';
import ProjectMetricsSection from '../components/metrics/ProjectMetricsSection';
import ProjectEfficiencyCard from '../../dashboard/components/approval/ProjectEfficiencyCard';
import ProjectDetailInfo from '../components/details/ProjectDetailInfo';
import RevenueSummaryCard from '../../../shared/components/cards/RevenueSummaryCard';
import {
  calculateProjectTotalPlannedHours,
  validateProjectPlanningHours,
} from '../utils/projectTimeUtils';
import { calculateProjectProgress } from '../utils/projectProgressUtils';

/**
 * 프로젝트 개요 (Overview) 섹션
 * 프로젝트의 핵심 현황과 효율성 분석 정보를 한눈에 보여주는 대시보드
 */
const ProjectOverviewSection = ({ data, projectTasks, onStatusClick }) => {
  // 프로젝트 메트릭 계산 (메모이제이션)
  const projectMetrics = useMemo(() => {
    const totalPlannedHours = calculateProjectTotalPlannedHours(projectTasks);
    const calculatedProgress = calculateProjectProgress(projectTasks);
    const completedTasksCount = projectTasks.filter((task) => {
      const progressCode = task.taskProgress?.code;
      return (
        progressCode === '100' || progressCode === 100 || task.isCompleted
      );
    }).length;
    const validation = validateProjectPlanningHours(data, totalPlannedHours);

    return {
      totalPlannedHours,
      calculatedProgress,
      completedTasksCount,
      validation,
    };
  }, [projectTasks, data]);

  return (
    <div className="space-y-6">
      {/* 1. 핵심 지표 (Status, Progress, Tasks, Hours, Budget, Duration) */}
      <ProjectMetricsSection
        data={{ ...data, projectTasks }}
        projectMetrics={projectMetrics}
        onStatusClick={onStatusClick}
      />

      {/* 1.5. 매출 요약 (SFA 정보가 있을 경우만) */}
      {data.sfa && (
        <RevenueSummaryCard
          sfaByPayments={data.sfa.sfaByPayments || []}
          sfaByItems={data.sfa.sfaByItems || []}
        />
      )}

      {/* 2. 상세 정보 (메타데이터) */}
      <ProjectDetailInfo data={data} />

      {/* 3. 효율성 및 예산 상세 분석 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            효율성 및 예산 분석
          </h3>
          {data.team?.name && (
            <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              {data.team.name}
            </span>
          )}
        </div>
        <ProjectEfficiencyCard 
          project={{ ...data, projectTasks }} 
          changeTypeName={data.currentApprovalStatus === 'pending' ? 'STATUS_CHANGE' : null}
        />
      </div>
    </div>
  );
};

export default ProjectOverviewSection;
