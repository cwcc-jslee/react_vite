// src/features/project/containers/ProjectContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProject } from '../context/ProjectProvider';
import useProjectPage from '../hooks/useProjectPage';
import { Section } from '../../../shared/components/ui/layout/components';
import { Row, Col } from '../../../shared/components/ui';

// Components
import ProjectTable from '../components/tables/ProjectTable';
import ProjectAddContainer from './ProjectAddContainer';
import ProjectDrawer from '../components/drawer/ProjectDrawer';
// import ProjectChartRecharts from '../components/elements/ProjectChartRecharts';
import ProjectStatusDonutCharts from '../components/elements/ProjectStatusDonutCharts';
import ProjectProgressChart from '../components/elements/ProjectProgressChart';
import ProjectTreeMap from '../components/elements/ProjectTreeMap';

/**
 * Project 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const ProjectContainer = () => {
  // 프로젝트 페이지 상태 및 액션 훅
  const {
    items,
    pagination,
    filters,
    loading,
    error,
    handlePageChange,
    handlePageSizeChange,
  } = useProjectPage();

  // 레이아웃 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);
  const drawer = useSelector((state) => state.ui.drawer);
  // status 상태 가져오기
  const { state, fetchDashboardData } = useProject();
  const {
    projectStatus,
    monthlyStats,
    loading: stateLoading,
    error: stateError,
  } = state;

  return (
    <>
      <Section>
        {components.projectChart && (
          <Row gutter={[16, 16]}>
            {/* 왼쪽: 프로젝트 상태 도넛 차트 */}
            <Col span={8}>
              <div className="h-[420px]">
                <ProjectStatusDonutCharts projectStatus={projectStatus} />
              </div>
            </Col>

            {/* 가운데: 프로젝트 진행 단계별 막대 차트 */}
            <Col span={8}>
              <div className="h-[420px]">
                <ProjectProgressChart />
              </div>
            </Col>

            {/* 오른쪽: 프로젝트 작업 시간 트리맵 */}
            <Col span={8}>
              <div className="h-[420px]">
                <ProjectTreeMap />
              </div>
            </Col>
          </Row>
        )}

        {components.projectTable && (
          <ProjectTable
            items={items}
            pagination={pagination}
            loading={loading}
            error={error}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
          />
        )}
        {components.projectAddSection && <ProjectAddContainer />}
      </Section>
      {drawer.visible && <ProjectDrawer drawer={drawer} />}
    </>
  );
};

export default ProjectContainer;
