// src/features/project/sections/ProjectListSection.jsx

import React from 'react';
import { useProjectStore } from '../hooks/useProjectStore';
import ProjectList from '../components/tables/ProjectList';

/**
 * 프로젝트 목록 테이블 섹션 컴포넌트
 * 프로젝트 목록과 페이지네이션을 표시
 */
const ProjectListSection = () => {
  const {
    // 상태
    items,
    pagination,
    loading,
    error,

    // 액션
    actions,
  } = useProjectStore();

  console.log(`ProjectListSection items: `, items);

  return (
    <div className="mt-6">
      <ProjectList
        items={items}
        pagination={pagination}
        loading={loading}
        error={error}
        handlePageChange={actions.pagination.setPage}
        handlePageSizeChange={actions.pagination.setPageSize}
        loadProjectDetail={actions.detail.fetchDetail}
      />
    </div>
  );
};

export default ProjectListSection;
