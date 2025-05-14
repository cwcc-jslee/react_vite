// src/features/project/sections/ProjectTaskListSection.jsx

import React, { useEffect } from 'react';

// 커스텀 훅
// import { useProjectStore } from '../hooks/useProjectStore';
import { useProjectTaskStore } from '../hooks/useProjectTaskStore';

// 컴포넌트트
import ProjectTaskTable from '../components/tables/ProjectTaskTable';

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
const ProjectTaskListSection = () => {
  const { items, status, error, pagination, actions } = useProjectTaskStore();

  useEffect(() => {
    // 작업 목록 조회
    actions.fetchTasks();

    // cleanup 함수: 컴포넌트 언마운트 시 taskSlice 초기화
    return () => {
      actions.resetState();
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 상태에 따른 컴포넌트 렌더링
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingState />;
      case 'failed':
        return <ErrorState message={error} />;
      case 'succeeded':
        return items?.length ? (
          <ProjectTaskTable
            items={items}
            status={status}
            error={error}
            pagination={pagination}
            actions={actions}
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

export default ProjectTaskListSection;
