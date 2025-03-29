// src/features/project/store/kanbanSlice.js
/**
 * 칸반 보드 상태 관리를 위한 Redux 슬라이스
 * 프로젝트의 작업 데이터와 UI 상태를 관리합니다.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApiService } from '../services/projectApiService';
import { notification } from '../../../shared/services/notification';

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

/**
 * 프로젝트 템플릿에서 작업 구조 로드
 */
export const loadTaskTemplate = createAsyncThunk(
  'kanban/loadTaskTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await projectApiService.getTaskTemplate(templateId);

      if (!response?.data || !response.data.length) {
        return rejectWithValue('템플릿 데이터가 없습니다.');
      }

      // 원본 템플릿 데이터
      const originalTemplate = response.data[0]?.structure || [];

      // 템플릿 데이터 처리 및 변환
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
          if (newTask.taskScheduleType === 'ongoing') {
            newTask.taskScheduleType = false;
          } else {
            newTask.taskScheduleType = true;
            // 인원, 투입률, 작업일 초기화
            if (!('priorityLevel' in newTask)) {
              newTask.planningTimeData = {};
            }
          }

          // priority_level이 없으면 기본값 추가
          if (!('priorityLevel' in newTask)) {
            newTask.priorityLevel = 116; // '중간'
          }

          // task_progress가 없으면 기본값 추가
          if (!('taskProgress' in newTask)) {
            newTask.taskProgress = 91; // '0%'
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

      return sortedBuckets;
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          '템플릿을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트 작업 구조 로드
 */
export const loadProjectTasks = createAsyncThunk(
  'kanban/loadProjectTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApiService.getProjectDetail(projectId);

      if (!response?.data?.structure) {
        return rejectWithValue('프로젝트 작업 데이터가 없습니다.');
      }

      return response.data.structure;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          '프로젝트 작업을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

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
    builder
      // 템플릿 로드
      .addCase(loadTaskTemplate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadTaskTemplate.fulfilled, (state, action) => {
        state.buckets = action.payload;
        state.status = 'succeeded';
        state.error = null;

        // 알림 표시
        notification.success({
          message: '템플릿 로드 성공',
          description: '템플릿을 성공적으로 불러왔습니다.',
        });
      })
      .addCase(loadTaskTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;

        // 알림 표시
        notification.error({
          message: '템플릿 로드 실패',
          description:
            action.payload || '템플릿을 불러오는 중 오류가 발생했습니다.',
        });
      })

      // 프로젝트 작업 로드
      .addCase(loadProjectTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadProjectTasks.fulfilled, (state, action) => {
        state.buckets = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(loadProjectTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;

        notification.error({
          message: '작업 로드 실패',
          description:
            action.payload ||
            '프로젝트 작업을 불러오는 중 오류가 발생했습니다.',
        });
      });
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
export const selectBuckets = (state) => state.kanban.buckets;
export const selectEditState = (state) => state.kanban.editState;
export const selectCompletedExpanded = (state) =>
  state.kanban.completedExpanded;
export const selectKanbanStatus = (state) => state.kanban.status;
export const selectKanbanError = (state) => state.kanban.error;

// 리듀서 내보내기
export default kanbanSlice.reducer;
