// src/features/sfa/contexts/SfaProvider.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { sfaApi } from '../api/sfaApi';
import { useSfaFilter } from '../hooks/useSfaFilter';

const SfaContext = createContext(null);

/**
 * SFA 관련 데이터와 UI 상태를 관리하는 커스텀 훅
 */
export const useSfa = () => {
  const context = useContext(SfaContext);
  if (!context) {
    throw new Error('useSfa must be used within SfaProvider');
  }
  return context;
};

/**
 * SFA Provider 컴포넌트
 * SFA 데이터 및 UI 상태 관리를 통합
 */
export const SfaProvider = ({ children }) => {
  // 데이터 상태
  const [sfaData, setSfaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      monthlyStatus: true,
      sfaTable: true,
      searchForm: false,
      forecastTable: false,
    },
  });

  // 드로어 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    controlMode: null,
    featureMode: null,
    data: null,
  });

  // Sfa 테이블 리스트용 필터
  const {
    filters,
    updateFilter,
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  } = useSfaFilter();

  /**
   * SFA 목록 조회
   * @param {Object} customParams - 추가 파라미터 (선택사항)
   */
  const fetchSfaList = useCallback(
    async (customParams = {}) => {
      setLoading(true);
      try {
        // 기본 파라미터와 커스텀 파라미터 병합
        const queryParams = {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
          },
          filters: {
            ...filters,
            ...customParams.filters,
          },
          dateRange: customParams.dateRange || filters.dateRange,
          probability: customParams.probability || filters.probability,
        };

        // API 호출
        const response = await sfaApi.getSfaList(queryParams);

        // 데이터 업데이트
        setSfaData(response.data);

        // 페이지네이션 정보 업데이트
        setPagination((prev) => ({
          ...prev,
          total: response.meta.pagination.total,
        }));

        // 에러 상태 초기화
        setError(null);

        return response.data;
      } catch (err) {
        // 에러 처리
        const errorMessage = err.response?.data?.error?.message || err.message;
        setError(errorMessage);
        setSfaData([]);

        // 에러 알림
        // notification.error({
        //   message: 'SFA 목록 조회 실패',
        //   description: errorMessage,
        // });

        return [];
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, filters],
  );

  // 초기 데이터 로드
  React.useEffect(() => {
    fetchSfaList();
  }, [fetchSfaList]);

  /**
   * SFA 상세 조회
   */
  const fetchSfaDetail = async (id) => {
    setLoading(true);
    try {
      const response = await sfaApi.getSfaDetail(id);
      setDrawerState({
        visible: true,
        controlMode: 'view',
        featureMode: null,
        data: response.data[0],
      });
      return response.data[0];
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * SFA 상세 조회 버튼 클릭
   */

  /**
   * 페이지네이션 관련 함수들
   */
  const setPage = (page) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
    }));
  };

  const setPageSize = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: newSize,
    }));
  };

  /**
   * 레이아웃 관련 함수들
   */
  const setLayout = (mode) => {
    const layouts = {
      default: {
        mode: 'default',
        components: {
          monthlyStatus: true,
          sfaTable: true,
          searchForm: false,
          forecastTable: false,
        },
      },
      search: {
        mode: 'search',
        components: {
          monthlyStatus: false,
          sfaTable: true,
          searchForm: true,
          forecastTable: false,
        },
      },
      forecast: {
        mode: 'forecast',
        components: {
          monthlyStatus: false,
          sfaTable: false,
          searchForm: false,
          forecastTable: true,
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

  const value = {
    // 데이터 관련
    sfaData,
    loading,
    error,
    pagination,
    setPagination,
    fetchSfaList,
    fetchSfaDetail,
    setPage,
    setPageSize,

    // 레이아웃 관련
    pageLayout,
    setLayout,

    // 드로어 관련
    drawerState,
    setDrawer,
    setDrawerClose,

    // 필터 관련
    filters,
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  };

  return <SfaContext.Provider value={value}>{children}</SfaContext.Provider>;
};
