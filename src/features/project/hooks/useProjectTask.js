// src/features/project/hooks/useProjectTask.js
// 칸반 보드의 상태 관리 및 작업 관련 로직을 담당하는 커스텀 훅
// 컬럼과 작업의 CRUD 기능 및 이동 기능을 제공합니다

import { useState, useCallback } from 'react';

const useProjectTask = (initialColumns) => {
  // 칸반 컬럼 상태 관리
  const [columns, setColumns] = useState(initialColumns);
  // 편집 상태 관리
  const [editState, setEditState] = useState({
    isEditing: false,
    columnIndex: null,
    taskIndex: null,
    field: null,
    value: '',
  });

  // 완료된 작업 섹션 표시 상태
  const [completedExpanded, setCompletedExpanded] = useState(true);

  // 칸반 컬럼 제목 변경 함수
  const handleColumnTitleChange = useCallback((columnIndex, newTitle) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        bucket: newTitle,
      };
      return updatedColumns;
    });
  }, []);

  // 작업 필드 변경 시작
  const startEditing = useCallback(
    (columnIndex, taskIndex, field, initialValue) => {
      setEditState({
        isEditing: true,
        columnIndex,
        taskIndex,
        field,
        value: initialValue,
      });
    },
    [],
  );

  // 컬럼 제목 편집 시작
  const startEditingColumnTitle = useCallback(
    (columnIndex) => {
      setEditState({
        isEditing: true,
        columnIndex,
        taskIndex: null,
        field: 'columnTitle',
        value: columns[columnIndex].bucket,
      });
    },
    [columns],
  );

  // 편집 값 변경
  const handleEditChange = useCallback((newValue) => {
    setEditState((prev) => ({
      ...prev,
      value: newValue,
    }));
  }, []);

  // 편집 저장
  const saveEdit = useCallback(() => {
    const { isEditing, columnIndex, taskIndex, field, value } = editState;

    if (!isEditing) return;

    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];

      if (field === 'columnTitle') {
        // 컬럼 제목 업데이트
        updatedColumns[columnIndex].bucket = value;
      } else if (taskIndex !== null) {
        // 작업 필드 업데이트
        updatedColumns[columnIndex].tasks[taskIndex] = {
          ...updatedColumns[columnIndex].tasks[taskIndex],
          [field]: value,
        };
      }

      return updatedColumns;
    });

    cancelEdit();
  }, [editState]);

  // 편집 취소
  const cancelEdit = useCallback(() => {
    setEditState({
      isEditing: false,
      columnIndex: null,
      taskIndex: null,
      field: null,
      value: '',
    });
  }, []);

  // 새 작업 추가
  const addTask = useCallback((columnIndex, newTask) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        tasks: [...updatedColumns[columnIndex].tasks, newTask],
      };
      return updatedColumns;
    });
  }, []);

  // 작업 업데이트
  const updateTask = useCallback((columnIndex, taskIndex, updatedFields) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[columnIndex].tasks[taskIndex] = {
        ...updatedColumns[columnIndex].tasks[taskIndex],
        ...updatedFields,
      };
      return updatedColumns;
    });
  }, []);

  // 작업 삭제
  const deleteTask = useCallback((columnIndex, taskIndex) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[columnIndex].tasks = updatedColumns[
        columnIndex
      ].tasks.filter((_, index) => index !== taskIndex);
      return updatedColumns;
    });
  }, []);

  // 작업 완료 상태 토글
  const toggleTaskCompletion = useCallback((columnIndex, taskIndex) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      const task = updatedColumns[columnIndex].tasks[taskIndex];

      // 완료 상태 토글
      const isCompleted = task.pjt_progress === '100';
      updatedColumns[columnIndex].tasks[taskIndex] = {
        ...task,
        pjt_progress: isCompleted ? '0' : '100',
      };

      return updatedColumns;
    });
  }, []);

  // 새 컬럼 추가
  const addColumn = useCallback((newColumn) => {
    setColumns((prevColumns) => [...prevColumns, newColumn]);
  }, []);

  // 완료된 작업 섹션 접기/펼치기 토글
  const toggleCompletedSection = useCallback(() => {
    setCompletedExpanded((prev) => !prev);
  }, []);

  // 컬럼 삭제
  const deleteColumn = useCallback((columnIndex) => {
    setColumns((prevColumns) =>
      prevColumns.filter((_, index) => index !== columnIndex),
    );
  }, []);

  // 컬럼 이동 (왼쪽/오른쪽)
  const moveColumn = useCallback((columnIndex, direction) => {
    setColumns((prevColumns) => {
      if (
        (direction === 'left' && columnIndex === 0) ||
        (direction === 'right' && columnIndex === prevColumns.length - 1)
      ) {
        return prevColumns; // 이동 불가능한 경우
      }

      const updatedColumns = [...prevColumns];
      const targetIndex =
        direction === 'left' ? columnIndex - 1 : columnIndex + 1;

      // 두 컬럼의 위치 교환
      [updatedColumns[columnIndex], updatedColumns[targetIndex]] = [
        updatedColumns[targetIndex],
        updatedColumns[columnIndex],
      ];

      return updatedColumns;
    });
  }, []);

  // 작업 이동 함수 제거

  return {
    columns,
    setColumns,
    editState,
    startEditing,
    startEditingColumnTitle,
    handleEditChange,
    saveEdit,
    cancelEdit,
    handleColumnTitleChange,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleCompletedSection,
    completedExpanded,
    addColumn,
    deleteColumn,
    moveColumn,
  };
};

export default useProjectTask;
