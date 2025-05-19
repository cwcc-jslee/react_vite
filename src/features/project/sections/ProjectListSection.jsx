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

  // 컴포넌트 마운트 시 프로젝트 목록 조회
  useEffect(() => {
    // menu가 'singletask' 또는 'list'일 때만 실행
    if (menu === 'singletask' || menu === 'list') {
      // menu가 'singletask'일 경우 'single', 'list'일 경우 'project'로 설정
      const workType = menu === 'singletask' ? 'single' : 'project';
      actions.filter.setWorkType(workType);
      actions.getProjectList();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      actions.filter.resetFilters();
    };
  }, [menu]);

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
