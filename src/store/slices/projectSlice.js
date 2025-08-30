/**
 * 프로젝트 데이터 상태 관리 슬라이스
 * - 프로젝트 목록, 페이지네이션, 필터링 관리
 * - 프로젝트 상세 정보 관리
 * - 프로젝트 CRUD 작업 처리
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from '@shared/services/notification';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { projectApiService } from '../../features/project/services/projectApiService';
import { apiService } from '@shared/api/apiService';
import { todoApiService } from '../../features/todo/services/todoApiService';
import {
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
  // DASHBOARD_INITIAL_STATE,
  FORM_INITIAL_STATE,
  SELECTED_ITEM_INITIAL_STATE,
} from '../../features/project/constants/initialState';
import { getScheduleStatus } from '../../features/project/utils/scheduleStatusUtils';
import {
  processDashboardData,
  validateApiResponse,
  calculatePagination,
} from '../../features/project/utils/projectDataUtils';

// 프로젝트 목록 조회 액션
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pagination: storePagination, filters: storeFilters } =
        state.project;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };
      const filters = params.filters || storeFilters || {};

      const response = await projectApiService.getProjectList({
        pagination,
        filters,
        ...params.additionalParams,
      });

      return {
        data: convertKeysToCamelCase(response.data),
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

// 프로젝트 상세 조회 액션
export const fetchProjectDetail = createAsyncThunk(
  'project/fetchProjectDetail',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApiService.getProjectDetail(projectId);

      if (
        !response.data ||
        !Array.isArray(response.data) ||
        response.data.length === 0
      ) {
        return rejectWithValue('프로젝트 정보를 찾을 수 없습니다.');
      }

      const projectData = response.data[0];
      if (!projectData) {
        return rejectWithValue('프로젝트 데이터가 유효하지 않습니다.');
      }

      return convertKeysToCamelCase(projectData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 상세 정보를 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 프로젝트 생성 액션
export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue, dispatch }) => {
    try {
      const response = await projectApiService.createProject(projectData);

      // 생성 성공 시 목록 새로고침
      dispatch(fetchProjects());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || error.message,
      );
    }
  },
);

// 프로젝트 work 리스트 조회 액션
export const fetchProjectWorks = createAsyncThunk(
  'project/fetchProjectWorks',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // 프로젝트 슬라이스의 상태 참조
      const { pagination: storePagination } = state.project.selectedItem.works;

      const pagination = params.pagination ||
        storePagination || {
          current: 1,
          pageSize: 20,
        };

      // 프로젝트 ID가 params로 전달된 경우 필터에 추가
      const filters = {
        project_task: {
          project: {
            id: { $eq: params.projectId },
          },
        },
        ...params.filters,
      };

      // API 호출
      const response = await todoApiService.getWorkList({
        pagination,
        filters,
        ...params.additionalParams,
      });

      // 응답 데이터의 키를 카멜케이스로 변환하여 반환
      return {
        data: convertKeysToCamelCase(response.data),
        meta: response.meta,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          '프로젝트 작업 목록을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },
);

// 프로젝트 대시보드 데이터 조회 액션
export const fetchProjectDashboardData = createAsyncThunk(
  'project/fetchDashboardData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { filters: storeFilters } = state.project;
      // 종료(90)가 아닌 모든 상태의 프로젝트 가져오기
      const filters = {
        pjt_status: { $ne: 90 }, // 종료가 아닌
      };

      const pageSize = 20; // 고정 페이지 크기

      // 첫 페이지를 조회하여 전체 데이터 수 확인
      const firstPageResponse =
        await projectApiService.getProjectScheduleStatus({
          pagination: {
            pageSize: pageSize,
            current: 1,
          },
          filters,
        });

      // API 응답 검증
      const validation = validateApiResponse(firstPageResponse);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const totalItems = firstPageResponse.meta.pagination.total;
      const paginationInfo = calculatePagination(totalItems, pageSize);

      // 모든 페이지의 데이터를 가져오기
      const allProjects = [];

      // 첫 페이지 데이터 추가 (카멜케이스로 변환)
      if (firstPageResponse.data) {
        allProjects.push(...convertKeysToCamelCase(firstPageResponse.data));
      }

      // 나머지 페이지 데이터 가져오기 (2페이지부터)
      for (let page = 2; page <= paginationInfo.totalPages; page++) {
        const response = await projectApiService.getProjectScheduleStatus({
          pagination: {
            pageSize,
            current: page,
          },
          filters,
        });

        if (response.data) {
          allProjects.push(...convertKeysToCamelCase(response.data));
        }
      }

      // 대시보드 데이터 처리 (utils 함수 사용)
      return processDashboardData(allProjects, getScheduleStatus);
    } catch (error) {
      return rejectWithValue(
        error.message || '프로젝트 대시보드 데이터를 가져오는데 실패했습니다.',
      );
    }
  },
);

// 초기 상태
const initialState = {
  items: [],
  selectedItem: SELECTED_ITEM_INITIAL_STATE,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: { ...DEFAULT_FILTERS },
  pagination: { ...DEFAULT_PAGINATION },
  dashboard: {
    status: 'idle',
    error: null,
    project: {
      normal: 0,
      delayed: 0,
      imminent: 0,
      total: 0,
    },
    task: {
      normal: 0,
      delayed: 0,
      imminent: 0,
      total: 0,
    },
    projectStatus: {
      pending: 0, // 85: 보류
      notStarted: 0, // 86: 시작전
      waiting: 0, // 87: 대기
      inProgress: 0, // 88: 진행중
      review: 0, // 89: 검수
    },
    projectType: {
      revenue: 0, // 매출
      investment: 0, // 투자
    },
    team: {}, // 팀별 카운터 (동적)
    service: {}, // 서비스별 카운터 (동적)
  },
  form: FORM_INITIAL_STATE,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // 페이지네이션 변경
    setPage: (state, action) => {
      state.pagination.current = Number(action.payload);
    },

    setPageSize: (state, action) => {
      state.pagination.pageSize = Number(action.payload);
      state.pagination.current = 1; // 페이지 크기 변경 시 첫 페이지로
    },

    // 필터 변경
    setFilters: (state, action) => {
      // action.payload가 객체인지 확인
      const payload = typeof action.payload === 'object' ? action.payload : {};

      // 두 번째 인자가 true이면 기존 필터 대체, 아니면 병합
      const replaceMode = action.meta?.replace === true;

      if (replaceMode) {
        // 기존 필터 완전히 대체
        state.filters = { ...payload };
      } else {
        // 기존 필터에 새 필터 병합 (기존 동작)
        state.filters = {
          ...state.filters,
          ...payload,
        };
      }

      state.pagination.current = 1; // 필터 변경 시 첫 페이지로
    },

    // 필터 초기화 (기본값으로 리셋)
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_FILTERS };
      state.pagination = { ...DEFAULT_PAGINATION };
    },

    // 선택된 항목 초기화
    clearSelectedItem: (state) => {
      state.selectedItem = initialState.selectedItem;
    },

    // 폼 초기화
    initForm: (state, action) => {
      const { data, mode = 'create', id = null } = action.payload;
      state.form = {
        ...initialState.form,
        data: { ...initialState.form.data, ...data },
        mode,
        editingId: id,
      };
    },

    // 폼 데이터 변경
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form.data[name] = value;
      state.form.isDirty = true;

      // 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors[name] = null;
      }
    },

    // 여러 필드 일괄 변경
    updateFormFields: (state, action) => {
      Object.entries(action.payload).forEach(([name, value]) => {
        state.form.data[name] = value;
      });
      state.form.isDirty = true;
    },

    // 폼 데이터 초기화
    resetForm: (state) => {
      state.form = { ...initialState.form };
    },

    // 폼 에러 설정
    setFormErrors: (state, action) => {
      state.form.errors = action.payload;
    },

    // 폼 에러 초기화
    clearFormErrors: (state) => {
      state.form.errors = {};
    },

    // 폼 제출 상태 설정
    setFormSubmitting: (state, action) => {
      state.form.isSubmitting = action.payload;
    },

    // 폼 유효성 설정
    setFormIsValid: (state, action) => {
      state.form.isValid = action.payload;
    },

    // 폼 모드 설정
    setFormMode: (state, action) => {
      state.form.mode = action.payload;
    },

    // 편집 ID 설정
    setEditingId: (state, action) => {
      state.form.editingId = action.payload;
    },

    // works 페이지네이션 변경
    setWorksPage: (state, action) => {
      state.selectedItem.works.pagination.current = Number(action.payload);
    },

    setWorksPageSize: (state, action) => {
      state.selectedItem.works.pagination.pageSize = Number(action.payload);
      state.selectedItem.works.pagination.current = 1; // 페이지 크기 변경 시 첫 페이지로
    },
  },
  extraReducers: (builder) => {
    builder
      // 프로젝트 목록 조회
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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
        notification.error({
          message: '데이터 조회 실패',
          description:
            action.payload || '프로젝트 목록을 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 상세 조회
      .addCase(fetchProjectDetail.pending, (state) => {
        state.selectedItem.status = 'loading';
        state.selectedItem.error = null;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.selectedItem.status = 'succeeded';
        state.selectedItem.data = action.payload;
        state.selectedItem.error = null;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.selectedItem.status = 'failed';
        state.selectedItem.data = null;
        state.selectedItem.error = action.payload;
        notification.error({
          message: '상세 정보 조회 실패',
          description:
            action.payload || '프로젝트 상세 정보를 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 생성
      .addCase(createProject.pending, (state) => {
        state.form.isSubmitting = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.form.isSubmitting = false;
        state.form = initialState.form;
        notification.success({
          message: '프로젝트 생성 완료',
          description: '새 프로젝트가 성공적으로 생성되었습니다.',
        });
      })
      .addCase(createProject.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.errors = {
          ...state.form.errors,
          submit: action.payload,
        };
        notification.error({
          message: '프로젝트 생성 실패',
          description:
            action.payload || '프로젝트 생성 중 오류가 발생했습니다.',
        });
      })

      // 프로젝트 work 리스트 조회
      .addCase(fetchProjectWorks.pending, (state) => {
        state.selectedItem.works.status = 'loading';
        state.selectedItem.works.error = null;
      })
      .addCase(fetchProjectWorks.fulfilled, (state, action) => {
        state.selectedItem.works.status = 'succeeded';
        state.selectedItem.works.items = action.payload.data;
        state.selectedItem.works.pagination.total =
          action.payload.meta.pagination.total;
        state.selectedItem.works.error = null;
      })
      .addCase(fetchProjectWorks.rejected, (state, action) => {
        state.selectedItem.works.status = 'failed';
        state.selectedItem.works.items = [];
        state.selectedItem.works.error = action.payload;
        notification.error({
          message: '작업 목록 조회 실패',
          description:
            action.payload || '프로젝트 작업 목록을 불러오는데 실패했습니다.',
        });
      })

      // 프로젝트 대시보드 데이터 조회
      .addCase(fetchProjectDashboardData.pending, (state) => {
        state.dashboard.status = 'loading';
        state.dashboard.error = null;
      })
      .addCase(fetchProjectDashboardData.fulfilled, (state, action) => {
        state.dashboard.status = 'succeeded';
        Object.assign(state.dashboard, action.payload);
        state.dashboard.error = null;
      })
      .addCase(fetchProjectDashboardData.rejected, (state, action) => {
        state.dashboard.status = 'failed';
        state.dashboard.error = action.payload;
        notification.error({
          message: '대시보드 데이터 조회 실패',
          description:
            action.payload ||
            '프로젝트 대시보드 데이터를 가져오는데 실패했습니다.',
        });
      });
  },
});

export const {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  clearSelectedItem,
  initForm,
  updateFormField,
  updateFormFields,
  resetForm,
  setFormErrors,
  clearFormErrors,
  setFormSubmitting,
  setFormIsValid,
  setFormMode,
  setEditingId,
  setWorksPage,
  setWorksPageSize,
} = projectSlice.actions;

export default projectSlice.reducer;
