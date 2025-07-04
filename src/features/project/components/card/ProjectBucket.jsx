// src/features/project/components/ui/KanbanColumn.jsx
// 칸반 보드의 개별 컬럼(버킷)을 표현하는 컴포넌트
// 버킷 제목 편집, 작업 관리, 컬럼 이동 및 삭제 기능을 제공합니다

import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiChevronUp,
  FiChevronDown,
  FiAlertTriangle,
} from 'react-icons/fi';
import ProjectTaskCard from './ProjectTaskCard';
import ConfirmDialog from './ConfirmDialog';

/**
 * 칸반 컬럼 컴포넌트
 *
 */
const ProjectBucket = ({
  bucket,
  bucketIndex,
  totalColumns,
  startEditingColumnTitle,
  editState,
  handleEditChange,
  saveEdit,
  cancelEdit,
  onAddTask,
  startEditing,
  toggleTaskCompletion,
  toggleCompletedSection,
  deleteTask,
  deleteColumn,
  moveColumn,
  onOpenTaskEditModal, // 작업 수정 모달 열기
  isSingleWorkType,
}) => {
  // 메뉴 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);
  // 완료된 작업 섹션 접힘/펼침 상태
  const [completedExpanded, setCompletedExpanded] = useState(true);
  // 삭제 확인 다이얼로그 상태
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const menuRef = useRef(null);

  const isEditingTitle =
    editState.isEditing &&
    editState.bucketIndex === bucketIndex &&
    editState.field === 'bucketTitle';

  // 작업을 완료된 것과 진행 중인 것으로 분류
  const completedTasks = bucket.tasks.filter(
    (task) => task.pjt_progress === '100',
  );
  const pendingTasks = bucket.tasks.filter(
    (task) => task.pjt_progress !== '100',
  );

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 작업 추가 버튼 클릭 핸들러
  const handleAddTaskClick = () => {
    const newTask = {
      name: '새 작업',
      taskScheduleType: 'scheduled',
    };

    onAddTask(bucketIndex, newTask);
  };

  // 컬럼 이동 핸들러
  const handleMoveColumn = (direction) => {
    moveColumn(bucketIndex, direction);
    setMenuOpen(false);
  };

  // 컬럼 삭제 확인 핸들러
  const handleDeleteConfirm = () => {
    deleteColumn(bucketIndex);
    setShowDeleteDialog(false);
  };

  // 컬럼 삭제 취소 핸들러
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex-shrink-0 w-72 h-full flex flex-col kanban-column">
        <div className="flex flex-col h-full border-0 rounded-md bg-gray-50 shadow-sm mx-2">
          <div className="p-3 border-b relative group">
            {/* 컬럼 제목 */}
            <div className="flex items-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editState.value}
                  onChange={(e) => handleEditChange(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="font-semibold text-zinc-800 mb-3 pl-1 w-full bg-white border border-indigo-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <h2
                  className="font-semibold text-zinc-800 mb-3 pl-1 cursor-pointer hover:text-indigo-700 flex-grow"
                  // onClick={() => startEditingColumnTitle(bucketIndex)}
                >
                  {bucket.name}
                </h2>
              )}

              {/* 메뉴 버튼 - 호버 시에만 표시 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <FiMoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-3 mt-1 w-36 bg-white shadow-lg rounded-md py-1 z-20 border border-gray-200"
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    startEditingColumnTitle(bucketIndex);
                    setMenuOpen(false);
                  }}
                >
                  <FiEdit className="mr-2" size={14} />
                  이름 바꾸기
                </button>
              </div>
            )}

            {/* 작업 추가 버튼 */}
            <div className="p-2">
              <button
                className={`w-full h-10 flex items-center justify-center ${
                  isSingleWorkType
                    ? 'text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'text-indigo-600 border-indigo-600'
                } border-2 rounded-sm text-sm`}
                disabled={true}
              >
                <FiPlus className="mr-2" size={18} />
                <span>작업 추가</span>
              </button>
            </div>
          </div>

          {/* 작업 카드 목록 - 스크롤 가능하도록 수정 */}
          <div className="flex-grow overflow-y-auto px-3 py-2 kanban-column-content">
            {/* 진행 중인 작업 목록 */}
            {pendingTasks.map((task, taskIndex) => {
              // 실제 전체 tasks 배열에서의 인덱스 계산
              const actualIndex = bucket.tasks.findIndex((t) => t === task);
              return (
                <ProjectTaskCard
                  key={actualIndex}
                  task={task}
                  bucketIndex={bucketIndex}
                  taskIndex={actualIndex}
                  // startEditing={startEditing}
                  // editState={editState}
                  // handleEditChange={handleEditChange}
                  // saveEdit={saveEdit}
                  // cancelEdit={cancelEdit}
                  toggleTaskCompletion={toggleTaskCompletion}
                  deleteTask={deleteTask}
                  onOpenTaskEditModal={onOpenTaskEditModal}
                  // isSingleWorkType={isSingleWorkType}
                />
              );
            })}

            {/* 완료된 작업이 있는 경우 완료됨 섹션 표시 */}
            {completedTasks.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-md">
                {/* 완료됨 섹션 헤더 */}
                <div
                  className="flex items-center py-2 px-3 cursor-pointer text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCompletedExpanded(!completedExpanded);
                  }}
                >
                  {completedExpanded ? (
                    <FiChevronUp className="mr-2" size={16} />
                  ) : (
                    <FiChevronDown className="mr-2" size={16} />
                  )}
                  <span className="text-sm font-medium">
                    완료됨 ({completedTasks.length})
                  </span>
                </div>

                {/* 완료된 작업 목록 (펼쳐진 경우에만 표시) */}
                {completedExpanded && (
                  <div className="mt-1 pb-2">
                    {completedTasks.map((task, taskIndex) => {
                      // 실제 전체 tasks 배열에서의 인덱스 계산
                      const actualIndex = bucket.tasks.findIndex(
                        (t) => t === task,
                      );
                      return (
                        <ProjectTaskCard
                          key={actualIndex}
                          task={task}
                          bucketIndex={bucketIndex}
                          taskIndex={actualIndex}
                          // startEditing={startEditing}
                          editState={editState}
                          handleEditChange={handleEditChange}
                          saveEdit={saveEdit}
                          cancelEdit={cancelEdit}
                          toggleTaskCompletion={toggleTaskCompletion}
                          deleteTask={deleteTask}
                          onOpenTaskEditModal={onOpenTaskEditModal}
                          isSingleWorkType={isSingleWorkType}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="버킷 삭제"
          message={`"${bucket.name}" 버킷과 모든 작업을 삭제하시겠습니까?`}
          confirmLabel="삭제"
          cancelLabel="취소"
          icon={<FiAlertTriangle className="text-red-500" size={24} />}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

export default ProjectBucket;
