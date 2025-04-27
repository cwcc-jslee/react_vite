// src/features/todo/layouts/TodoLayout.jsx

import React, { useCallback } from 'react';
import TodoCardSection from '../sections/TodoCardSection';
import TodoPanelSection from '../sections/TodoPanelSection';
import TodoDetailPanel from '../components/panels/TodoDetailPanel';
import TodoEditPanel from '../components/panels/TodoEditPanel';
import useTodoPanel from '../hooks/useTodoPanel';
import { Button } from '@shared/components/ui';

/**
 * Todo 레이아웃 컴포넌트
 * 카드 섹션과 패널 섹션으로 구성되며, 패널 관련 상태 관리
 */
const TodoLayout = () => {
  // 패널 관련 기능 Hook 사용
  const {
    selectedTask,
    activePanel,
    isLoading,
    error,
    isPanelOpen,
    hasHistory,
    handleTaskAction,
    closePanel,
    goBack,
    saveTask,
    // openCreatePanel,
  } = useTodoPanel();

  // API 저장 함수 모형 (실제로는 API 호출)
  const apiSaveTask = useCallback(async (taskData) => {
    console.log('API로 저장 요청:', taskData);
    // 실제 구현에서는 fetch 또는 axios 등으로 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...taskData,
          updatedAt: new Date().toISOString(),
        });
      }, 800);
    });
  }, []);

  // 작업 저장 핸들러
  const handleSaveTask = useCallback(
    (updatedTask) => {
      saveTask(updatedTask, apiSaveTask);
    },
    [saveTask, apiSaveTask],
  );

  // 패널 헤더에 추가할 액션 버튼 - 패널 타입에 따라 다르게 설정
  const renderPanelHeaderActions = () => {
    const actions = [];

    // 뒤로가기 버튼
    if (hasHistory) {
      actions.push(
        <Button
          key="back"
          onClick={goBack}
          variant="outline"
          size="sm"
          className="!p-1"
        >
          ⬅️
        </Button>,
      );
    }

    // 패널 타입별 버튼
    if (activePanel === 'view') {
      actions.push(
        <Button
          key="edit"
          onClick={() => handleTaskAction(selectedTask, 'edit')}
          variant="outline"
          size="sm"
          className="!p-1"
        >
          수정
        </Button>,
      );
    }

    return actions;
  };

  // 패널 내용 렌더링
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'view':
        return <TodoDetailPanel task={selectedTask} />;
      case 'edit':
      case 'create':
        return (
          <TodoEditPanel
            task={selectedTask}
            onSave={handleSaveTask}
            onCancel={closePanel}
            isLoading={isLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-4">
      {/* 분할 레이아웃 */}
      <div className="flex">
        {/* 작업 목록 섹션 */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'w-1/2' : 'w-full'
          }`}
        >
          <TodoCardSection
            onTaskAction={handleTaskAction}
            selectedTaskId={selectedTask?.id}
          />
        </div>

        {/* 상세 정보 패널 섹션 */}
        {isPanelOpen && (
          <div className="transition-all duration-300 ease-in-out w-1/2 pl-4">
            <TodoPanelSection
              task={selectedTask}
              panelType={activePanel}
              onClose={closePanel}
              headerActions={renderPanelHeaderActions()}
              isLoading={isLoading}
            >
              {renderPanelContent()}
            </TodoPanelSection>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoLayout;
