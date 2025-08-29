// src/features/project/sections/ProjectChartsSection.jsx

import React, { useEffect } from 'react';
import { Row, Col } from '../../../shared/components/ui';
import ProjectTypeDonutChart from '../components/charts/ProjectTypeDonutChart';
import ProjectTeamDonutChart from '../components/charts/ProjectTeamDonutChart';
import ProjectServiceDonutChart from '../components/charts/ProjectServiceDonutChart';
import ProjectStatusDonutChart from '../components/charts/ProjectStatusDonutChart';
import ProjectScheduleDonutChart from '../components/charts/ProjectScheduleDonutChart';
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
  const { projectType, team, service, projectStatus, projectProgress, projectAnalytics, progressDistribution } = dashboardData;
  const isFiltered = searchFormData.pjtStatus !== '';

  console.log('=== ProjectChartsSection 렌더링 ===');
  console.log('전체 dashboardData:', dashboardData);
  console.log('projectType 데이터:', projectType);

  // 컴포넌트 마운트 시 대시보드 데이터 조회
  useEffect(() => {
    // actions.dashboard.fetchStatus();
    // actions.dashboard.fetchDashboardData();
  }, []);

  return (
    <>
      {/* 첫 번째 행 - 4개 차트 */}
      <Row gutter={[16, 16]}>
        {/* 프로젝트 타입 도넛 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectTypeDonutChart
              projectType={projectType || {}}
              isFiltered={isFiltered}
            />
          </div>
        </Col>

        {/* 팀별 도넛 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectTeamDonutChart
              team={team || {}}
              isFiltered={isFiltered}
            />
          </div>
        </Col>

        {/* 서비스별 도넛 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectServiceDonutChart
              service={service || {}}
              isFiltered={isFiltered}
            />
          </div>
        </Col>

        {/* 프로젝트 상태 도넛 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectStatusDonutChart
              projectStatus={projectStatus || {}}
              isFiltered={isFiltered}
            />
          </div>
        </Col>
      </Row>

      {/* 두 번째 행 - 4개 차트 */}
      <Row gutter={[16, 16]} className="mt-4">
        {/* 프로젝트 진행 단계별 막대 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectProgressChart 
              projectProgress={projectProgress} 
              progressDistribution={progressDistribution}
            />
          </div>
        </Col>

        {/* 태스크 지연 현황 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectTaskDelayChart />
          </div>
        </Col>

        {/* 프로젝트 남은 기간 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectRemainingPeriodChart />
          </div>
        </Col>

        {/* 일정 상태 도넛 차트 */}
        <Col span={6}>
          <div className="h-[350px]">
            <ProjectScheduleDonutChart
              scheduleStatus={projectAnalytics || {}}
              isFiltered={isFiltered}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProjectChartsSection;
