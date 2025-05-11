// src/features/project/sections/ProjectWorkListSection.jsx

import React from 'react';

// 커스텀 훅
import { useProjectStore } from '../hooks/useProjectStore';

// 컴포넌트트
import ProjectWorkList from '../components/tables/ProjectWorkList';

// 로딩 상태 컴포넌트
const LoadingState = () => (
  <div className="mt-6 flex justify-center items-center h-32">
    <div className="flex items-center gap-3">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500">
        데이터를 불러오는 중입니다...
      </span>
    </div>
  </div>
);

// 에러 상태 컴포넌트
const ErrorState = ({ message }) => (
  <div className="mt-6 flex justify-center items-center h-32">
    <div className="text-sm text-red-500">
      {message || '데이터를 불러오는 중 오류가 발생했습니다'}
    </div>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState = () => (
  <div className="mt-6 flex justify-center items-center h-32">
    <div className="text-sm text-gray-500">데이터가 없습니다</div>
  </div>
);

/**
 * 프로젝트 작업 목록 섹션 컴포넌트
 * 작업 목록과 페이지네이션을 표시
 *
 * @returns {JSX.Element} 프로젝트 테이블 섹션
 */
const ProjectWorkListSection = () => {
  const { selectedItem, actions } = useProjectStore();
  const { works } = selectedItem || {};
  const { items, status, error, pagination } = works || {};

  // works 관련 액션 구성
  const worksActions = {
    pagination: actions.detail.works,
  };

  // 상태에 따른 컴포넌트 렌더링
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingState />;
      case 'failed':
        return <ErrorState message={error} />;
      case 'succeeded':
        return items?.length ? (
          <ProjectWorkList
            items={items}
            pagination={pagination}
            actions={worksActions}
          />
        ) : (
          <EmptyState />
        );
      default:
        return null;
    }
  };

  return <div className="mt-6">{renderContent()}</div>;
};

export default ProjectWorkListSection;
