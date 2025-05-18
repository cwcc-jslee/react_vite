// src/features/project/sections/ProjectTaskSection.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus } from 'react-icons/fi';
import { apiCommon } from '@shared/api/apiCommon';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';
import { Button } from '@shared/components/ui';

// 커스텀 훅
import useWorkStore from '../../work/hooks/useWorkStore';
import { useProjectBucketStore } from '../hooks/useProjectBucketStore';
import useModal from '../../../shared/hooks/useModal';
import { useCodebook } from '@shared/hooks/useCodebook';
import useSelectData from '../../../shared/hooks/useSelectData';
import { useProjectTaskSubmit } from '../hooks/useProjectTaskSubmit';

// 컴포넌트
import ProjectTaskList from '../components/tables/ProjectTaskList';
import ProjectTaskBoard from '../components/card/ProjectTaskBoard';
import ProjectWorkListSection from './ProjectWorkListSection';
import ProjectTaskEditForm from '../components/forms/ProjectTaskEditForm';

/**
 * 프로젝트 작업 섹션 컴포넌트
 * 프로젝트의 작업 목록을 다양한 뷰 모드로 표시
 */
const ProjectDetailTaskSection = ({
  // data,
  // projectTaskBuckets = [],
  projectTasks = [],
  bucketActions,
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
    editState,
    actions: { bucket, edit, task, ui },
  } = useProjectBucketStore();

  const { modalState, openModal, closeModal, handleConfirm } = useModal();

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'priorityLevel', // 우선순위(긴급,중요,중간,낮음)
    'taskProgress', // 작업진행률
  ]);
  // API 사용자 정보 조회
  const { data: usersData, isLoading: isUsersLoading } = useSelectData(
    apiCommon.getUsers,
  );

  console.log(`===== codebooks`, codebooks);

  // Redux 상태에서 현재 레이아웃 설정 가져오기
  const { layout, subMenu } = useSelector((state) => state.ui.pageLayout);
  const activeMenu = subMenu.menu;

  const { handleFilterChange, handleResetFilters } = useWorkStore();

  // 태스크 수정 여부 상태
  const [isTaskModified, setIsTaskModified] = useState(false);

  const { isSubmitting, progress, handleTaskUpdate } = useProjectTaskSubmit();

  // 유효한 데이터가 있는지 확인 (projectTaskBuckets이 있어야 함)
  // const hasValidData = projectTaskBuckets.length > 0 && projectTasks.length > 0;

  /**
   * 작업 수정 모달 핸들러
   */
  const handleOpenTaskEditModal = (task, bucketIndex, taskIndex) => {
    openModal(
      'custom',
      '작업 수정',
      <ProjectTaskEditForm
        task={task}
        codebooks={codebooks}
        usersData={usersData}
        onSave={(updatedTask) => {
          bucketActions.task.updateTask(bucketIndex, taskIndex, updatedTask);
          setIsTaskModified(true);
          closeModal();
        }}
        onCancel={closeModal}
      />,
      null,
      null,
      null,
      { size: 'xl' },
    );
  };

  /**
   * 새 버킷(컬럼) 추가 핸들러
   * 섹션 내부에서 로컬로 처리하는 로직
   */
  const handleAddColumnClick = () => {
    const newColumn = {
      bucket: '새 버킷',
      tasks: [],
    };

    bucket.addColumn(newColumn);
  };

  const allTasksWithIndices = useMemo(() => {
    const tasks = [];
    buckets.forEach((bucket, bucketIndex) => {
      const tasksWithBucket = bucket.tasks.map((task, taskIndex) => ({
        ...task,
        bucket: bucket.name,
        bucketId: bucket.id,
        _bucketIndex: bucketIndex,
        _taskIndex: taskIndex,
      }));
      tasks.push(...tasksWithBucket);
    });
    return tasks;
  }, [buckets]);

  return (
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">프로젝트 TASK</h2>
          {activeMenu === 'board' && (
            <Button
              variant="primary"
              size="sm"
              disabled={!isTaskModified || isSubmitting}
              onClick={async () => {
                const result = await handleTaskUpdate(buckets);
                if (result.success) {
                  setIsTaskModified(false);
                }
              }}
            >
              {isSubmitting ? `업데이트 중... ${progress}%` : 'TASK 업데이트'}
            </Button>
          )}
        </div>
      </div>

      <>
        {/* 뷰 모드에 따른 컴포넌트 렌더링 */}
        {activeMenu === 'table' && (
          <ProjectTaskList projectTasks={projectTasks} />
        )}

        {activeMenu === 'board' && (
          <div
            className="kanban-container flex h-full overflow-x-auto overflow-y-hidden flex-grow"
            style={{ height: 'calc(100vh - 250px)' }}
          >
            {buckets.map((bucket, index) => (
              <ProjectTaskBoard
                key={index}
                bucket={bucket}
                bucketIndex={index}
                totalColumns={buckets.length}
                startEditingColumnTitle={bucket.startEditingColumnTitle}
                editState={editState}
                handleEditChange={edit.handleEditChange}
                saveEdit={edit.saveEdit}
                cancelEdit={edit.cancelEdit}
                onAddTask={task.addTask}
                startEditing={edit.startEditing}
                toggleTaskCompletion={task.toggleCompletion}
                toggleCompletedSection={ui.toggleCompletedSection}
                deleteTask={task.deleteTask}
                deleteColumn={bucket.deleteColumn}
                moveColumn={bucket.moveColumn}
                onOpenTaskEditModal={handleOpenTaskEditModal}
              />
            ))}

            {/* 버킷 추가 버튼 */}
            <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
              <button
                className="w-full h-10 bg-gray-300 text-gray-500 border-2 border-gray-300 rounded-sm flex items-center justify-center text-sm cursor-not-allowed"
                disabled={true}
                // onClick={handleAddColumnClick}
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

      {/* 모달 렌더러 추가 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default ProjectDetailTaskSection;
