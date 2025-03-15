import React from 'react';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './TaskCard'; // 수정된 TaskCard 가져오기

// 칸반 컬럼 컴포넌트
const KanbanColumn = ({
  column,
  columnIndex,
  startEditingColumnTitle,
  editState,
  handleEditChange,
  saveEdit,
  cancelEdit,
  onAddTask,
  startEditing,
  toggleTaskCompletion,
  deleteTask, // 작업 삭제 함수 추가
}) => {
  const isEditingTitle =
    editState.isEditing &&
    editState.columnIndex === columnIndex &&
    editState.field === 'columnTitle';

  // 작업 추가 버튼 클릭 핸들러
  const handleAddTaskClick = () => {
    const newTask = {
      title: '새 작업',
      days: '',
      dueDate: '',
    };

    onAddTask(columnIndex, newTask);
  };

  return (
    <div className="flex-shrink-0 w-72 h-full flex flex-col">
      <div className="flex flex-col h-full border-0 rounded-md bg-gray-50 shadow-sm mx-2">
        <div className="p-3 border-b">
          {/* 컬럼 제목 */}
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
              className="font-semibold text-zinc-800 mb-3 pl-1 cursor-pointer hover:text-indigo-700"
              onClick={() => startEditingColumnTitle(columnIndex)}
            >
              {column.title}
            </h2>
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

        {/* 작업 카드 목록 */}
        <div className="flex-grow overflow-y-auto p-3">
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
              deleteTask={deleteTask} // 작업 삭제 함수 전달
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
