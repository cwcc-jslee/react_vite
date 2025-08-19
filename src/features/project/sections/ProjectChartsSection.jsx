// src/features/project/sections/ProjectChartsSection.jsx

import React, { useEffect } from 'react';
import { Row, Col } from '../../../shared/components/ui';
import ProjectStatusDonutCharts from '../components/charts/ProjectStatusDonutCharts';
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import ProjectTaskDelayChart from '../components/charts/ProjectTaskDelayChart';
import ProjectRemainingPeriodChart from '../components/charts/ProjectRemainingPeriodChart';
import { useProjectSearch } from '../hooks/useProjectSearch';
import { useProjectStore } from '../hooks/useProjectStore';

/**
 * 프로젝트 차트 섹션 컴포넌트
 * 프로젝트 상태, 진행률, 작업시간 시각화를 담당
 *
 * @returns {JSX.Element} 프로젝트 차트 섹션
 */
const ProjectChartsSection = () => {
  const { searchFormData } = useProjectSearch();
  const { dashboardData, actions } = useProjectStore();
  const { projectStatus, projectProgress, projectAnalytics } = dashboardData;
  const isFiltered = searchFormData.pjtStatus !== '';

  // 컴포넌트 마운트 시 대시보드 데이터 조회
  useEffect(() => {
    // actions.dashboard.fetchStatus();
    // actions.dashboard.fetchDashboardData();
  }, []);

  return (
    <Row gutter={[16, 16]}>
      {/* 프로젝트 상태 도넛 차트 */}
      <Col span={6}>
        <div className="h-[420px]">
          <ProjectStatusDonutCharts
            projectStatus={projectStatus || {}}
            scheduleStatus={projectAnalytics || {}}
            isFiltered={isFiltered}
          />
        </div>
      </Col>

      {/* 프로젝트 진행 단계별 막대 차트 */}
      <Col span={6}>
        <div className="h-[420px]">
          <ProjectProgressChart projectProgress={projectProgress} />
        </div>
      </Col>

      {/* 태스크 지연 현황 차트 */}
      <Col span={6}>
        <div className="h-[420px]">
          <ProjectTaskDelayChart />
        </div>
      </Col>

      {/* 프로젝트 남은 기간 차트 */}
      <Col span={6}>
        <div className="h-[420px]">
          <ProjectRemainingPeriodChart />
        </div>
      </Col>
    </Row>
  );
};

export default ProjectChartsSection;
