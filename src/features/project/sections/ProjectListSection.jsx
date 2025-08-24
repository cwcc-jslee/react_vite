// src/features/project/sections/ProjectListSection.jsx

import React, { useEffect } from 'react';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import { useProjectStore } from '../hooks/useProjectStore';
import ProjectList from '../components/tables/ProjectList';
import { enhanceItemsWithScheduleStatus } from '../utils/projectListUtils';

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

  // 일정상태, 태스크 상태, 진행률 계산된 items 생성 (utils 함수 사용)
  const itemsWithEnhancedData = enhanceItemsWithScheduleStatus(items);

  console.log(`ProjectListSection items: `, items);
  console.log(`ProjectListSection enhanced items: `, itemsWithEnhancedData.slice(0, 2).map(item => ({
    id: item.id,
    name: item.name,
    projectProgress: item.projectProgress,
    calculatedProgress: item.calculatedProgress,
    taskCount: item.projectTasks?.length || 0
  })));

  return (
    <div className="space-y-4">
      <ProjectList
        items={itemsWithEnhancedData}
        pagination={pagination}
        loading={status === 'loading'}
        error={error}
        actions={actions}
      />
    </div>
  );
};

export default ProjectListSection;
