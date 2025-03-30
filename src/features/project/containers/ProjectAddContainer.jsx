// src/features/project/containers/ProjectAddContainer.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus } from 'react-icons/fi';
import { projectTaskInitialState } from '../../../shared/constants/initialFormState';
// import useProjectTask from '../hooks/useProjectTask';
import { projectApiService } from '../services/projectApiService';

// 커스텀 훅 사용
import { apiCommon } from '../../../shared/api/apiCommon';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import useModal from '../../../shared/hooks/useModal';
import useSelectData from '../../../shared/hooks/useSelectData';
import useProjectSubmit from '../hooks/useProjectSubmit';
import useProjectTask from '../hooks/useProjectTask';

// Redux 액션
import { updateFormField, resetForm } from '../store/projectSlice';
// import { selectBuckets, loadTaskTemplate } from '../store/kanbanSlice';

// 컴포넌트
import KanbanColumn from '../components/ui/KanbanColumn';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import ProjectTaskForm from '../components/emements/ProjectTaskForm';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';

// 알림 서비스 추가
import { notification } from '../../../shared/services/notification';

/**
 * 프로젝트 추가 컨테이너 컴포넌트
 * 프로젝트 기본 정보 입력 폼과 칸반 보드를 통합하여 제공
 * 모든 모달 관리를 중앙화하여 일관된 UI 경험을 제공
 * 비즈니스 로직은 커스텀 훅으로 분리
 *
 * @returns {React.ReactElement} 프로젝트 추가 화면
 */
const ProjectAddContainer = () => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const { data: formData = {} } = useSelector((state) => state.project.form);
  // const buckets = useSelector((state) => state.tasks.buckets); // 칸반 데이터를 Redux에서 직접 가져옴

  // 커스텀 훅 사용
  const { modalState, openModal, closeModal, handleConfirm } = useModal();
  const { handleFormSubmit, isSubmitting } = useProjectSubmit();
  // const { getTaskTemplate } = useProjectAPI();

  // API 데이터 상태 조회
  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'priority_level', // 우선순위(긴급,중요,중간,낮음)
    'task_progress', // 작업진행률
    'fy', // 회계년도
    'importance_level', //중요도
    'pjt_status', // 프로젝트 상태
  ]);

  // API 사용자 정보 조회
  const { data: usersData, isLoading: isUsersLoading } = useSelectData(
    apiCommon.getUsers,
  );

  // 새로운 Redux 연결 칸반 훅 사용
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
    loadTemplate,
    resetKanbanBoard,
  } = useProjectTask(projectTaskInitialState);

  /**
   * 폼 필드 업데이트 이벤트 핸들러
   * 이벤트 객체나 (name, value) 형식 모두 처리
   *
   * @param {Event|string} nameOrEvent - 필드 이름 또는 이벤트 객체
   * @param {any} valueOrNothing - 필드 값 (이벤트 객체인 경우 무시)
   */
  const updateField = (nameOrEvent, valueOrNothing) => {
    // 이벤트 객체인 경우
    if (nameOrEvent && nameOrEvent.target) {
      const { name, value } = nameOrEvent.target;
      dispatch(updateFormField({ name, value }));
    }
    // name, value 형태로 직접 호출한 경우
    else {
      dispatch(updateFormField({ name: nameOrEvent, value: valueOrNothing }));
    }
  };

  /**
   * 템플릿 선택 시 작업이 처리되는 핸들러
   * @param {string|number} templateId - 선택된 템플릿 ID
   */
  /**
   * 템플릿 선택 시 작업이 처리되는 핸들러
   * Redux 액션을 사용하여 템플릿 로드
   *
   * @param {string|number} templateId - 선택된 템플릿 ID
   */
  const handleTemplateSelect = async (templateId) => {
    if (!templateId) return;

    try {
      // Redux 액션을 통해 템플릿 로드
      // await dispatch(loadTaskTemplate(templateId));
      await loadTemplate(templateId);
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  /**
   * 새 버킷(컬럼) 추가 핸들러
   */
  const handleAddColumnClick = () => {
    const newColumn = {
      bucket: '새 버킷',
      tasks: [],
    };

    addColumn(newColumn);
  };

  /**
   * 작업 수정 모달을 여는 핸들러
   * @param {Object} task - 수정할 작업 객체
   * @param {number} bucketIndex - 작업이 속한 컬럼의 인덱스
   * @param {number} taskIndex - 컬럼 내 작업의 인덱스
   */
  const handleOpenTaskEditModal = (task, bucketIndex, taskIndex) => {
    // 모달 열기
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
      {
        size: 'xl',
      },
    );
  };

  /**
   * 폼 제출 이벤트 핸들러
   * 커스텀 훅을 통해 유효성 검사 및 제출 처리
   * @param {Event} e - 이벤트 객체
   */
  const onFormSubmit = (e) => {
    // useProjectSubmit 훅의 핸들러 호출
    handleFormSubmit(e, buckets);
  };

  /**
   * 폼 초기화 함수
   */
  const handleReset = () => {
    // Redux 폼 상태 초기화
    dispatch(resetForm());

    // 칸반 보드 초기화 (Redux 액션 사용)
    resetKanbanBoard();

    notification.info({
      message: '폼 초기화',
      description: '모든 입력 내용이 초기화되었습니다.',
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .kanban-container {
              overflow-x: auto !important;
            }
          }
          
          /* 개별 칸반 컬럼의 스크롤 설정 */
          .kanban-column {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }
          
          .kanban-column-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
          }
        `,
        }}
      />
      <ProjectAddBaseForm
        formData={formData}
        codebooks={codebooks}
        handleTemplateSelect={handleTemplateSelect}
        updateField={updateField}
        handleFormSubmit={onFormSubmit}
        handleReset={handleReset}
        isSubmitting={isSubmitting}
      />

      {/* 전체 컨테이너를 수평 레이아웃으로 변경 */}
      <div className="flex flex-row h-full flex-grow overflow-hidden">
        {/* 오른쪽 칸반 보드 컨테이너 */}
        <div
          className="kanban-container flex h-full overflow-x-auto overflow-y-hidden flex-grow"
          style={{ height: 'calc(100vh - 250px)' }}
        >
          {buckets.map((bucket, index) => (
            <KanbanColumn
              key={index}
              codebooks={codebooks}
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
