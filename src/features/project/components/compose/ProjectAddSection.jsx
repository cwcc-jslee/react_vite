// src/features/project/components/composes/ProjectAddSection.jsx
import React from 'react';
import { FiPlus } from 'react-icons/fi';
import useProjectTask from '../../hooks/useProjectTask';
import TaskCard from '../ui/TaskCard'; // 수정된 TaskCard 가져오기

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
            className="w-full h-10 flex items-center justify-center text-indigo-600 border-2 border-indigo-600 rounded-sm"
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

// 초기 칸반 데이터
const initialColumns = [
  {
    title: '프로젝트 관리',
    tasks: [
      {
        title: '행정 업무',
        days: '65',
        dueDate: '05.30.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      { title: '내부 조율', days: '1', dueDate: '03.07.', isDueDateRed: true },
      { title: '미팅 및 보고' },
      { title: '품질 관리' },
    ],
  },
  {
    title: '기획 단계',
    tasks: [
      {
        title: '프로젝트 준비',
        days: '5',
        dueDate: '03.07.',
        isDueDateRed: true,
        assignedUsers: ['red-900', 'indigo-500'],
      },
      {
        title: '사이트 기획',
        days: '5',
        dueDate: '03.14.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
    ],
  },
  {
    title: '디자인 단계',
    tasks: [
      {
        title: '디자인 시안',
        days: '5',
        dueDate: '03.21.',
        isDueDateRed: false,
      },
      {
        title: '그레픽 제작',
        days: '5',
        dueDate: '03.21.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      { title: '디자인 확정' },
    ],
  },
  {
    title: '퍼블리싱',
    tasks: [
      { title: '퍼블리싱' },
      { title: '그누보드 구현' },
      { title: '테스트 및 최적화' },
    ],
  },
];

const ProjectAddSection = () => {
  // 커스텀 훅 사용
  const {
    columns,
    editState,
    startEditing,
    startEditingColumnTitle,
    handleEditChange,
    saveEdit,
    cancelEdit,
    addTask,
    addColumn,
    toggleTaskCompletion,
    deleteTask, // 작업 삭제 함수 가져오기
  } = useProjectTask(initialColumns);

  // 새 버킷(컬럼) 추가 핸들러
  const handleAddColumnClick = () => {
    const newColumn = {
      title: '새 버킷',
      tasks: [],
    };

    addColumn(newColumn);
  };

  return (
    <div className="w-full h-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .kanban-container {
              overflow-x: auto !important;
            }
          }
        `,
        }}
      />

      <div
        className="kanban-container flex h-full"
        style={{ minHeight: '600px' }}
      >
        {columns.map((column, index) => (
          <KanbanColumn
            key={index}
            column={column}
            columnIndex={index}
            startEditingColumnTitle={startEditingColumnTitle}
            editState={editState}
            handleEditChange={handleEditChange}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            onAddTask={addTask}
            startEditing={startEditing}
            toggleTaskCompletion={toggleTaskCompletion}
            deleteTask={deleteTask} // 작업 삭제 함수 전달
          />
        ))}

        <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
          <button
            className="w-full h-10 bg-indigo-600 text-white border-2 border-indigo-600 rounded-sm flex items-center justify-center"
            onClick={handleAddColumnClick}
          >
            <FiPlus className="mr-2" size={18} />
            <span>버킷 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAddSection;
