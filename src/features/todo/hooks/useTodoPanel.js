import { useState, useCallback } from 'react';

/**
 * Todo 패널 기능을 관리하는 훅
 * 선택된 작업과 활성 패널 상태를 관리하고 관련 기능 제공
 * ==== 수정 예정 ====
 *
 * @returns {Object} 패널 관련 상태와 함수들
 */
const useTodoPanel = () => {
  // 패널 상태 관리
  const [panel, setPanel] = useState({
    selectedTask: null,
    activePanel: null,
    history: [], // 패널 히스토리 (뒤로가기 기능 위함)
    isLoading: false,
    error: null,
  });

  // 선택된 작업과 패널 타입 설정
  const handleTaskAction = useCallback((task, action) => {
    setPanel((prev) => ({
      ...prev,
      selectedTask: task,
      activePanel: action,
      // 이전 상태가 있는 경우만 히스토리에 추가
      history: prev.selectedTask
        ? [
            ...prev.history,
            { task: prev.selectedTask, action: prev.activePanel },
          ]
        : prev.history,
    }));
  }, []);

  // 패널 닫기
  const closePanel = useCallback(() => {
    setPanel((prev) => ({
      ...prev,
      selectedTask: null,
      activePanel: null,
    }));
  }, []);

  // 이전 패널로 돌아가기
  const goBack = useCallback(() => {
    setPanel((prev) => {
      if (prev.history.length === 0) return prev;

      const newHistory = [...prev.history];
      const lastItem = newHistory.pop();

      return {
        ...prev,
        selectedTask: lastItem?.task || null,
        activePanel: lastItem?.action || null,
        history: newHistory,
      };
    });
  }, []);

  // 작업 저장 시작
  const startSaving = useCallback(() => {
    setPanel((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));
  }, []);

  // 작업 저장 성공
  const saveSuccess = useCallback((updatedTask) => {
    setPanel((prev) => ({
      ...prev,
      selectedTask: updatedTask,
      activePanel: 'view',
      isLoading: false,
      error: null,
    }));
  }, []);

  // 작업 저장 실패
  const saveError = useCallback((error) => {
    setPanel((prev) => ({
      ...prev,
      isLoading: false,
      error: error,
    }));
  }, []);

  // 작업 저장 핸들러 - API 호출 래퍼
  const saveTask = useCallback(
    async (updatedTask, apiSaveFunction) => {
      try {
        startSaving();

        // API 함수가 제공되었으면 호출, 아니면 그냥 성공으로 처리
        if (apiSaveFunction) {
          const result = await apiSaveFunction(updatedTask);
          saveSuccess(result || updatedTask);
        } else {
          // API 함수가 없는 경우 (테스트 등) 바로 성공 처리
          setTimeout(() => saveSuccess(updatedTask), 500);
        }
      } catch (error) {
        saveError(error.message || '저장 중 오류가 발생했습니다.');
      }
    },
    [startSaving, saveSuccess, saveError],
  );

  // 새 작업 생성 패널 열기
  const openCreatePanel = useCallback(() => {
    const newTask = {
      id: 'temp_' + Date.now(),
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      startDate: new Date().toISOString(),
      dueDate: null,
      isNew: true,
    };

    handleTaskAction(newTask, 'create');
  }, [handleTaskAction]);

  return {
    // 상태
    selectedTask: panel.selectedTask,
    activePanel: panel.activePanel,
    isLoading: panel.isLoading,
    error: panel.error,
    isPanelOpen: panel.selectedTask !== null,
    hasHistory: panel.history.length > 0,

    // 액션
    handleTaskAction,
    closePanel,
    goBack,
    saveTask,
    openCreatePanel,
  };
};

export default useTodoPanel;
