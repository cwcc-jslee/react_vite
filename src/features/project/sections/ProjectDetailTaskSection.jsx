// src/features/project/sections/ProjectTaskSection.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus } from 'react-icons/fi';

// 커스텀 훅
import useProjectTask from '../hooks/useProjectTask';
import useWorkStore from '../../work/hooks/useWorkStore';

// 컴포넌트
import ProjectTaskList from '../components/tables/ProjectTaskList';
import KanbanColumn from '../components/card/KanbanColumn';
import ProjectDetailTaskBoard from '../components/card/ProjectDetailTaskBoard';
import ProjectWorkListSection from './ProjectWorkListSection';

/**
 * 프로젝트 작업 섹션 컴포넌트
 * 프로젝트의 작업 목록을 다양한 뷰 모드로 표시
 */
const ProjectDetailTaskSection = ({
  projectTaskBuckets = [],
  projectTasks = [],
  //
  // pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  error = null,
  handlePageChange = () => {},
  handlePageSizeChange = () => {},
  onTaskComplete = () => {},
  onTaskEdit = () => {},
}) => {
  // 칸반 보드 훅 사용
  const {
    buckets,
    syncProjectTasksToKanban,
    resetKanbanBoard,
    editState,
    startEditing,
    startEditingColumnTitle,
    handleEditChange,
    saveEdit,
    cancelEdit,
    addTask,
    addColumn,
    toggleTaskCompletion,
    toggleCompletedSection,
    deleteTask,
    deleteColumn,
    moveColumn,
    updateTask,
  } = useProjectTask();
  // Redux 상태에서 현재 레이아웃 설정 가져오기
  const { subMenu } = useSelector((state) => state.ui.pageLayout);
  const activeMenu = subMenu.menu;

  const { handleFilterChange, handleResetFilters } = useWorkStore();

  // 유효한 데이터가 있는지 확인 (projectTaskBuckets이 있어야 함)
  const hasValidData = projectTaskBuckets.length > 0 && projectTasks.length > 0;

  /**
   * 새 버킷(컬럼) 추가 핸들러
   * 섹션 내부에서 로컬로 처리하는 로직
   */
  const handleAddColumnClick = () => {
    const newColumn = {
      bucket: '새 버킷',
      tasks: [],
    };

    addColumn(newColumn);
  };

  const allTasksWithIndices = useMemo(() => {
    const tasks = [];
    buckets.forEach((bucket, bucketIndex) => {
      const tasksWithBucket = bucket.tasks.map((task, taskIndex) => ({
        ...task,
        bucket: bucket.bucket,
        bucketId: bucket.id,
        _bucketIndex: bucketIndex,
        _taskIndex: taskIndex,
      }));
      tasks.push(...tasksWithBucket);
    });
    return tasks;
  }, [buckets]);

  // 데이터가 유효하지 않을 경우 보여줄 메시지
  const NoDataMessage = () => (
    <div className="p-8 text-center">
      <div className="mb-4 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        버킷 데이터가 없습니다
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        작업을 표시하기 위해서는 최소 하나 이상의 버킷이 필요합니다. 프로젝트
        설정에서 버킷을 추가해주세요.
      </p>
    </div>
  );

  // projectTaskBuckets와 projectTasks 데이터를 kanbanSlice로 동기화
  useEffect(() => {
    if (projectTaskBuckets.length > 0 && projectTasks.length > 0) {
      syncProjectTasksToKanban(projectTaskBuckets, projectTasks);
    }

    // 컴포넌트 언마운트 시 버킷 상태 초기화
    return () => {
      resetKanbanBoard();
    };
  }, [
    projectTaskBuckets,
    projectTasks,
    syncProjectTasksToKanban,
    resetKanbanBoard,
  ]);

  return (
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">프로젝트 TASK</h2>
        </div>
      </div>

      {/* 데이터 유효성 검사 후 컴포넌트 렌더링 */}
      {!hasValidData ? (
        <NoDataMessage />
      ) : (
        <>
          {/* 뷰 모드에 따른 컴포넌트 렌더링 */}
          {activeMenu === 'table' && (
            <ProjectTaskList
              allTasks={allTasksWithIndices}
              loading={loading}
              error={error}
              handlePageChange={handlePageChange}
              handlePageSizeChange={handlePageSizeChange}
              onTaskComplete={onTaskComplete}
              onTaskEdit={onTaskEdit}
            />
          )}

          {/* {activeMenu === 'board' && <ProjectDetailTaskBoard />} */}
          {activeMenu === 'board' && (
            <div
              className="kanban-container flex h-full overflow-x-auto overflow-y-hidden flex-grow"
              style={{ height: 'calc(100vh - 250px)' }}
            >
              {buckets.map((bucket, index) => (
                <KanbanColumn
                  key={index}
                  bucket={bucket}
                  bucketIndex={index}
                  totalColumns={buckets.length}
                  startEditingColumnTitle={startEditingColumnTitle}
                  editState={editState}
                  handleEditChange={handleEditChange}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                  onAddTask={addTask}
                  startEditing={startEditing}
                  toggleTaskCompletion={toggleTaskCompletion}
                  toggleCompletedSection={toggleCompletedSection}
                  deleteTask={deleteTask}
                  deleteColumn={deleteColumn}
                  moveColumn={moveColumn}
                  // onOpenTaskEditModal={handleOpenTaskEditModal}
                />
              ))}

              {/* 버킷 추가 버튼 */}
              <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
                <button
                  className="w-full h-10 bg-indigo-600 text-white border-2 border-indigo-600 rounded-sm flex items-center justify-center text-sm"
                  disabled={true}
                  onClick={handleAddColumnClick}
                >
                  <FiPlus className="mr-2" size={18} />
                  <span>버킷 추가</span>
                </button>
              </div>
            </div>
          )}

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

          {activeMenu === 'work' && <ProjectWorkListSection />}
        </>
      )}
    </div>
  );
};

export default ProjectDetailTaskSection;
