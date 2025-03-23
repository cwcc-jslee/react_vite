// src/features/project/containers/ProjectAddContainer.jsx
// 프로젝트 관리를 위한 칸반 보드 메인 컨테이너 컴포넌트
// 프로젝트 정보 입력 폼과 칸반 보드를 통합하여 제공합니다

import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
// import { useProject } from '../../context/ProjectProvider';
import { projectTaskInitialState } from '../../../shared/constants/initialFormState';
import { projectApiService } from '../services/projectApiService';
import { apiCommon } from '../../../shared/api/apiCommon';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import { useProjectForm } from '../hooks/useProjectForm';
import useSelectData from '../../../shared/hooks/useSelectData';
import useProjectTask from '../hooks/useProjectTask';
import {
  validateProjectForm,
  validateProjectTaskForm,
} from '../utils/validateProjectForm';
import useModal from '../../../shared/hooks/useModal';
// 컴포넌트
import KanbanColumn from '../components/ui/KanbanColumn';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import ModalRenderer from '../../../shared/components/ui/modal/ModalRenderer';
import ProjectTaskForm from '../components/emements/ProjectTaskForm';
// 알림 서비스 추가
import { notification } from '../../../shared/services/notification';

/**
 * 프로젝트 추가 컨테이너 컴포넌트
 * 프로젝트 기본 정보 입력 폼과 칸반 보드를 통합하여 제공
 * 모든 모달 관리를 중앙화하여 일관된 UI 경험을 제공
 *
 * @returns {React.ReactElement} 프로젝트 추가 화면
 */
const ProjectAddContainer = () => {
  // 프로젝트 정보 상태 관리
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    setErrors,
    updateFormField,
    processSubmit,
  } = useProjectForm();
  const [projectInfo, setProjectInfo] = useState({
    customer: '',
    sfa: '',
    name: '',
    service: '',
    team: '',
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
    'fy', // 회계년도
    'importance_level', //중요도
    'pjt_status', // 프로젝트 상태
  ]);

  // API 사용자 정보 조회
  const { data: usersData, isLoading: isUsersLoading } = useSelectData(
    apiCommon.getUsers,
  );
  // console.log(`>> 사용자 조회 : `, usersData);

  // 커스텀 훅 사용
  const {
    projectBuckets,
    editState,
    setProjectBuckets, // 칼럼 직접 설정 함수 추가
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
    saveTaskEditor,
    updateTask,
  } = useProjectTask(projectTaskInitialState);

  // console.log(`>> projectBuckets : `, projectBuckets);

  /**
   * 템플릿 선택 시 작업이 처리되는 핸들러
   * 스네이크 케이스 키를 캐멀 케이스로 변환 (모든 키에 적용)
   * taskScheduleType 값이 ongoing이면 completed=false, 그 외에는 completed=true
   * priority_level과 task_progress가 없으면 기본값 할당
   *
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

            //

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
    }
  };

  // 칸반 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && projectBuckets.length > 0) {
      localStorage.setItem('kanbanColumns', JSON.stringify(projectBuckets));
    }
  }, [projectBuckets]);

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
   * @param {number} bucketIndex - 작업이 속한 컬럼의 인덱스
   * @param {number} taskIndex - 컬럼 내 작업의 인덱스
   */
  const handleOpenTaskEditModal = (task, bucketIndex, taskIndex) => {
    console.log(`>> TaskCard on click : `, task);
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
          console.log(`>> onSave : `, updatedTask);
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
   * 유효성 검사 후 제출 프로세스 시작
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. 기본 폼 유효성 검사
    const { isValid, errors: validationErrors } = validateProjectForm(formData);

    // 유효성 검사 실패 시 오류 표시
    if (!isValid) {
      setErrors(validationErrors);

      // 첫 번째 오류 메시지로 알림 표시
      const formError = Object.values(validationErrors)[0];
      notification.error({
        message: '기본폼 등록 오류',
        description: formError,
        // duration: 3,
      });

      return;
    }

    // 2. Task 폼 유효성 검사
    const { isValid: isTasksValid, errors: validationTasksErrors } =
      validateProjectTaskForm(projectBuckets);

    // 유효성 검사 실패 시 오류 표시
    if (!isTasksValid) {
      setErrors(validationTasksErrors);

      // 첫 번째 오류 메시지로 알림 표시
      const tasksError = Object.values(validationTasksErrors)[0];
      notification.error({
        message: 'TASK 등록 오류',
        description: tasksError,
        // duration: 3,
      });

      return;
    }

    // 3. 폼 제출 진행
    try {
      await processSubmit();

      // 3-1. 제출 후 폼 초기화 및 필터 리셋
      // resetFilters();
    } catch (error) {
      // processSubmit에서 이미 오류 알림을 표시하므로 여기서는 추가 처리 필요 없음
      console.error('제출 과정에서 오류 발생:', error);
    }
  };

  // 프로젝트 저장 처리 함수
  const handleSaveProject = () => {
    // 프로젝트 기본 정보 유효성 검사
    const formErrors = validateProjectForm();

    // 칸반 보드 작업 유효성 검사
    const taskErrors = validateKanbanTasks();

    // 모든 오류 모음
    const allErrors = [...formErrors, ...taskErrors];

    if (allErrors.length > 0) {
      // 오류가 있는 경우 알림 표시
      notification.error({
        message: '프로젝트 저장 실패',
        description: (
          <div>
            <p>다음 문제를 해결해주세요:</p>
            <ul className="pl-4 mt-2 list-disc">
              {allErrors.slice(0, 5).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {allErrors.length > 5 && (
                <li>그 외 {allErrors.length - 5}개의 문제가 더 있습니다.</li>
              )}
            </ul>
          </div>
        ),
        // duration: 10, // 10초 표시
      });

      console.error('유효성 검사 실패:', allErrors);
      return;
    }

    // 유효성 검사 통과 시 저장 진행
    console.log('프로젝트 저장 성공!');
    console.log('프로젝트 정보:', formData);
    console.log('작업 정보:', projectBuckets);

    // TODO: 실제 API 호출로 저장 로직 구현
    notification.success({
      message: '저장 성공',
      description: '프로젝트가 성공적으로 저장되었습니다.',
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

      {/* 전체 컨테이너를 수평 레이아웃으로 변경 */}
      <div className="flex flex-row h-full flex-grow overflow-hidden">
        {/* 왼쪽 사이드바 - 프로젝트 정보 폼 */}
        <div className="w-72 flex-shrink-0 pr-4 h-full overflow-y-auto flex flex-col">
          <ProjectAddBaseForm
            formData={formData}
            codebooks={codebooks}
            updateFormField={updateFormField}
            handleTemplateSelect={handleTemplateSelect}
          />

          {/* 버튼 컨테이너 */}
          <div className="bg-white p-4 rounded-md shadow-sm mt-4">
            <div className="flex flex-row gap-2">
              <button
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => {
                  // 폼 초기화 로직
                  setProjectInfo({
                    customer: '',
                    sfa: '',
                    projectName: '',
                    service: '',
                    department: '',
                  });
                }}
              >
                초기화
              </button>

              <button
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={handleFormSubmit}
              >
                저장
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽 칸반 보드 컨테이너 */}
        <div
          className="kanban-container flex h-full overflow-x-auto overflow-y-hidden flex-grow"
          style={{ height: 'calc(100vh - 200px)' }}
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
