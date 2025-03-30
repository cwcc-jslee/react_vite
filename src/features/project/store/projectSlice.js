// src/features/project/store/projectSlice.js
/**
 * 프로젝트 상태 관리를 위한 Redux 슬라이스
 * 프로젝트, 버킷, 태스크 데이터의 CRUD 작업과 상태 관리를 담당합니다.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApiService } from '../services/projectApiService';
import { projectReduxInitialState } from '../constants/initialState';
import { notification } from '../../../shared/services/notification';

/**
 * 폼 데이터 전처리 유틸리티 함수
 * 빈 값 및 임시 데이터 제거
 * @param {Object} data - 원본 폼 데이터
 * @returns {Object} 처리된 데이터
 */
const prepareFormData = (data) => {
  // 깊은 복사로 원본 데이터 유지
  const clonedData = JSON.parse(JSON.stringify(data));

  // 불필요한 임시 필드 제거
  const { __temp, ...cleanData } = clonedData;

  // null이나 빈 문자열인 경우 해당 키 삭제
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === '' || cleanData[key] === null) {
      delete cleanData[key];
    }
  });

  return cleanData;
};

/**
 * 프로젝트 목록 조회 비동기 액션
 */
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination } = state.project;

      // 파라미터가 없으면 현재 상태의 페이지네이션 사용
      const queryParams = {
        pagination: {
          current: params.pagination?.current || pagination.current,
          pageSize: params.pagination?.pageSize || pagination.pageSize,
        },
        filters: params.filters || {},
      };

      const response = await projectApiService.getProjectList(queryParams);

      return {
        data: response.data,
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트 상세 조회 비동기 액션
 */
export const fetchProjectDetail = createAsyncThunk(
  'project/fetchProjectDetail',
  async (projectId, { rejectWithValue, dispatch }) => {
    try {
      const response = await projectApiService.getProjectDetail(projectId);

      // 드로어 열기 액션 디스패치 (UI 슬라이스 액션)
      dispatch({
        type: 'ui/setDrawer',
        payload: {
          visible: true,
          baseMode: 'projectDetail',
          data: response.data,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 상세 정보를 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트 생성 비동기 액션
 */
export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue, dispatch }) => {
    try {
      // API 호출
      const response = await projectApiService.createProject(projectData);

      // 성공 시 프로젝트 목록 다시 로드
      // dispatch(fetchProjects());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 생성 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트 수정 비동기 액션
 */
export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ projectId, data }, { rejectWithValue, dispatch }) => {
    try {
      // 폼 데이터 전처리
      const preparedData = prepareFormData(data);

      // API 호출
      const response = await projectApiService.updateProject(
        projectId,
        preparedData,
      );

      // 성공 알림
      notification.success({
        message: '프로젝트 수정 성공',
        description: '프로젝트가 성공적으로 수정되었습니다.',
      });

      // 성공 시 프로젝트 목록 다시 로드
      dispatch(fetchProjects());

      return response.data;
    } catch (error) {
      // 에러 메시지 표시
      notification.error({
        message: '프로젝트 수정 실패',
        description:
          error.response?.data?.error?.message ||
          '프로젝트 수정 중 오류가 발생했습니다.',
      });

      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 수정 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트 삭제 비동기 액션
 */
export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId, { rejectWithValue, dispatch }) => {
    try {
      // API 호출
      const response = await projectApiService.deleteProject(projectId);

      // 성공 알림
      notification.success({
        message: '프로젝트 삭제 성공',
        description: '프로젝트가 성공적으로 삭제되었습니다.',
      });

      // 성공 시 프로젝트 목록 다시 로드
      dispatch(fetchProjects());

      return response.data;
    } catch (error) {
      // 에러 메시지 표시
      notification.error({
        message: '프로젝트 삭제 실패',
        description:
          error.response?.data?.error?.message ||
          '프로젝트 삭제 중 오류가 발생했습니다.',
      });

      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 삭제 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 버킷 생성 비동기 액션
 */
export const createBucket = createAsyncThunk(
  'project/createBucket',
  async (bucketData, { rejectWithValue }) => {
    try {
      const response = await projectApiService.createBucket(bucketData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '버킷 생성 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 태스크 생성 비동기 액션
 */
export const createTask = createAsyncThunk(
  'project/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await projectApiService.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '태스크 생성 중 오류가 발생했습니다.',
      );
    }
  },
);

/**
 * 프로젝트와 버킷/태스크 구조를 한 번에 생성하는 비동기 액션
 */
export const createProjectWithStructure = createAsyncThunk(
  'project/createProjectWithStructure',
  async ({ projectData, buckets }, { dispatch, rejectWithValue }) => {
    try {
      // 1. 프로젝트 생성
      const projectResponse = await dispatch(createProject(projectData));

      if (!createProject.fulfilled.match(projectResponse)) {
        return rejectWithValue('프로젝트 생성 실패');
      }

      const createdProject = projectResponse.payload;
      const projectId = createdProject.id;

      // 버킷이 없는 경우 여기서 종료
      if (!buckets || buckets.length === 0) {
        return createdProject;
      }

      // 2. 각 버킷별 생성
      const bucketPromises = buckets.map(async (bucket) => {
        const bucketPayload = {
          project_id: projectId,
          name: bucket.bucket,
          position: bucket.position,
        };

        const bucketResponse = await dispatch(createBucket(bucketPayload));

        if (!createBucket.fulfilled.match(bucketResponse)) {
          return { error: true, message: '버킷 생성 실패' };
        }

        const createdBucket = bucketResponse.payload;
        const bucketId = createdBucket.id;

        // 태스크가 있는 경우 처리
        if (bucket.tasks && bucket.tasks.length > 0) {
          const taskPromises = bucket.tasks.map(async (task) => {
            const taskPayload = {
              project_id: projectId,
              bucket_id: bucketId,
              name: task.name,
              position: task.position,
              priority_level: task.priority_level,
              task_progress: task.task_progress,
              task_schedule_type: task.task_schedule_type,
              // 일정 타입이 true인 경우 계획 시간 데이터 포함
              ...(task.task_schedule_type &&
                task.planning_time_data && {
                  planning_time_data: task.planning_time_data,
                }),
              // 날짜 정보가 있는 경우 포함
              ...(task.plan_start_date && {
                plan_start_date: task.plan_start_date,
              }),
              ...(task.plan_end_date && { plan_end_date: task.plan_end_date }),
              ...(task.due_date && { due_date: task.due_date }),
            };

            const taskResponse = await dispatch(createTask(taskPayload));

            if (!createTask.fulfilled.match(taskResponse)) {
              return { error: true, message: '태스크 생성 실패' };
            }

            return taskResponse.payload;
          });

          const taskResults = await Promise.all(taskPromises);
          const failedTasks = taskResults.filter((result) => result.error);

          if (failedTasks.length > 0) {
            return { error: true, message: failedTasks[0].message };
          }
        }

        return createdBucket;
      });

      const bucketResults = await Promise.all(bucketPromises);
      const failedBuckets = bucketResults.filter((result) => result.error);

      if (failedBuckets.length > 0) {
        return rejectWithValue(failedBuckets[0].message);
      }

      // 3. 최종 프로젝트 조회
      const finalProject = await projectApiService.getProjectDetail(projectId);

      return finalProject.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 및 구조 생성 중 오류가 발생했습니다.',
      );
    }
  },
);

const projectSlice = createSlice({
  name: 'project',
  initialState: projectReduxInitialState,
  reducers: {
    // 폼 초기화 (프로젝트 생성 또는 수정 시작 시 호출)
    initForm: (state, action) => {
      state.form = {
        data: action.payload || {},
        errors: {},
        isSubmitting: false,
      };
    },

    // 폼 완전 초기화
    resetForm: (state, action) => {
      state.form = {
        data: action.payload || {},
        errors: {},
        isSubmitting: false,
      };
    },

    // 제출 상태 설정
    setSubmitting: (state, action) => {
      state.form.isSubmitting = action.payload;
    },

    // 페이지 변경
    setPage: (state, action) => {
      state.pagination.current = Number(action.payload);
    },

    // 페이지 크기 변경
    setPageSize: (state, action) => {
      state.pagination.pageSize = Number(action.payload);
      state.pagination.current = 1; // 페이지 크기 변경 시 첫 페이지로 리셋
    },

    // 폼 필드 업데이트 - 개선된 구조
    updateFormField: (state, action) => {
      const { name, value } = action.payload;

      // 중첩된 객체 경로 지원 (예: 'customer.name')
      if (name.includes('.')) {
        const keys = name.split('.');
        let current = state.form.data;

        // 마지막 키를 제외한 모든 키에 대해 객체 경로 생성
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // 경로가 없으면 빈 객체 생성
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        // 마지막 키에 값 할당
        current[keys[keys.length - 1]] = value;
      } else {
        // 단일 키 업데이트
        state.form.data[name] = value;
      }

      // 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors[name] = null;
      }
    },

    // 여러 폼 필드 한번에 업데이트
    updateFormFields: (state, action) => {
      state.form.data = {
        ...state.form.data,
        ...action.payload,
      };

      // 업데이트된 필드에 대한 에러 초기화
      Object.keys(action.payload).forEach((key) => {
        if (state.form.errors[key]) {
          state.form.errors[key] = null;
        }
      });
    },

    // 에러 설정
    setFormErrors: (state, action) => {
      state.form.errors = { ...state.form.errors, ...action.payload };
    },

    // 에러 초기화
    clearFormErrors: (state) => {
      state.form.errors = {};
    },

    // 필터 설정
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.pagination.current = 1; // 필터 변경 시 첫 페이지로 리셋
    },

    // 필터 초기화
    resetFilters: (state) => {
      state.filters = {};
      state.pagination.current = 1;
    },

    // 선택된 프로젝트 초기화
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 프로젝트 목록 조회
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination.total = action.payload.meta.pagination.total;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // 프로젝트 상세 조회
      .addCase(fetchProjectDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
      })

      // 프로젝트 생성
      .addCase(createProject.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.data = {}; // 폼 초기화
        state.form.errors = {};
      })
      .addCase(createProject.rejected, (state, action) => {
        state.form.isSubmitting = false;
      })

      // 프로젝트 수정
      .addCase(updateProject.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.data = {}; // 폼 초기화
        state.form.errors = {};
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.form.isSubmitting = false;
      })

      // 프로젝트 삭제
      .addCase(deleteProject.pending, (state) => {
        // 삭제 중 로딩 상태 설정
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        // 삭제 성공 처리
      })
      .addCase(deleteProject.rejected, (state, action) => {
        // 삭제 실패 처리
      })

      // 버킷 생성
      .addCase(createBucket.pending, (state) => {
        // 버킷 생성 중 상태 설정
      })
      .addCase(createBucket.fulfilled, (state, action) => {
        // 버킷 생성 성공 처리
      })
      .addCase(createBucket.rejected, (state, action) => {
        // 버킷 생성 실패 처리
      })

      // 태스크 생성
      .addCase(createTask.pending, (state) => {
        // 태스크 생성 중 상태 설정
      })
      .addCase(createTask.fulfilled, (state, action) => {
        // 태스크 생성 성공 처리
      })
      .addCase(createTask.rejected, (state, action) => {
        // 태스크 생성 실패 처리
      })

      // 프로젝트 및 구조 통합 생성
      .addCase(createProjectWithStructure.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createProjectWithStructure.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form.data = {}; // 폼 초기화
        state.form.errors = {};
        state.selectedProject = action.payload;
      })
      .addCase(createProjectWithStructure.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors = { global: action.payload || '프로젝트 생성 실패' };
      });
  },
});

export const {
  initForm,
  resetForm,
  setSubmitting,
  setPage,
  setPageSize,
  updateFormField,
  updateFormFields,
  setFormErrors,
  clearFormErrors,
  setFilters,
  resetFilters,
  clearSelectedProject,
} = projectSlice.actions;

export default projectSlice.reducer;
