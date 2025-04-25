// src/features/todo/layouts/TodoListLayout.jsx

import React from 'react';
import WorkListSection from '../sections/WorkListSection';

/**
 * 프로젝트 목록/현황을 보여주는 레이아웃 컴포넌트
 * 상단에 차트 섹션과 하단에 테이블 섹션으로 구성
 *
 */
const WorkListLayout = () => {
  return (
    <>
      {/* 차트 섹션 (상태, 진행률, 트리맵) */}
      {/* <ProjectChartsSection
        projectStatus={chartsData?.projectStatus}
        projectProgress={chartsData?.projectProgress}
      /> */}

      {/* 테이블 섹션 */}
      <WorkListSection
      // items={items}
      // pagination={pagination}
      // loading={loading}
      // error={error}
      // handlePageChange={handlePageChange}
      // handlePageSizeChange={handlePageSizeChange}
      // loadProjectDetail={loadProjectDetail}
      />
    </>
  );
};

export default WorkListLayout;
