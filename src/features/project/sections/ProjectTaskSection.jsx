// src/features/project/sections/ProjectTaskSection.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// 컴포넌트
import ProjectTaskTable from '../components/tables/ProjectTaskTable';
import ProjectTaskBoardSection from './ProjectTaskBoardSection';

/**
 * 프로젝트 작업 섹션 컴포넌트
 * 프로젝트의 작업 목록을 다양한 뷰 모드로 표시
 */
const ProjectTaskSection = ({
  tasks = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  error = null,
  handlePageChange = () => {},
  handlePageSizeChange = () => {},
  onTaskComplete = () => {},
  onTaskEdit = () => {},
}) => {
  // Redux 상태에서 현재 레이아웃 설정 가져오기
  const { subMenu } = useSelector((state) => state.ui.pageLayout);
  const activeMenu = subMenu.menu;

  // 현재 뷰 모드 상태 ('table', 'card', 'timeline')
  const [viewMode, setViewMode] = useState('table');

  // 필터가 적용된 작업 데이터 계산 (실제 구현에서는 이 로직이 더 복잡할 수 있음)
  const filteredTasks = tasks;

  return (
    // <div className="bg-white rounded-md shadow p-4 mt-6">
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">프로젝트 TASK</h2>
        </div>
      </div>

      {/* 뷰 모드에 따른 컴포넌트 렌더링 */}
      {activeMenu === 'table' && (
        <ProjectTaskTable
          tasks={filteredTasks}
          pagination={pagination}
          loading={loading}
          error={error}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          onTaskComplete={onTaskComplete}
          onTaskEdit={onTaskEdit}
        />
      )}

      {activeMenu === 'board' && <ProjectTaskBoardSection />}

      {activeMenu === 'timeline' && (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          타임라인 뷰는 현재 개발 중입니다.
        </div>
      )}

      {activeMenu === 'chart' && (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          차트 뷰는 현재 개발 중입니다.
        </div>
      )}

      {activeMenu === 'members' && (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          사용자 뷰는 현재 개발 중입니다.
        </div>
      )}
    </div>
  );
};

export default ProjectTaskSection;
