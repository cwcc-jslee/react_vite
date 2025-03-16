// src/features/project/components/composes/ProjectAddSection.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
// import { useProject } from '../../context/ProjectProvider';
import { projectTaskInitialState } from '../../../../shared/constants/initialFormState';
import { projectApiService } from '../../services/projectApiService';
import useProjectTask from '../../hooks/useProjectTask';
import KanbanColumn from '../ui/KanbanColumn';
import ProjectBaseForm from '../forms/ProjectBaseForm';

const ProjectAddSection = () => {
  // 로컬 스토리지에서 저장된 칸반 데이터 불러오기
  // const getSavedColumns = () => {
  //   if (typeof window !== 'undefined') {
  //     const savedColumns = localStorage.getItem('kanbanColumns');
  //     return savedColumns ? JSON.parse(savedColumns) : projectTaskInitialState;
  //   }
  //   return projectTaskInitialState;
  // };

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
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const savedInfo = localStorage.getItem('projectInfo');
  //     if (savedInfo) {
  //       setProjectInfo(JSON.parse(savedInfo));
  //     }
  //   }
  // }, []);

  // 커스텀 훅 사용
  const {
    columns,
    editState,
    setColumns, // 칼럼 직접 설정 함수 추가
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
  } = useProjectTask(projectTaskInitialState);

  console.log(`>> columns : `, columns);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = async (templateId) => {
    console.log(`>> handleTemplateSelect [id] : `, templateId);
    if (!templateId) return;

    try {
      // setIsLoadingTemplate(true);

      // 템플릿 상세 정보 조회
      const response = await projectApiService.getTaskTemplate(templateId);

      if (response?.data && response.data.length > 0) {
        const template = response.data[0]?.structure || [];

        console.log(`>> template : `, template);
        // 템플릿에서 가져온 작업을 칸반 보드 형식으로 변환

        setColumns(template);
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    } finally {
      // setIsLoadingTemplate(false);
    }
  };

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
          onTemplateSelect={handleTemplateSelect}
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
