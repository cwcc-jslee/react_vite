// src/features/project/components/composes/ProjectAddSection.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 버킷(컬럼) 추가 및 작업 관리 기능을 제공합니다

import React, { useState } from 'react';
import { FiPlus, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import useProjectTask from '../../hooks/useProjectTask';
import KanbanColumn from '../ui/KanbanColumn';

// 초기 칸반 데이터
const initialColumns = [
  {
    bucket: '프로젝트 관리', // title -> bucket으로 변경
    tasks: [
      {
        title: '행정 업무',
        days: '65',
        dueDate: '05.30.',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      {
        title: '내부 조율',
        days: '1',
        dueDate: '2025-03-07',
        pjt_progress: '100',
      },
      { title: '미팅 및 보고' },
      { title: '품질 관리' },
    ],
  },
  {
    bucket: '기획 단계', // title -> bucket으로 변경
    tasks: [
      {
        title: '프로젝트 준비',
        days: '5',
        dueDate: '2025-03-07',
        assignedUsers: ['red-900', 'indigo-500'],
      },
      {
        title: '사이트 기획',
        days: '5',
        dueDate: '2025-03-14',
        isDueDateRed: false,
        pjt_progress: '100',
      },
    ],
  },
  {
    bucket: '디자인 단계', // title -> bucket으로 변경
    tasks: [
      {
        title: '디자인 시안',
        days: '5',
        dueDate: '2025-03-21',
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
    bucket: '퍼블리싱', // title -> bucket으로 변경
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
    toggleCompletedSection,
    deleteTask,
    deleteColumn,
    moveColumn,
  } = useProjectTask(initialColumns);

  // 새 버킷(컬럼) 추가 핸들러
  const handleAddColumnClick = () => {
    const newColumn = {
      bucket: '새 버킷', // title -> bucket으로 변경
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
            totalColumns={columns.length}
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
          />
        ))}

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
  );
};

export default ProjectAddSection;
