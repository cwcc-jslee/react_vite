/**
 * Project 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/project/context/ProjectContext.jsx
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { apiService } from '@shared/api/apiService';
// import { fetchProjectStatus } from '../../../store/slices/projectSlice';

const ProjectContext = createContext(null);

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
  // const dispatch = useDispatch();
  // const { projectStatus, projectProgress, monthlyStats } = useSelector(
  //   (state) => state.project.dashboard,
  // );

  // Provider 마운트시 자동으로 데이터 로드
  // useEffect(() => {
  //   dispatch(fetchProjectStatus());
  // }, [dispatch]);

  // 컨텍스트 값 정의
  const value = {
    // state: {
    //   projectStatus,
    //   projectProgress,
    //   monthlyStats,
    // },
    // fetchStatusData: () => dispatch(fetchProjectStatus()),
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
