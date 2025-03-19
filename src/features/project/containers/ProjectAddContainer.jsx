// src/features/project/containers/ProjectAddContainer.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
// import { useProject } from '../../context/ProjectProvider';
import { projectTaskInitialState } from '../../../shared/constants/initialFormState';
import { projectApiService } from '../services/projectApiService';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import useProjectTask from '../hooks/useProjectTask';
import useModal from '../../../shared/hooks/useModal';
// 컴포넌트
import KanbanColumn from '../components/ui/KanbanColumn';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';
import ProjectTaskForm from '../components/emements/ProjectTaskForm';

/**
 * 프로젝트 추가 컨테이너 컴포넌트
 * 프로젝트 기본 정보 입력 폼과 칸반 보드를 통합하여 제공
 * 모든 모달 관리를 중앙화하여 일관된 UI 경험을 제공
 *
 * @returns {React.ReactElement} 프로젝트 추가 화면
 */
const ProjectAddContainer = () => {
  // 프로젝트 정보 상태 관리
  const [projectInfo, setProjectInfo] = useState({
    customer: '',
    sfa: '',
    projectName: '',
    service: '',
    department: '',
  });

  // 현재 선택된 작업 정보 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  // 모달 관련 커스텀 훅 사용
  const { modalState, openModal, closeModal, handleConfirm } = useModal();

  // API 데이터 상태 조회
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook([
    'priority_level', // 우선순위(긴급,중요,중간,낮음)
    'task_progress', // 작업진행률
  ]);

  const handleProjectInfoChange = () => {
    //
  };

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

  /**
   * 작업 수정 모달을 여는 핸들러
   *
   * @param {Object} task - 수정할 작업 객체
   * @param {number} columnIndex - 작업이 속한 컬럼의 인덱스
   * @param {number} taskIndex - 컬럼 내 작업의 인덱스
   */
  const handleOpenTaskEditModal = (task, columnIndex, taskIndex) => {
    // 선택된 작업 정보 저장
    setSelectedTask(task);
    setSelectedColumnIndex(columnIndex);
    setSelectedTaskIndex(taskIndex);

    // 모달 열기
    openModal(
      'form',
      '작업 수정',
      <ProjectTaskForm codebooks={codebooks} task={task} />,
      null,
      null,
      null,
      {
        size: 'xl',
      },
    );
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
        <ProjectAddBaseForm
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
            codebooks={codebooks}
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
            onOpenTaskEditModal={handleOpenTaskEditModal}
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

      {/* 중앙 관리되는 모달 렌더러 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default ProjectAddContainer;
