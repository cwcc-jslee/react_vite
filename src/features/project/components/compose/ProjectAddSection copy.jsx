// src/features/project/components/composes/ProjectAddSection.jsx
import React, { useState } from 'react';
import TaskCard from '../ui/TaskCard';
import { FiPlus } from 'react-icons/fi';
import useProjectTask from '../../hooks/useProjectTask';

// 수정 가능한 제목 컴포넌트
const EditableTitle = ({ title, onTitleChange, columnIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  // 수정 모드 전환
  const handleTitleClick = () => {
    setIsEditing(true);
  };

  // 제목 변경 처리
  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  // 제목 저장
  const handleTitleSave = () => {
    onTitleChange(columnIndex, editedTitle);
    setIsEditing(false);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(title); // 원래 값으로 복원
      setIsEditing(false);
    }
  };

  // 외부 클릭 시 저장
  const handleBlur = () => {
    handleTitleSave();
  };

  return isEditing ? (
    <input
      type="text"
      value={editedTitle}
      onChange={handleTitleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="font-semibold text-zinc-800 mb-3 pl-1 w-full bg-white border border-indigo-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      autoFocus
    />
  ) : (
    <h2
      className="font-semibold text-zinc-800 mb-3 pl-1 cursor-pointer hover:text-indigo-700"
      onClick={handleTitleClick}
    >
      {title}
    </h2>
  );
};

// 칸반 컬럼 컴포넌트
const KanbanColumn = ({
  title,
  tasks,
  columnIndex,
  onTitleChange,
  onTaskClick,
  onAddTask,
}) => {
  // 작업 추가 버튼 클릭 핸들러
  const handleAddTaskClick = () => {
    // 새 작업 추가 로직
    const newTask = {
      title: '새 작업',
      days: '',
      dueDate: '',
    };

    onAddTask(columnIndex, newTask);
  };

  return (
    <div className="flex-shrink-0 w-72 h-full flex flex-col">
      {/* 컬럼 전체를 감싸는 하나의 div - 테두리 제거 */}
      <div className="flex flex-col h-full border-0 rounded-md bg-gray-50 shadow-sm mx-2">
        {/* 제목 및 작업 추가 버튼 박스 (고정 크기) */}
        <div className="p-3 border-b">
          <EditableTitle
            title={title}
            onTitleChange={onTitleChange}
            columnIndex={columnIndex}
          />

          <button
            className="w-full h-10 flex items-center justify-center text-indigo-600 border-2 border-indigo-600 rounded-sm"
            onClick={handleAddTaskClick}
          >
            <FiPlus className="mr-2" size={18} />
            <span>작업 추가</span>
          </button>
        </div>

        {/* 작업 카드 목록 박스 (세로 고정 크기) */}
        <div className="flex-grow overflow-y-auto p-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={index}
              {...task}
              onClick={() => onTaskClick(columnIndex, index, task)}
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
    handleColumnTitleChange,
    handleTaskClick,
    addTask,
    addColumn,
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
            title={column.title}
            tasks={column.tasks}
            columnIndex={index}
            onTitleChange={handleColumnTitleChange}
            onTaskClick={handleTaskClick}
            onAddTask={addTask}
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
