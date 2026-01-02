// src/features/project/sections/ProjectDetailTableSection.jsx
// 3단계 정보 계층 구조로 개선된 프로젝트 정보 섹션

import React, { useMemo } from 'react';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import ProjectMetricsSection from '../components/metrics/ProjectMetricsSection';
import ProjectDetailInfo from '../components/details/ProjectDetailInfo';
import {
  calculateProjectTotalPlannedHours,
  validateProjectPlanningHours,
} from '../utils/projectTimeUtils';
import { calculateProjectProgress } from '../utils/projectProgressUtils';

/**
 * 프로젝트 정보 섹션 컴포넌트
 * Tier 1: 핵심 지표 (카드)
 * Tier 2: 상세 정보 (Expandable)
 */
const ProjectDetailTableSection = ({ data, projectTasks, onStatusClick }) => {
  const { actions } = useUiStore();

  // 상태 섹션 클릭 핸들러 - Drawer 열기
  const handleStatusSectionClick = (e) => {
    // onStatusClick prop이 있으면 사용 (Drawer에서 호출 시)
    // 없으면 기존 방식 유지 (Layout에서 호출 시)
    if (onStatusClick) {
      onStatusClick();
    } else {
      console.log('진행상태 변경 클릭:', data);
      actions.drawer.open({
        mode: 'status',
        data: {
          id: data.id,
          documentId: data.documentId,
          pjtStatus: data.pjtStatus,
          statusHistory: data.statusHistory || [],
          isClosed: data.isClosed,
          projectClosure: data.projectClosure,
          projectTasks: data.projectTasks,
        },
        width: '900px',
        activeTab: 'flow', // 기본적으로 '진행 플로우' 탭 활성화
      });
    }
  };

  // 프로젝트 메트릭 계산 (메모이제이션)
  const projectMetrics = useMemo(() => {
    const totalPlannedHours = calculateProjectTotalPlannedHours(projectTasks);
    const calculatedProgress = calculateProjectProgress(projectTasks);
    const completedTasksCount = projectTasks.filter((task) => {
      const progressCode = task.taskProgress?.code;
      return progressCode === '100' || progressCode === 100 || task.isCompleted;
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
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          프로젝트 정보
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({data.id}) {data.name}
          </span>
        </h2>
      </div>

      {/* Tier 1: 핵심 지표 카드 */}
      <ProjectMetricsSection
        data={{...data, projectTasks}}
        projectMetrics={projectMetrics}
        onStatusClick={handleStatusSectionClick}
      />

      {/* Tier 2: 상세 정보 (Expandable) */}
      <ProjectDetailInfo data={data} />
    </div>
  );
};

export default ProjectDetailTableSection;
