// src/features/project/components/composes/ProjectAddSection.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
// import { useProject } from '../../context/ProjectProvider';

import useProjectTask from '../../hooks/useProjectTask';
import KanbanColumn from '../ui/KanbanColumn';
import ProjectBaseForm from '../forms/ProjectBaseForm';

// 초기 칸반 데이터
const initialColumns = [
  {
    bucket: '프로젝트 관리',
    tasks: [
      {
        title: '행정 업무',
        days: '65',
        dueDate: '2025-03-01',
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
    bucket: '기획 단계',
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
    bucket: '디자인 단계',
    tasks: [
      {
        title: '디자인 시안',
        days: '5',
        dueDate: '2025-03-21',
      },
      {
        title: '그레픽 제작',
        days: '5',
        dueDate: '2025-04-14',
        isDueDateRed: false,
        pjt_progress: '100',
      },
      { title: '디자인 확정' },
    ],
  },
  {
    bucket: '퍼블리싱',
    tasks: [
      { title: '퍼블리싱' },
      { title: '그누보드 구현' },
      { title: '테스트 및 최적화' },
    ],
  },
];

const ProjectAddSection = () => {
  // 로컬 스토리지에서 저장된 칸반 데이터 불러오기
  const getSavedColumns = () => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('kanbanColumns');
      return savedColumns ? JSON.parse(savedColumns) : initialColumns;
    }
    return initialColumns;
  };

  // 프로젝트 정보 상태 관리
  const [projectInfo, setProjectInfo] = useState({
    customer: '',
    sfa: '',
    projectName: '',
    service: '',
    department: '',
  });

  // 프로젝트 정보 변경 핸들러
  const handleProjectInfoChange = (newInfo) => {
    setProjectInfo(newInfo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectInfo', JSON.stringify(newInfo));
    }
  };

  // 페이지 로드 시 저장된 프로젝트 정보 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInfo = localStorage.getItem('projectInfo');
      if (savedInfo) {
        setProjectInfo(JSON.parse(savedInfo));
      }
    }
  }, []);

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
  } = useProjectTask(getSavedColumns());

  // 칸반 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      localStorage.setItem('kanbanColumns', JSON.stringify(columns));
    }
  }, [columns]);

  // 새 버킷(컬럼) 추가 핸들러
  const handleAddColumnClick = () => {
    const newColumn = {
      bucket: '새 버킷',
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

      {/* 프로젝트 정보 폼 */}
      <div className="w-full mb-4">
        <ProjectBaseForm
          projectInfo={projectInfo}
          onInfoChange={handleProjectInfoChange}
        />
      </div>

      <div
        className="kanban-container flex h-full overflow-x-auto"
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
