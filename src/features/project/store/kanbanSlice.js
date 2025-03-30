// src/features/project/store/kanbanSlice.js
/**
 * 칸반 보드 상태 관리를 위한 Redux 슬라이스
 * 프로젝트의 작업 데이터와 UI 상태를 관리합니다.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 초기 상태
const initialState = {
  buckets: [],
  editState: {
    isEditing: false,
    bucketIndex: null,
    taskIndex: null,
    field: null,
    value: '',
  },
  completedExpanded: true,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 슬라이스 생성
const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    // 작업 버킷 설정 (전체 데이터 교체)
    setBuckets: (state, action) => {
      state.buckets = action.payload;
    },

    // 편집 상태 관리
    startEditing: (state, action) => {
      const { bucketIndex, taskIndex, field, value } = action.payload;
      state.editState = {
        isEditing: true,
        bucketIndex,
        taskIndex,
        field,
        value,
      };
    },

    startEditingColumnTitle: (state, action) => {
      const bucketIndex = action.payload;
      const columnTitle = state.buckets[bucketIndex]?.bucket || '';

      state.editState = {
        isEditing: true,
        bucketIndex,
        taskIndex: null,
        field: 'columnTitle',
        value: columnTitle,
      };
    },

    handleEditChange: (state, action) => {
      state.editState.value = action.payload;
    },

    saveEdit: (state) => {
      const { isEditing, bucketIndex, taskIndex, field, value } =
        state.editState;

      if (!isEditing) return;

      if (field === 'columnTitle') {
        // 컬럼 제목 업데이트
        if (
          bucketIndex !== null &&
          bucketIndex >= 0 &&
          bucketIndex < state.buckets.length
        ) {
          state.buckets[bucketIndex].bucket = value;
        }
      } else if (taskIndex !== null) {
        // 작업 필드 업데이트
        if (
          bucketIndex !== null &&
          bucketIndex >= 0 &&
          bucketIndex < state.buckets.length &&
          taskIndex >= 0 &&
          taskIndex < state.buckets[bucketIndex].tasks.length
        ) {
          state.buckets[bucketIndex].tasks[taskIndex][field] = value;
        }
      }

      // 편집 상태 초기화
      state.editState = {
        isEditing: false,
        bucketIndex: null,
        taskIndex: null,
        field: null,
        value: '',
      };
    },

    cancelEdit: (state) => {
      state.editState = {
        isEditing: false,
        bucketIndex: null,
        taskIndex: null,
        field: null,
        value: '',
      };
    },

    // 컬럼(버킷) 관리
    addColumn: (state, action) => {
      const newColumn = action.payload;

      // 최대 position 찾기
      const maxPosition =
        state.buckets.length > 0
          ? Math.max(...state.buckets.map((col) => col.position || 0))
          : -1;

      // 새 컬럼에 position 추가
      const columnWithPosition = {
        ...newColumn,
        position: maxPosition + 1,
        tasks: newColumn.tasks || [],
      };

      state.buckets.push(columnWithPosition);
    },

    deleteColumn: (state, action) => {
      const bucketIndex = action.payload;

      // 컬럼 삭제
      state.buckets = state.buckets.filter((_, index) => index !== bucketIndex);

      // position 재조정 (선택사항)
      state.buckets = state.buckets.map((col, idx) => ({
        ...col,
        position: idx,
      }));
    },

    moveColumn: (state, action) => {
      const { bucketIndex, direction } = action.payload;

      if (
        (direction === 'left' && bucketIndex === 0) ||
        (direction === 'right' && bucketIndex === state.buckets.length - 1)
      ) {
        return; // 이동 불가능한 경우
      }

      const targetIndex =
        direction === 'left' ? bucketIndex - 1 : bucketIndex + 1;

      // 위치 교환
      [state.buckets[bucketIndex], state.buckets[targetIndex]] = [
        state.buckets[targetIndex],
        state.buckets[bucketIndex],
      ];
    },

    // 작업 관리
    addTask: (state, action) => {
      const { bucketIndex, task } = action.payload;

      if (bucketIndex >= 0 && bucketIndex < state.buckets.length) {
        const bucket = state.buckets[bucketIndex];

        // 현재 컬럼의 최대 position 값 찾기
        const maxPosition =
          bucket.tasks.length > 0
            ? Math.max(...bucket.tasks.map((t) => t.position || 0))
            : -1;

        // 새 task에 position 속성 추가
        const taskWithPosition = {
          ...task,
          position: maxPosition + 1,
        };

        state.buckets[bucketIndex].tasks.push(taskWithPosition);
      }
    },

    updateTask: (state, action) => {
      const { bucketIndex, taskIndex, updatedTask } = action.payload;

      if (
        bucketIndex >= 0 &&
        bucketIndex < state.buckets.length &&
        taskIndex >= 0 &&
        taskIndex < state.buckets[bucketIndex].tasks.length
      ) {
        state.buckets[bucketIndex].tasks[taskIndex] = {
          ...state.buckets[bucketIndex].tasks[taskIndex],
          ...updatedTask,
        };
      }
    },

    deleteTask: (state, action) => {
      const { bucketIndex, taskIndex } = action.payload;

      if (
        bucketIndex >= 0 &&
        bucketIndex < state.buckets.length &&
        taskIndex >= 0 &&
        taskIndex < state.buckets[bucketIndex].tasks.length
      ) {
        // 작업 삭제
        state.buckets[bucketIndex].tasks.splice(taskIndex, 1);

        // position 재조정 (선택사항)
        state.buckets[bucketIndex].tasks = state.buckets[bucketIndex].tasks.map(
          (task, idx) => ({
            ...task,
            position: idx,
          }),
        );
      }
    },

    toggleTaskCompletion: (state, action) => {
      const { bucketIndex, taskIndex } = action.payload;

      if (
        bucketIndex >= 0 &&
        bucketIndex < state.buckets.length &&
        taskIndex >= 0 &&
        taskIndex < state.buckets[bucketIndex].tasks.length
      ) {
        const task = state.buckets[bucketIndex].tasks[taskIndex];
        const isCompleted = task.pjtProgress === '100';

        state.buckets[bucketIndex].tasks[taskIndex] = {
          ...task,
          pjtProgress: isCompleted ? '0' : '100',
        };
      }
    },

    toggleCompletedSection: (state) => {
      state.completedExpanded = !state.completedExpanded;
    },

    // 초기화
    resetKanban: (state) => {
      return {
        ...initialState,
        buckets: [
          {
            bucket: '할 일',
            tasks: [],
            position: 0,
          },
          {
            bucket: '진행 중',
            tasks: [],
            position: 1,
          },
          {
            bucket: '완료',
            tasks: [],
            position: 2,
          },
        ],
      };
    },
  },
  extraReducers: (builder) => {
    builder;
    // 프로젝트 작업 로드
  },
});

// 액션 생성자 내보내기
export const {
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
  resetKanban,
} = kanbanSlice.actions;

// 셀렉터 함수들
export const selectBuckets = (state) => state.projectTask.buckets;
export const selectEditState = (state) => state.projectTask.editState;
export const selectCompletedExpanded = (state) =>
  state.projectTask.completedExpanded;
export const selectKanbanStatus = (state) => state.projectTask.status;
export const selectKanbanError = (state) => state.projectTask.error;

// 리듀서 내보내기
export default kanbanSlice.reducer;
