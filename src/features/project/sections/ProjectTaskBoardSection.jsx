// src/features/project/sections/ProjectTaskBoardSection.jsx
// 프로젝트 태스크 관리를 위한 칸반보드 섹션
// 프로젝트 태스크와 버킷을 시각적으로 관리할 수 있는 UI 제공

import React, { useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import KanbanColumn from '../components/card/KanbanColumn';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';
import { apiCommon } from '../../../shared/api/apiCommon';

// 커스텀 훅
import { useCodebook } from '@shared/hooks/useCodebook';
import useModal from '../../../shared/hooks/useModal';
import useProjectTask from '../hooks/useProjectTask';
import useSelectData from '../../../shared/hooks/useSelectData';

// 컴포넌트
import ProjectTaskForm from '../components/forms/ProjectTaskForm';

/**
 * 프로젝트 작업 칸반보드 섹션 컴포넌트
 * 프로젝트 작업을 관리하는 칸반보드를 제공
 * @param {Object} props
 * @param {Array} props.projectTaskBuckets - 프로젝트 태스크 버킷 목록
 * @param {Array} props.projectTasks - 프로젝트 태스크 목록
 */
const ProjectTaskBoardSection = () => {
  // 칸반 보드 훅 사용
  const {
    buckets,
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

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'priorityLevel', // 우선순위(긴급,중요,중간,낮음)
    'taskProgress', // 작업진행률
  ]);

  const { modalState, openModal, closeModal, handleConfirm } = useModal();
  // API 사용자 정보 조회
  const { data: usersData, isLoading: isUsersLoading } = useSelectData(
    apiCommon.getUsers,
  );

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

  /**
   * 칸반 컬럼 데이터 검증 및 처리
   * @returns {boolean} 유효한 데이터인지 여부
   */
  const validateKanbanData = () => {
    // 버킷이 하나도 없는 경우
    if (!buckets || buckets.length === 0) {
      return false;
    }

    // 모든 버킷에 이름이 있는지 확인
    const hasInvalidBucket = buckets.some(
      (bucket) => !bucket.bucket || bucket.bucket.trim() === '',
    );
    if (hasInvalidBucket) {
      return false;
    }

    return true;
  };

  /**
   * 작업 수정 모달 핸들러
   */
  const handleOpenTaskEditModal = (task, bucketIndex, taskIndex) => {
    openModal(
      'custom',
      '작업 수정',
      <ProjectTaskForm
        task={task}
        codebooks={codebooks}
        usersData={usersData}
        onSave={(updatedTask) => {
          updateTask(bucketIndex, taskIndex, updatedTask);
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

  return (
    <>
      {/* 칸반보드 컨테이너 */}
      <div className="flex flex-row h-full flex-grow overflow-hidden">
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
              onOpenTaskEditModal={handleOpenTaskEditModal}
            />
          ))}

          {/* 버킷 추가 버튼 */}
          <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
            <button
              className="w-full h-10 bg-indigo-600 text-white border-2 border-indigo-600 rounded-sm flex items-center justify-center text-sm"
              onClick={handleAddColumnClick}
            >
              <FiPlus className="mr-2" size={18} />
              <span>버킷 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 모달 렌더러 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
      {/* </div> */}
    </>
  );
};

export default ProjectTaskBoardSection;
