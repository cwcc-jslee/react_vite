// src/features/project/hooks/useProjectTask.js
// 칸반 보드의 상태 관리 및 작업 관련 로직을 담당하는 커스텀 훅
// 컬럼과 작업의 CRUD 기능 및 이동 기능을 제공합니다

import { useState, useEffect, useCallback } from 'react';

const useProjectTask = (initialColumns) => {
  // 칸반 컬럼 상태 관리
  const [projectBuckets, setProjectBuckets] = useState(initialColumns);
  // 편집 상태 관리
  const [editState, setEditState] = useState({
    isEditing: false,
    bucketIndex: null,
    taskIndex: null,
    field: null,
    value: '',
  });

  useEffect(() => {
    console.log('>>>> projectBuckets 상태 변경:', projectBuckets);
  }, [projectBuckets]);

  // 완료된 작업 섹션 표시 상태
  const [completedExpanded, setCompletedExpanded] = useState(true);

  // 칸반 컬럼 제목 변경 함수
  const handleColumnTitleChange = useCallback((bucketIndex, newTitle) => {
    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[bucketIndex] = {
        ...updatedColumns[bucketIndex],
        bucket: newTitle,
      };
      return updatedColumns;
    });
  }, []);

  // 작업 필드 변경 시작
  const startEditing = useCallback(
    (bucketIndex, taskIndex, field, initialValue) => {
      setEditState({
        isEditing: true,
        bucketIndex,
        taskIndex,
        field,
        value: initialValue,
      });
    },
    [],
  );

  // 컬럼 제목 편집 시작
  const startEditingColumnTitle = useCallback(
    (bucketIndex) => {
      setEditState({
        isEditing: true,
        bucketIndex,
        taskIndex: null,
        field: 'columnTitle',
        value: projectBuckets[bucketIndex].bucket,
      });
    },
    [projectBuckets],
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
    const { isEditing, bucketIndex, taskIndex, field, value } = editState;

    if (!isEditing) return;

    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];

      if (field === 'columnTitle') {
        // 컬럼 제목 업데이트
        updatedColumns[bucketIndex].bucket = value;
      } else if (taskIndex !== null) {
        // 작업 필드 업데이트
        updatedColumns[bucketIndex].tasks[taskIndex] = {
          ...updatedColumns[bucketIndex].tasks[taskIndex],
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
      bucketIndex: null,
      taskIndex: null,
      field: null,
      value: '',
    });
  }, []);

  // 새 작업 추가
  const addTask = useCallback((bucketIndex, newTask) => {
    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[bucketIndex] = {
        ...updatedColumns[bucketIndex],
        tasks: [...updatedColumns[bucketIndex].tasks, newTask],
      };
      return updatedColumns;
    });
  }, []);

  // 작업 업데이트 함수 개선
  const updateTask = useCallback((bucketIndex, taskIndex, updatedTask) => {
    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[bucketIndex].tasks[taskIndex] = {
        ...updatedColumns[bucketIndex].tasks[taskIndex],
        ...updatedTask,
      };
      return updatedColumns;
    });
  }, []);

  // useTaskEditor에서 제출된 데이터를 처리하는 함수
  const saveTaskEditor = useCallback(
    (bucketIndex, taskIndex, formData) => {
      updateTask(bucketIndex, taskIndex, formData);
      return Promise.resolve(); // 비동기 작업을 시뮬레이션하여 useTaskEditor에서 처리할 수 있게 함
    },
    [updateTask],
  );

  // 작업 삭제
  const deleteTask = useCallback((bucketIndex, taskIndex) => {
    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[bucketIndex].tasks = updatedColumns[
        bucketIndex
      ].tasks.filter((_, index) => index !== taskIndex);
      return updatedColumns;
    });
  }, []);

  // 작업 완료 상태 토글
  const toggleTaskCompletion = useCallback((bucketIndex, taskIndex) => {
    setProjectBuckets((prevColumns) => {
      const updatedColumns = [...prevColumns];
      const task = updatedColumns[bucketIndex].tasks[taskIndex];

      // 완료 상태 토글
      const isCompleted = task.pjt_progress === '100';
      updatedColumns[bucketIndex].tasks[taskIndex] = {
        ...task,
        pjt_progress: isCompleted ? '0' : '100',
      };

      return updatedColumns;
    });
  }, []);

  // 새 컬럼 추가
  const addColumn = useCallback((newColumn) => {
    setProjectBuckets((prevColumns) => [...prevColumns, newColumn]);
  }, []);

  // 완료된 작업 섹션 접기/펼치기 토글
  const toggleCompletedSection = useCallback(() => {
    setCompletedExpanded((prev) => !prev);
  }, []);

  // 컬럼 삭제
  const deleteColumn = useCallback((bucketIndex) => {
    setProjectBuckets((prevColumns) =>
      prevColumns.filter((_, index) => index !== bucketIndex),
    );
  }, []);

  // 컬럼 이동 (왼쪽/오른쪽)
  const moveColumn = useCallback((bucketIndex, direction) => {
    setProjectBuckets((prevColumns) => {
      if (
        (direction === 'left' && bucketIndex === 0) ||
        (direction === 'right' && bucketIndex === prevColumns.length - 1)
      ) {
        return prevColumns; // 이동 불가능한 경우
      }

      const updatedColumns = [...prevColumns];
      const targetIndex =
        direction === 'left' ? bucketIndex - 1 : bucketIndex + 1;

      // 두 컬럼의 위치 교환
      [updatedColumns[bucketIndex], updatedColumns[targetIndex]] = [
        updatedColumns[targetIndex],
        updatedColumns[bucketIndex],
      ];

      return updatedColumns;
    });
  }, []);

  // 작업 이동 함수 제거

  return {
    projectBuckets,
    setProjectBuckets,
    editState,
    startEditing,
    startEditingColumnTitle,
    handleEditChange,
    saveEdit,
    cancelEdit,
    handleColumnTitleChange,
    addTask,
    updateTask,
    saveTaskEditor,
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
