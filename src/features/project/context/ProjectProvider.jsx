/**
 * Project 컨텍스트 및 Provider 컴포넌트
 * - Project 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.03.12
 * @version 1.0.0
 * @filename src/features/project/context/ProjectProvider.jsx
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { projectApiService } from '../services/projectApiService';

const ProjectContext = createContext(null);

/**
 * CUSTOER Context Hook
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
  const [fetchData, setFetchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filters = {};

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 레이아웃 상태
  const [pageLayout, setPageLayout] = useState({
    mode: 'default',
    components: {
      projectTable: true,
      projectAddSection: false,
      //   forecastTable: false,
    },
  });

  // 드로어 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    baseMode: null,
    subMode: null,
    data: null,
  });

  const resetFilters = () => {
    fetchProjectList({
      ...filters,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

  /**
   * 페이지 변경 처리
   */
  const setPage = (page) => {
    console.group('ProjectProvider - setPage');
    console.log('Current:', pagination.current, 'New:', page);

    setPagination((prev) => ({
      ...prev,
      current: Number(page),
    }));

    console.groupEnd();
  };

  /**
   * 페이지 크기 변경 처리
   */
  const setPageSize = (newSize) => {
    console.group('ProjectProvider - setPageSize');
    console.log('Current:', pagination.pageSize, 'New:', newSize);

    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: Number(newSize),
    }));

    console.groupEnd();
  };

  const setPageTotalSize = (size) => {
    console.group('ProjectProvider - setPageTotalSize');
    console.log('Totalsize:', pagination.total, 'New:', size);

    setPagination((prev) => ({
      ...prev,
      total: Number(size),
    }));

    console.groupEnd();
  };

  /**
   * 레이아웃 관련 함수들
   */
  const setLayout = (mode) => {
    const layouts = {
      default: {
        mode: 'default',
        components: {
          projectTable: true,
          projectAddSection: false,
        },
      },
      projectadd: {
        mode: 'projectadd',
        components: {
          projectTable: false,
          projectAddSection: true,
        },
      },
    };

    setPageLayout(layouts[mode] || layouts.default);
  };

  /**
   * 드로어 관련 함수들
   */
  const setDrawer = (update) => {
    setDrawerState((prev) => ({
      ...prev,
      ...update,
    }));
  };

  const setDrawerClose = () => {
    setDrawerState({
      visible: false,
      controlMode: null,
      featureMode: null,
      data: null,
    });
  };

  /**
   * Project 목록 조회
   * @param {Object} queryParams - 추가 파라미터 (선택사항)
   */
  const fetchProjectList = useCallback(
    async (customParams = {}) => {
      console.log(`>>queryParams : `, customParams);
      setLoading(true);
      try {
        const queryParams = {
          pagination: {
            current: customParams.pagination?.current || pagination.current,
            pageSize: customParams.pagination?.pageSize || pagination.pageSize,
          },
        };
        // API 호출
        const response = await projectApiService.getProjectList(queryParams);

        // 데이터 업데이트
        setFetchData(response.data);

        // 페이지네이션 정보 업데이트
        if (pagination.total !== response.meta.pagination.total) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.pagination.total,
          }));
        }

        // 에러 상태 초기화
        setError(null);

        return response.data;
      } catch (err) {
        // 에러 처리
        const errorMessage = err.response?.data?.error?.message || err.message;
        setError(errorMessage);
        setFetchData([]);
        // return [];
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize],
  );

  // 초기 데이터 로드
  React.useEffect(() => {
    console.log('Initial data loading');
    fetchProjectList();
  }, [fetchProjectList]);

  const value = {
    // // 데이터 관련
    fetchData,
    loading,
    error,
    pagination,
    setPage,
    setPageSize,
    setPageTotalSize,
    setError,

    // // 레이아웃 관련
    pageLayout,
    setLayout,
    resetFilters,

    // 드로어 관련
    drawerState,
    setDrawer,
    setDrawerClose,

    //
    setLoading,
    setFetchData,
    //
    // fetchProjectList,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
