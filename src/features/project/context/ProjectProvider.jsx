/**
 * Project 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/project/context/ProjectContext.jsx
 */
import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { apiService } from '../../../shared/api/apiService';

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
  monthlyStats: [],
  loading: false,
  error: null,
};

const ProjectContext = createContext(null);
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
  // 데이터 상태
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchDashboardData = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      // API 호출 로직
      const response = await apiService.get('/project-api/status');
      // 데이터 추출
      const responseData = response.data.data;

      // state에 맞는 형식으로 변환
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
        // API에서 monthlyStats가 없으므로 빈 배열 또는 별도로 구성 필요
        monthlyStats: [],
        // 추가 데이터 저장
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

  // Provider 마운트시 자동으로 데이터 로드
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 컨텍스트 값 정의
  const value = {
    state,
    fetchDashboardData,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
