// src/features/project/sections/ProjectTaskSection.jsx

import React, { useState } from 'react';
import { FiList, FiGrid, FiClock, FiSearch, FiFilter } from 'react-icons/fi';
import { Button, Input } from '../../../shared/components/ui';

// 컴포넌트
import ProjectTaskTable from '../components/tables/ProjectTaskTable';
import KanbanColumn from '../components/card/KanbanColumn';
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
  // 현재 뷰 모드 상태 ('table', 'card', 'timeline')
  const [viewMode, setViewMode] = useState('table');

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 필터 적용 상태
  const [filters, setFilters] = useState({
    showCompleted: true,
    priority: 'all', // 'all', 'high', 'medium', 'low'
    assignee: 'all', // 'all', 'assigned', 'unassigned', 'me'
  });

  // 현재 필터가 적용되었는지 확인
  const isFilterActive = () => {
    return (
      !filters.showCompleted ||
      filters.priority !== 'all' ||
      filters.assignee !== 'all' ||
      searchTerm.trim() !== ''
    );
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setFilters({
      showCompleted: true,
      priority: 'all',
      assignee: 'all',
    });
    setSearchTerm('');
  };

  // 뷰 모드에 따른 활성화 스타일
  const getActiveModeStyle = (mode) => {
    return viewMode === mode
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-white text-gray-600 hover:bg-gray-100';
  };

  // 필터가 적용된 작업 데이터 계산 (실제 구현에서는 이 로직이 더 복잡할 수 있음)
  const filteredTasks = tasks;

  return (
    // <div className="bg-white rounded-md shadow p-4 mt-6">
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">프로젝트 작업</h2>

          {/* 필터 적용 상태 표시 */}
          {isFilterActive() && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs flex items-center">
              필터 적용됨
              <button
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                onClick={resetFilters}
              >
                ×
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 검색 입력 */}
          <div className="relative">
            <Input
              type="text"
              placeholder="작업 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<FiSearch className="text-gray-400" />}
              className="w-60"
            />
          </div>

          {/* 필터 버튼 */}
          <Button
            variant="outline"
            size="sm"
            className={isFilterActive() ? 'bg-indigo-50 border-indigo-200' : ''}
            icon={<FiFilter />}
          >
            필터
          </Button>

          {/* 뷰 모드 전환 버튼 그룹 */}
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <button
              className={`px-2 py-1 ${getActiveModeStyle('table')}`}
              onClick={() => setViewMode('table')}
              title="테이블 뷰"
            >
              <FiList size={18} />
            </button>
            <button
              className={`px-2 py-1 ${getActiveModeStyle('card')}`}
              onClick={() => setViewMode('card')}
              title="카드 뷰"
              disabled
            >
              <FiGrid size={18} />
            </button>
            <button
              className={`px-2 py-1 ${getActiveModeStyle('timeline')}`}
              onClick={() => setViewMode('timeline')}
              title="타임라인 뷰"
              disabled
            >
              <FiClock size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 뷰 모드에 따른 컴포넌트 렌더링 */}
      {viewMode === 'table' && (
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

      {viewMode === 'card' && (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          카드 뷰는 현재 개발 중입니다.
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
          타임라인 뷰는 현재 개발 중입니다.
        </div>
      )}

      {/* 통계 요약 */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
        <div>
          총 <span className="font-medium">{tasks.length}</span>개 작업
          {!filters.showCompleted && ' (완료된 작업 제외)'}
        </div>
        <div>
          완료:{' '}
          <span className="font-medium">
            {tasks.filter((task) => task.completed).length}
          </span>
          개 / 진행중:{' '}
          <span className="font-medium">
            {tasks.filter((task) => !task.completed).length}
          </span>
          개
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskSection;
