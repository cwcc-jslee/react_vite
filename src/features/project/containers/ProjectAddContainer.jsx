// src/features/project/containers/ProjectAddContainer.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus } from 'react-icons/fi';
import { projectTaskInitialState } from '../../../shared/constants/initialFormState';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import useSelectData from '../../../shared/hooks/useSelectData';
import useProjectTask from '../hooks/useProjectTask';
import useModal from '../../../shared/hooks/useModal';
import { apiCommon } from '../../../shared/api/apiCommon';
import { projectApiService } from '../services/projectApiService';

// 커스텀 훅 사용
import useProjectSubmit from '../hooks/useProjectSubmit';
// import useProjectAPI from '../hooks/useProjectAPI';

// Redux 액션
import { updateFormField, resetForm } from '../store/projectSlice';

// 컴포넌트
import KanbanColumn from '../components/ui/KanbanColumn';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';
import ProjectTaskForm from '../components/emements/ProjectTaskForm';
import ProjectMenuFields from '../components/forms/ProjectMenuFields';

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

  // 현재 선택된 작업 정보 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

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

  // 프로젝트 작업 상태 관리
  const {
    projectBuckets,
    editState,
    setProjectBuckets,
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
  const handleTemplateSelect = async (templateId) => {
    console.log(`>> handleTemplateSelect [id] : `, templateId);
    if (!templateId) return;

    try {
      // 템플릿 상세 정보 조회
      const response = await projectApiService.getTaskTemplate(templateId);

      if (response?.data && response.data.length > 0) {
        // 원본 템플릿 데이터
        const originalTemplate = response.data[0]?.structure || [];

        // 템플릿 데이터 형식 변환
        const processedTemplate = originalTemplate.map((bucket) => {
          // 각 버킷(컬럼)의 작업들 처리
          const processedTasks = bucket.tasks.map((task) => {
            // 새 task 객체 생성
            const newTask = {};

            // 모든 키를 순회하며 스네이크 케이스를 캐멀 케이스로 변환
            Object.keys(task).forEach((key) => {
              // 스네이크 케이스 감지 (_가 포함된 키)
              if (key.includes('_')) {
                // 스네이크 케이스를 캐멀 케이스로 변환
                const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
                  letter.toUpperCase(),
                );
                newTask[camelKey] = task[key];
              } else {
                // 스네이크 케이스가 아닌 경우 그대로 복사
                newTask[key] = task[key];
              }
            });

            // 특수 처리: taskScheduleType 값에 따른 처리
            // taskScheduleType이 ongoing이면 false, 그 외(undefined 포함)는 true
            if (newTask.taskScheduleType === 'ongoing') {
              newTask.taskScheduleType = false;
            } else {
              newTask.taskScheduleType = true;
              // 인원, 투입률, 작업일 초기화
              if (!('priorityLevel' in newTask)) {
                newTask.planningTimeData = {
                  // personnelCount: 0,
                  // allocationRate: 0,
                  // workDays: 0,
                };
              }
            }

            // priority_level이 없으면 기본값 추가
            if (!('priorityLevel' in newTask)) {
              newTask.priorityLevel = 116; //  '중간'
            }

            // task_progress가 없으면 기본값 추가
            if (!('taskProgress' in newTask)) {
              newTask.taskProgress = 91; //'0%'
            }

            return newTask;
          });

          // 각 버킷 내에서 작업들을 position 기준으로 정렬
          const sortedTasks = [...processedTasks].sort(
            (a, b) => (a.position || 0) - (b.position || 0),
          );

          // 처리된 작업들을 포함한 새 컬럼 객체 반환
          return {
            ...bucket,
            tasks: sortedTasks,
          };
        });

        // 버킷(컬럼)을 position 기준으로 정렬
        const sortedBuckets = [...processedTemplate].sort(
          (a, b) => (a.position || 0) - (b.position || 0),
        );

        console.log(`>> 처리 및 정렬된 템플릿 데이터: `, sortedBuckets);

        // 정렬된 형식으로 칸반 보드 업데이트
        setProjectBuckets(sortedBuckets);
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
      notification.error({
        message: '템플릿 로드 실패',
        description: '템플릿을 불러오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 칸반 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && projectBuckets.length > 0) {
      localStorage.setItem('kanbanColumns', JSON.stringify(projectBuckets));
    }
  }, [projectBuckets]);

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
    // 선택된 작업 정보 저장
    setSelectedTask(task);
    setSelectedColumnIndex(bucketIndex);
    setSelectedTaskIndex(taskIndex);

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
    handleFormSubmit(e, projectBuckets);
  };

  /**
   * 폼 초기화 함수
   */
  const handleReset = () => {
    // Redux 폼 상태 초기화
    dispatch(resetForm());

    // 빈 칸반 보드로 초기화
    setProjectBuckets([
      {
        bucket: '할 일',
        tasks: [],
      },
      {
        bucket: '진행 중',
        tasks: [],
      },
      {
        bucket: '완료',
        tasks: [],
      },
    ]);

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
          {projectBuckets.map((bucket, index) => (
            <KanbanColumn
              key={index}
              codebooks={codebooks}
              bucket={bucket}
              bucketIndex={index}
              totalColumns={projectBuckets.length}
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
