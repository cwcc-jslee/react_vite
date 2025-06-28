// src/features/project/sections/ProjectListSection.jsx

import React, { useEffect } from 'react';
import { useUiStore } from '../../../shared/hooks/useUiStore';
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

  const { pageLayout } = useUiStore();
  const { menu } = pageLayout;

  // 일정상태 계산된 items 생성
  const itemsWithScheduleStatus = items.map((item) => ({
    ...item,
    scheduleStatus: getScheduleStatus(item),
  }));

  console.log(`ProjectListSection items: `, items);

  return (
    <div className="space-y-4">
      <ProjectList
        items={itemsWithScheduleStatus}
        pagination={pagination}
        loading={status === 'loading'}
        error={error}
        actions={actions}
      />
    </div>
  );
};

export default ProjectListSection;
