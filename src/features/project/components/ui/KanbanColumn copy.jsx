// src/shared/components/ui/KanbanColumn.jsx
// 칸반 보드의 개별 컬럼(버킷)을 표현하는 컴포넌트
// 버킷 제목 편집, 작업 관리, 컬럼 이동 및 삭제 기능을 제공합니다

import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import TaskCard from './TaskCard';

// 칸반 컬럼 컴포넌트
const KanbanColumn = ({
  column,
  columnIndex,
  totalColumns,
  startEditingColumnTitle,
  editState,
  handleEditChange,
  saveEdit,
  cancelEdit,
  onAddTask,
  startEditing,
  toggleTaskCompletion,
  deleteTask,
  deleteColumn,
  moveColumn,
}) => {
  // 메뉴 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isEditingTitle =
    editState.isEditing &&
    editState.columnIndex === columnIndex &&
    editState.field === 'columnTitle';

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
      title: '새 작업',
      days: '',
      dueDate: '',
    };

    onAddTask(columnIndex, newTask);
  };

  // 컬럼 삭제 핸들러
  const handleDeleteColumn = () => {
    deleteColumn(columnIndex);
    setMenuOpen(false);
  };

  // 컬럼 이동 핸들러
  const handleMoveColumn = (direction) => {
    moveColumn(columnIndex, direction);
    setMenuOpen(false);
  };

  return (
    <div className="flex-shrink-0 w-72 h-full flex flex-col">
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
                onClick={() => startEditingColumnTitle(columnIndex)}
              >
                {column.bucket}
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
                  startEditingColumnTitle(columnIndex);
                  setMenuOpen(false);
                }}
              >
                <FiEdit className="mr-2" size={14} />
                이름 바꾸기
              </button>

              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                onClick={handleDeleteColumn}
              >
                <FiTrash2 className="mr-2" size={14} />
                삭제
              </button>

              {/* 왼쪽으로 이동 버튼 (첫 번째 컬럼이 아닐 때만 표시) */}
              {columnIndex > 0 && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleMoveColumn('left')}
                >
                  <FiArrowLeft className="mr-2" size={14} />
                  왼쪽으로 이동
                </button>
              )}

              {/* 오른쪽으로 이동 버튼 (마지막 컬럼이 아닐 때만 표시) */}
              {columnIndex < totalColumns - 1 && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleMoveColumn('right')}
                >
                  <FiArrowRight className="mr-2" size={14} />
                  오른쪽으로 이동
                </button>
              )}
            </div>
          )}

          {/* 작업 추가 버튼 */}
          <button
            className="w-full h-10 flex items-center justify-center text-indigo-600 border-2 border-indigo-600 rounded-sm text-sm"
            onClick={handleAddTaskClick}
          >
            <FiPlus className="mr-2" size={18} />
            <span>작업 추가</span>
          </button>
        </div>

        {/* 작업 카드 목록 - 전체 높이를 채우도록 수정 */}
        <div
          className="flex-grow overflow-y-auto p-3"
          style={{ minHeight: '10rem' }}
        >
          {column.tasks.map((task, taskIndex) => (
            <TaskCard
              key={taskIndex}
              task={task}
              columnIndex={columnIndex}
              taskIndex={taskIndex}
              startEditing={startEditing}
              editState={editState}
              handleEditChange={handleEditChange}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              toggleTaskCompletion={toggleTaskCompletion}
              deleteTask={deleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
