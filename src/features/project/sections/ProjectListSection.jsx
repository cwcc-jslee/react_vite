// src/features/project/sections/ProjectListSection.jsx

import React from 'react';
import { useProjectStore } from '../hooks/useProjectStore';
import ProjectList from '../components/tables/ProjectList';
import { getScheduleStatus } from '../utils/scheduleStatusUtils';

/**
 * 프로젝트 목록 테이블 섹션 컴포넌트
 * 프로젝트 목록과 페이지네이션을 표시
 */
const ProjectListSection = () => {
  const {
    // 상태
    items,
    pagination,
    status,
    error,

    // 액션
    actions,
  } = useProjectStore();

  // 일정상태 계산된 items 생성
  const itemsWithScheduleStatus = items.map((item) => ({
    ...item,
    scheduleStatus: getScheduleStatus(item),
  }));

  console.log(`ProjectListSection items: `, items);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    actions.pagination.setPage(page);
    actions.fetchProjects({
      pagination: { current: page, pageSize: pagination.pageSize },
    });
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (pageSize) => {
    actions.pagination.setPageSize(pageSize);
    actions.fetchProjects({ pagination: { current: 1, pageSize } });
  };

  return (
    <div className="space-y-4">
      <ProjectList
        items={itemsWithScheduleStatus}
        pagination={pagination}
        loading={status === 'loading'}
        error={error}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loadProjectDetail={actions.detail.fetchDetail}
      />
    </div>
  );
};

export default ProjectListSection;
