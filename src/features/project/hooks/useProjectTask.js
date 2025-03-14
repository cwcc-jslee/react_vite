// src/features/project/hooks/useProjectTask.js
import { useState } from 'react';

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

  // 칸반 컬럼 제목 변경 함수
  const handleColumnTitleChange = (columnIndex, newTitle) => {
    const updatedColumns = [...columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      title: newTitle,
    };
    setColumns(updatedColumns);
  };

  // 작업 필드 변경 시작
  const startEditing = (columnIndex, taskIndex, field, initialValue) => {
    setEditState({
      isEditing: true,
      columnIndex,
      taskIndex,
      field,
      value: initialValue,
    });
  };

  // 컬럼 제목 편집 시작
  const startEditingColumnTitle = (columnIndex) => {
    setEditState({
      isEditing: true,
      columnIndex,
      taskIndex: null,
      field: 'columnTitle',
      value: columns[columnIndex].title,
    });
  };

  // 편집 값 변경
  const handleEditChange = (newValue) => {
    setEditState({
      ...editState,
      value: newValue,
    });
  };

  // 편집 저장
  const saveEdit = () => {
    const { isEditing, columnIndex, taskIndex, field, value } = editState;

    if (!isEditing) return;

    const updatedColumns = [...columns];

    if (field === 'columnTitle') {
      // 컬럼 제목 업데이트
      updatedColumns[columnIndex].title = value;
    } else if (taskIndex !== null) {
      // 작업 필드 업데이트
      updatedColumns[columnIndex].tasks[taskIndex] = {
        ...updatedColumns[columnIndex].tasks[taskIndex],
        [field]: value,
      };
    }

    setColumns(updatedColumns);
    cancelEdit();
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditState({
      isEditing: false,
      columnIndex: null,
      taskIndex: null,
      field: null,
      value: '',
    });
  };

  // 작업 카드 클릭 핸들러
  const handleTaskClick = (columnIndex, taskIndex, task) => {
    console.log(`Column: ${columnIndex}, Task: ${taskIndex}`, task);
    // 작업 상세 보기 또는 수정을 위한 로직
  };

  // 새 작업 추가
  const addTask = (columnIndex, newTask) => {
    const updatedColumns = [...columns];
    updatedColumns[columnIndex] = {
      ...updatedColumns[columnIndex],
      tasks: [...updatedColumns[columnIndex].tasks, newTask],
    };
    setColumns(updatedColumns);
  };

  // 작업 업데이트
  const updateTask = (columnIndex, taskIndex, updatedFields) => {
    const updatedColumns = [...columns];
    updatedColumns[columnIndex].tasks[taskIndex] = {
      ...updatedColumns[columnIndex].tasks[taskIndex],
      ...updatedFields,
    };
    setColumns(updatedColumns);
  };

  // 작업 삭제
  const deleteTask = (columnIndex, taskIndex) => {
    const updatedColumns = [...columns];
    updatedColumns[columnIndex].tasks = updatedColumns[
      columnIndex
    ].tasks.filter((_, index) => index !== taskIndex);
    setColumns(updatedColumns);
  };

  // 작업 완료 상태 토글
  const toggleTaskCompletion = (columnIndex, taskIndex) => {
    const updatedColumns = [...columns];
    const task = updatedColumns[columnIndex].tasks[taskIndex];

    // 완료 상태 토글
    const isCompleted = task.pjt_progress === '100';
    updatedColumns[columnIndex].tasks[taskIndex] = {
      ...task,
      pjt_progress: isCompleted ? '0' : '100',
    };

    setColumns(updatedColumns);
  };

  // 새 컬럼 추가
  const addColumn = (newColumn) => {
    setColumns([...columns, newColumn]);
  };

  // 컬럼 삭제
  const deleteColumn = (columnIndex) => {
    const updatedColumns = columns.filter((_, index) => index !== columnIndex);
    setColumns(updatedColumns);
  };

  // 작업 이동 (드래그 앤 드롭)
  const moveTask = (
    sourceColumnIndex,
    sourceIndex,
    destinationColumnIndex,
    destinationIndex,
  ) => {
    const updatedColumns = [...columns];

    // 이동할 작업 가져오기
    const task = updatedColumns[sourceColumnIndex].tasks[sourceIndex];

    // 원본에서 작업 제거
    updatedColumns[sourceColumnIndex].tasks.splice(sourceIndex, 1);

    // 대상 위치에 작업 추가
    updatedColumns[destinationColumnIndex].tasks.splice(
      destinationIndex,
      0,
      task,
    );

    setColumns(updatedColumns);
  };

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
    handleTaskClick,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addColumn,
    deleteColumn,
    moveTask,
  };
};

export default useProjectTask;
