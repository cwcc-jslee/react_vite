/**
 * Project 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/project/context/ProjectContext.jsx
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react';
import { useDispatch } from 'react-redux';
import { apiService } from '@shared/api/apiService';
import { projectApiService } from '../services/projectApiService';
import { fetchProjects } from '../store/projectStoreActions';

const initialState = {
  projectStatus: {
    inProgress: 0,
    pending: 0,
    waiting: 0,
    notStarted: 0,
    review: 0,
    recentlyCompleted: 0,
    total: 0,
  },
  projectProgress: {
    distribution: {},
    total: 0,
    ranges: {},
  },
  monthlyStats: [],
  loading: false,
  error: null,
  loadingProgress: false,
  errorProgress: null,
  // 검색 관련 상태 추가
  search: {
    filters: {},
    isFetching: false,
    lastFetchTime: 0,
    error: null,
  },
  // Oneoff task 관련 상태
  oneoffTasks: {
    items: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    loading: false,
    error: null,
  },
};

const ProjectContext = createContext(null);

const DEBOUNCE_TIME = 300;

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        projectStatus: action.payload.projectStatus,
        monthlyStats: action.payload.monthlyStats,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_PROGRESS_START':
      return {
        ...state,
        loadingProgress: true,
        errorProgress: null,
      };
    case 'FETCH_PROGRESS_SUCCESS':
      return {
        ...state,
        projectProgress: action.payload,
        loadingProgress: false,
      };
    case 'FETCH_PROGRESS_ERROR':
      return {
        ...state,
        errorProgress: action.payload,
        loadingProgress: false,
      };
    case 'FETCH_ONEOFF_TASKS_START':
      return {
        ...state,
        oneoffTasks: {
          ...state.oneoffTasks,
          loading: true,
          error: null,
        },
      };
    case 'FETCH_ONEOFF_TASKS_SUCCESS':
      return {
        ...state,
        oneoffTasks: {
          items: action.payload.items,
          pagination: action.payload.pagination,
          loading: false,
          error: null,
        },
      };
    case 'FETCH_ONEOFF_TASKS_ERROR':
      return {
        ...state,
        oneoffTasks: {
          ...state.oneoffTasks,
          loading: false,
          error: action.payload,
        },
      };
    case 'SET_SEARCH_FILTERS':
      return {
        ...state,
        search: {
          ...state.search,
          filters: action.payload,
          isFetching: true,
        },
      };
    case 'SEARCH_FETCH_COMPLETE':
      return {
        ...state,
        search: {
          ...state.search,
          isFetching: false,
          lastFetchTime: Date.now(),
        },
      };
    case 'SEARCH_FETCH_ERROR':
      return {
        ...state,
        search: {
          ...state.search,
          isFetching: false,
          error: action.payload,
        },
      };
    default:
      return state;
  }
};

/**
 * 프로젝트 Context Hook
 */
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

/**
 * Project Provider 컴포넌트
 */
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const reduxDispatch = useDispatch();
  const { search } = state;

  // 검색 관련 함수들
  const handleSearch = useCallback((newFilters) => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: newFilters });
  }, []);

  const shouldFetch = useCallback(() => {
    const now = Date.now();
    return now - search.lastFetchTime >= DEBOUNCE_TIME;
  }, [search.lastFetchTime]);

  // 검색 필터 변경 시 API 호출
  useEffect(() => {
    if (!search.isFetching || !shouldFetch()) return;

    const fetchData = async () => {
      try {
        console.log(`>>> fetchProjects 호출`, search.filters);
        // Redux dispatch 사용
        await reduxDispatch(fetchProjects({ filters: search.filters }));
        dispatch({ type: 'SEARCH_FETCH_COMPLETE' });
      } catch (error) {
        console.error('Search failed:', error);
        dispatch({ type: 'SEARCH_FETCH_ERROR', payload: error.message });
      }
    };

    fetchData();
  }, [search.filters, search.isFetching, shouldFetch, reduxDispatch]);

  // 기존 데이터 fetch 함수들...
  const fetchStatusData = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const response = await apiService.get('/project-api/status');
      const responseData = response.data.data;

      const formattedData = {
        projectStatus: {
          notStarted: responseData.notStarted || 0,
          pending: responseData.pending || 0,
          waiting: responseData.waiting || 0,
          inProgress: responseData.inProgress || 0,
          review: responseData.review || 0,
          completed: responseData.recentlyCompleted || 0,
          total: responseData.total || 0,
        },
        monthlyStats: [],
        monthsPeriod: responseData.monthsPeriod || 0,
      };
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: formattedData,
      });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };

  const fetchProgressData = async () => {
    try {
      dispatch({ type: 'FETCH_PROGRESS_START' });
      const response = await apiService.get('/project-api/progress');
      const responseData = response.data.data;

      const formattedProgressData = {
        distribution: responseData.progressDistribution || {},
      };

      dispatch({
        type: 'FETCH_PROGRESS_SUCCESS',
        payload: formattedProgressData.distribution,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_PROGRESS_ERROR',
        payload: error.message,
      });
    }
  };

  // Provider 마운트시 자동으로 데이터 로드
  useEffect(() => {
    fetchStatusData();
    fetchProgressData();
  }, []);

  // 컨텍스트 값 정의
  const value = {
    state,
    fetchStatusData,
    fetchProgressData,
    // 검색 관련 함수들 추가
    handleSearch,
    search: state.search,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
