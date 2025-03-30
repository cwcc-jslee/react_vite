// src/features/project/hooks/useProjectTaskPosition.js
// 칸반 보드의 상태 관리 및 작업 관련 로직을 담당하는 커스텀 훅 - position 속성 활용 버전
// 컬럼과 작업의 CRUD 기능 및 position 기반 위치 관리 기능을 제공합니다

import { useState, useCallback, useMemo } from 'react';

const useProjectTaskPosition = (initialBuckets) => {
  // 칸반 컬럼과 작업 상태 관리
  const [bucketTasks, setBucketTasks] = useState(initialBuckets);

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

  // 정렬된 버킷과 작업 - position 기준 정렬
  const sortedBucketTasks = useMemo(() => {
    return [...bucketTasks].sort((a, b) => a.position - b.position);
  }, [bucketTasks]);

  // 칸반 컬럼 제목 변경 함수
  const handleColumnTitleChange = useCallback((columnId, newTitle) => {
    setBucketTasks((prevBucketTasks) => {
      return prevBucketTasks.map((column) =>
        column.position === columnId ? { ...column, bucket: newTitle } : column,
      );
    });
  }, []);

  // 작업 필드 변경 시작
  const startEditing = useCallback((columnId, taskId, field, initialValue) => {
    setEditState({
      isEditing: true,
      columnIndex: columnId,
      taskIndex: taskId,
      field,
      value: initialValue,
    });
  }, []);

  // 컬럼 제목 편집 시작
  const startEditingColumnTitle = useCallback(
    (columnId) => {
      const column = bucketTasks.find((col) => col.position === columnId);
      if (!column) return;

      setEditState({
        isEditing: true,
        columnIndex: columnId,
        taskIndex: null,
        field: 'columnTitle',
        value: column.bucket,
      });
    },
    [bucketTasks],
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

    setBucketTasks((prevBucketTasks) => {
      if (field === 'columnTitle') {
        // 컬럼 제목 업데이트
        return prevBucketTasks.map((column) =>
          column.position === columnIndex
            ? { ...column, bucket: value }
            : column,
        );
      } else if (taskIndex !== null) {
        // 작업 필드 업데이트
        return prevBucketTasks.map((column) => {
          if (column.position === columnIndex) {
            return {
              ...column,
              tasks: column.tasks.map((task) =>
                task.position === taskIndex
                  ? { ...task, [field]: value }
                  : task,
              ),
            };
          }
          return column;
        });
      }
      return prevBucketTasks;
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
  const addTask = useCallback((columnId, newTask) => {
    setBucketTasks((prevBucketTasks) => {
      return prevBucketTasks.map((column) => {
        if (column.position === columnId) {
          // 현재 컬럼의 최대 position 값 찾기
          const maxPosition =
            column.tasks.length > 0
              ? Math.max(...column.tasks.map((task) => task.position))
              : -1;

          // 새 task에 position 속성 추가 (최대값 + 1)
          const taskWithPosition = {
            ...newTask,
            position: maxPosition + 1,
          };

          return {
            ...column,
            tasks: [...column.tasks, taskWithPosition],
          };
        }
        return column;
      });
    });
  }, []);

  // 작업 업데이트
  const updateTask = useCallback((columnId, taskId, updatedFields) => {
    setBucketTasks((prevBucketTasks) => {
      return prevBucketTasks.map((column) => {
        if (column.position === columnId) {
          return {
            ...column,
            tasks: column.tasks.map((task) =>
              task.position === taskId ? { ...task, ...updatedFields } : task,
            ),
          };
        }
        return column;
      });
    });
  }, []);

  // 작업 삭제
  const deleteTask = useCallback((columnId, taskId) => {
    setBucketTasks((prevBucketTasks) => {
      return prevBucketTasks.map((column) => {
        if (column.position === columnId) {
          // 삭제 후 남은 작업들의 position 재조정
          const filteredTasks = column.tasks
            .filter((task) => task.position !== taskId)
            .map((task, idx) => ({
              ...task,
              position: idx,
            }));

          return {
            ...column,
            tasks: filteredTasks,
          };
        }
        return column;
      });
    });
  }, []);

  // 작업 완료 상태 토글
  const toggleTaskCompletion = useCallback((columnId, taskId) => {
    setBucketTasks((prevBucketTasks) => {
      return prevBucketTasks.map((column) => {
        if (column.position === columnId) {
          return {
            ...column,
            tasks: column.tasks.map((task) => {
              if (task.position === taskId) {
                // 완료 상태 토글
                const isCompleted = task.pjt_progress === '100';
                return {
                  ...task,
                  pjt_progress: isCompleted ? '0' : '100',
                };
              }
              return task;
            }),
          };
        }
        return column;
      });
    });
  }, []);

  // 새 컬럼 추가
  const addColumn = useCallback((newColumn) => {
    setBucketTasks((prevBucketTasks) => {
      // 현재 컬럼들의 최대 position 값 찾기
      const maxPosition =
        prevBucketTasks.length > 0
          ? Math.max(...prevBucketTasks.map((col) => col.position))
          : -1;

      // 새 컬럼에 position 속성 추가 (최대값 + 1)
      const columnWithPosition = {
        ...newColumn,
        position: maxPosition + 1,
        tasks: newColumn.tasks || [],
      };

      return [...prevBucketTasks, columnWithPosition];
    });
  }, []);

  // 완료된 작업 섹션 접기/펼치기 토글
  const toggleCompletedSection = useCallback(() => {
    setCompletedExpanded((prev) => !prev);
  }, []);

  // 컬럼 삭제
  const deleteColumn = useCallback((columnId) => {
    setBucketTasks((prevBucketTasks) => {
      // 지정된 컬럼 제거
      const filteredColumns = prevBucketTasks.filter(
        (col) => col.position !== columnId,
      );

      // position 값 재조정 (선택사항)
      return filteredColumns.map((col, idx) => ({
        ...col,
        position: idx,
      }));
    });
  }, []);

  // 컬럼 이동 (왼쪽/오른쪽)
  const moveColumn = useCallback((columnId, direction) => {
    setBucketTasks((prevBucketTasks) => {
      // 정렬된 컬럼 배열 생성
      const sortedCols = [...prevBucketTasks].sort(
        (a, b) => a.position - b.position,
      );

      // 현재 컬럼의 정렬된 인덱스 찾기
      const currentIndex = sortedCols.findIndex(
        (col) => col.position === columnId,
      );

      if (currentIndex === -1) return prevBucketTasks;

      // 이동 불가능한 경우 확인
      if (
        (direction === 'left' && currentIndex === 0) ||
        (direction === 'right' && currentIndex === sortedCols.length - 1)
      ) {
        return prevBucketTasks;
      }

      // 타겟 인덱스 계산
      const targetIndex =
        direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      // 이동할 컬럼과 타겟 컬럼 참조
      const currentColumn = sortedCols[currentIndex];
      const targetColumn = sortedCols[targetIndex];

      // position 값 교환
      const updatedColumns = prevBucketTasks.map((col) => {
        if (col.position === currentColumn.position) {
          return { ...col, position: targetColumn.position };
        }
        if (col.position === targetColumn.position) {
          return { ...col, position: currentColumn.position };
        }
        return col;
      });

      return updatedColumns;
    });
  }, []);

  // 작업 이동 함수 (동일 컬럼 내 위/아래로)
  const moveTask = useCallback((columnId, taskId, direction) => {
    setBucketTasks((prevBucketTasks) => {
      const columnIndex = prevBucketTasks.findIndex(
        (col) => col.position === columnId,
      );
      if (columnIndex === -1) return prevBucketTasks;

      const column = prevBucketTasks[columnIndex];

      // 정렬된 작업 배열 생성
      const sortedTasks = [...column.tasks].sort(
        (a, b) => a.position - b.position,
      );

      // 현재 작업의 정렬된 인덱스 찾기
      const currentTaskIndex = sortedTasks.findIndex(
        (task) => task.position === taskId,
      );

      if (currentTaskIndex === -1) return prevBucketTasks;

      // 이동 불가능한 경우 확인
      if (
        (direction === 'up' && currentTaskIndex === 0) ||
        (direction === 'down' && currentTaskIndex === sortedTasks.length - 1)
      ) {
        return prevBucketTasks;
      }

      // 타겟 인덱스 계산
      const targetTaskIndex =
        direction === 'up' ? currentTaskIndex - 1 : currentTaskIndex + 1;

      // 이동할 작업과 타겟 작업 참조
      const currentTask = sortedTasks[currentTaskIndex];
      const targetTask = sortedTasks[targetTaskIndex];

      // position 값 교환
      const updatedTasks = column.tasks.map((task) => {
        if (task.position === currentTask.position) {
          return { ...task, position: targetTask.position };
        }
        if (task.position === targetTask.position) {
          return { ...task, position: currentTask.position };
        }
        return task;
      });

      // 컬럼 배열 업데이트
      const updatedColumns = [...prevBucketTasks];
      updatedColumns[columnIndex] = {
        ...column,
        tasks: updatedTasks,
      };

      return updatedColumns;
    });
  }, []);

  // 작업을 다른 컬럼으로 이동
  const moveTaskToColumn = useCallback(
    (sourceColumnId, taskId, targetColumnId) => {
      setBucketTasks((prevBucketTasks) => {
        // 원본 컬럼과 대상 컬럼 찾기
        const sourceColumn = prevBucketTasks.find(
          (col) => col.position === sourceColumnId,
        );
        const targetColumn = prevBucketTasks.find(
          (col) => col.position === targetColumnId,
        );

        if (!sourceColumn || !targetColumn) return prevBucketTasks;

        // 이동할 작업 찾기
        const taskToMove = sourceColumn.tasks.find(
          (task) => task.position === taskId,
        );

        if (!taskToMove) return prevBucketTasks;

        // 대상 컬럼의 최대 position 값 찾기
        const maxTargetPosition =
          targetColumn.tasks.length > 0
            ? Math.max(...targetColumn.tasks.map((task) => task.position))
            : -1;

        // 이동된 작업에 새 position 할당
        const updatedTask = {
          ...taskToMove,
          position: maxTargetPosition + 1,
        };

        return prevBucketTasks.map((column) => {
          // 원본 컬럼에서 작업 제거
          if (column.position === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.position !== taskId),
            };
          }

          // 대상 컬럼에 작업 추가
          if (column.position === targetColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, updatedTask],
            };
          }

          return column;
        });
      });
    },
    [],
  );

  return {
    bucketTasks: sortedBucketTasks, // 정렬된 버킷과 작업 반환
    setBucketTasks,
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
    moveTask, // 새로 추가: 작업 상하 이동
    moveTaskToColumn, // 새로 추가: 작업을 다른 컬럼으로 이동
  };
};

export default useProjectTaskPosition;
