// src/features/project/sections/ProjectChartsSection.jsx

import React from 'react';
import { Row, Col } from '../../../shared/components/ui';
import ProjectStatusDonutCharts from '../components/charts/ProjectStatusDonutCharts';
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import ProjectTreeMap from '../components/charts/ProjectTreeMap';
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
  const { dashboardData } = useProjectStore();
  const isFiltered = searchFormData.pjtStatus !== '';

  const { projectStatus, projectProgress, scheduleStatus } = dashboardData;

  console.log(`>>>> projectStatus`, projectStatus);
  console.log(`>>>> scheduleStatus`, scheduleStatus);

  return (
    <Row gutter={[16, 16]}>
      {/* 왼쪽: 프로젝트 상태 도넛 차트 */}
      <Col span={8}>
        <div className="h-[420px]">
          <ProjectStatusDonutCharts
            projectStatus={projectStatus}
            scheduleStatus={scheduleStatus}
            isFiltered={isFiltered}
          />
        </div>
      </Col>

      {/* 가운데: 프로젝트 진행 단계별 막대 차트 */}
      <Col span={8}>
        <div className="h-[420px]">
          <ProjectProgressChart projectProgress={projectProgress} />
        </div>
      </Col>

      {/* 오른쪽: 프로젝트 작업 시간 트리맵 */}
      <Col span={8}>
        <div className="h-[420px]">
          <ProjectTreeMap />
        </div>
      </Col>
    </Row>
  );
};

export default ProjectChartsSection;
