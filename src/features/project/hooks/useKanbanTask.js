// src/features/project/hooks/useKanbanTask.js
/**
 * 칸반 보드 작업 관리를 위한 커스텀 훅
 * Redux 상태와 연결하여 기존 useProjectTask 훅의 인터페이스를 유지하면서
 * 상태 관리는 중앙화된 Redux로 위임합니다.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBuckets,
  selectEditState,
  selectCompletedExpanded,
  setBuckets,
  startEditing,
  startEditingColumnTitle,
  handleEditChange,
  saveEdit,
  cancelEdit,
  addColumn,
  deleteColumn,
  moveColumn,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  toggleCompletedSection,
  loadTaskTemplate,
  resetKanban,
} from '../store/kanbanSlice';

/**
 * 칸반 보드 작업 관리를 위한 커스텀 훅
 * @param {Array} initialColumns - 초기 컬럼 데이터 (첫 렌더링 시에만 사용)
 * @returns {Object} 칸반 보드 관리 함수 및 상태
 */
const useKanbanTask = (initialColumns = []) => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const projectBuckets = useSelector(selectBuckets);
  const editState = useSelector(selectEditState);
  const completedExpanded = useSelector(selectCompletedExpanded);

  // 초기 데이터가 있고 Redux 상태가 비어있을 때만 초기화
  useEffect(() => {
    if (initialColumns.length > 0 && projectBuckets.length === 0) {
      dispatch(setBuckets(initialColumns));
    }

    // 컴포넌트 언마운트 시 로컬 스토리지에 상태 저장 (옵션)
    return () => {
      if (typeof window !== 'undefined' && projectBuckets.length > 0) {
        localStorage.setItem('kanbanColumns', JSON.stringify(projectBuckets));
      }
    };
  }, [dispatch, initialColumns, projectBuckets.length]);

  // 직접 버킷 설정 (기존 useProjectTask와 호환성 유지)
  const setProjectBuckets = useCallback(
    (buckets) => {
      dispatch(setBuckets(buckets));
    },
    [dispatch],
  );

  // 작업 필드 변경 시작
  const startEditingTask = useCallback(
    (bucketIndex, taskIndex, field, initialValue) => {
      dispatch(
        startEditing({
          bucketIndex,
          taskIndex,
          field,
          value: initialValue,
        }),
      );
    },
    [dispatch],
  );

  // 컬럼 제목 편집 시작
  const startEditingBucketTitle = useCallback(
    (bucketIndex) => {
      dispatch(startEditingColumnTitle(bucketIndex));
    },
    [dispatch],
  );

  // 편집 값 변경
  const handleEditChangeValue = useCallback(
    (newValue) => {
      dispatch(handleEditChange(newValue));
    },
    [dispatch],
  );

  // 편집 저장
  const saveEditChanges = useCallback(() => {
    dispatch(saveEdit());
  }, [dispatch]);

  // 편집 취소
  const cancelEditChanges = useCallback(() => {
    dispatch(cancelEdit());
  }, [dispatch]);

  // 컬럼 제목 변경 함수 (이전 버전과 호환성 유지)
  const handleColumnTitleChange = useCallback(
    (bucketIndex, newTitle) => {
      dispatch(startEditingColumnTitle(bucketIndex));
      dispatch(handleEditChange(newTitle));
      dispatch(saveEdit());
    },
    [dispatch],
  );

  // 새 작업 추가
  const addNewTask = useCallback(
    (bucketIndex, newTask) => {
      dispatch(addTask({ bucketIndex, task: newTask }));
    },
    [dispatch],
  );

  // 작업 업데이트
  const updateTaskData = useCallback(
    (bucketIndex, taskIndex, updatedTask) => {
      dispatch(updateTask({ bucketIndex, taskIndex, updatedTask }));
    },
    [dispatch],
  );

  // useTaskEditor에서 제출된 데이터를 처리하는 함수
  const saveTaskEditor = useCallback(
    (bucketIndex, taskIndex, formData) => {
      dispatch(updateTask({ bucketIndex, taskIndex, updatedTask: formData }));
      return Promise.resolve(); // 비동기 작업 시뮬레이션
    },
    [dispatch],
  );

  // 작업 삭제
  const deleteTaskItem = useCallback(
    (bucketIndex, taskIndex) => {
      dispatch(deleteTask({ bucketIndex, taskIndex }));
    },
    [dispatch],
  );

  // 작업 완료 상태 토글
  const toggleTaskCompletionState = useCallback(
    (bucketIndex, taskIndex) => {
      dispatch(toggleTaskCompletion({ bucketIndex, taskIndex }));
    },
    [dispatch],
  );

  // 새 컬럼 추가
  const addNewColumn = useCallback(
    (newColumn) => {
      dispatch(addColumn(newColumn));
    },
    [dispatch],
  );

  // 완료된 작업 섹션 접기/펼치기 토글
  const toggleCompletedSectionState = useCallback(() => {
    dispatch(toggleCompletedSection());
  }, [dispatch]);

  // 컬럼 삭제
  const deleteColumnItem = useCallback(
    (bucketIndex) => {
      dispatch(deleteColumn(bucketIndex));
    },
    [dispatch],
  );

  // 컬럼 이동 (왼쪽/오른쪽)
  const moveColumnPosition = useCallback(
    (bucketIndex, direction) => {
      dispatch(moveColumn({ bucketIndex, direction }));
    },
    [dispatch],
  );

  // 템플릿 로드
  const loadTemplate = useCallback(
    (templateId) => {
      return dispatch(loadTaskTemplate(templateId));
    },
    [dispatch],
  );

  // 칸반 초기화
  const resetKanbanBoard = useCallback(() => {
    dispatch(resetKanban());
  }, [dispatch]);

  return {
    // 상태
    projectBuckets,
    editState,
    completedExpanded,

    // 상태 설정 함수
    setProjectBuckets,

    // 편집 관련 함수
    startEditing: startEditingTask,
    startEditingColumnTitle: startEditingBucketTitle,
    handleEditChange: handleEditChangeValue,
    saveEdit: saveEditChanges,
    cancelEdit: cancelEditChanges,
    handleColumnTitleChange,

    // 작업 관련 함수
    addTask: addNewTask,
    updateTask: updateTaskData,
    saveTaskEditor,
    deleteTask: deleteTaskItem,
    toggleTaskCompletion: toggleTaskCompletionState,

    // 컬럼 관련 함수
    addColumn: addNewColumn,
    deleteColumn: deleteColumnItem,
    moveColumn: moveColumnPosition,
    toggleCompletedSection: toggleCompletedSectionState,

    // 추가 기능
    loadTemplate,
    resetKanbanBoard,
  };
};

export default useKanbanTask;
