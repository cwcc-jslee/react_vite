/**
 * SFA 컨텍스트 및 Provider 컴포넌트
 * - SFA 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/sfa/contexts/SfaProvider.jsx
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { sfaService } from '../services/sfaService';
// import { useSfaSearchFilter } from '../hooks/useSfaSearchFilter';

const SfaContext = createContext(null);

/**
 * SFA Context Hook
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
 */
export const SfaProvider = ({ children }) => {
  // 데이터 상태
  const [sfaData, setSfaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    },
    probability: null,
  });

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

  // 필터
  // const { updateDetailFilter } = useSfaSearchFilter;
  /**
   * 페이지 변경 처리
   */
  const setPage = (page) => {
    console.group('SfaProvider - setPage');
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
    console.group('SfaProvider - setPageSize');
    console.log('Current:', pagination.pageSize, 'New:', newSize);

    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: Number(newSize),
    }));

    console.groupEnd();
  };

  const setPageTotalSize = (size) => {
    console.group('SfaProvider - setPageTotalSize');
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

  /**
   * SFA 목록 조회
   * @param {Object} customParams - 추가 파라미터 (선택사항)
   */
  const fetchSfaList = useCallback(
    async (customParams = {}) => {
      console.log(`>>filters : `, filters);
      console.log(`>>customParams : `, customParams);
      setLoading(true);
      try {
        // filters에서 dateRange 관련 필드 제거
        const { dateRange, probability, ...restFilters } = filters;
        const {
          dateRange: customDateRange,
          probability: customProbability,
          ...restCustomFilters
        } = customParams?.filters || {};
        console.log(`>>customDateRange : `, customDateRange);

        // 기본 파라미터와 커스텀 파라미터 병합
        // const queryParams = {
        //   pagination: {
        //     current: customParams.pagination?.current || pagination.current,
        //     pageSize: customParams.pagination?.pageSize || pagination.pageSize,
        //   },
        //   filters: {
        //     ...restFilters,
        //     ...restCustomFilters,
        //   },
        //   dateRange: customParams.dateRange || filters.dateRange,
        // };

        const queryParams = {
          dateRange: customDateRange || dateRange,
          probability: customProbability || probability,
          filters: { ...restFilters, ...restCustomFilters },
          pagination: {
            current: customParams.pagination?.current || pagination.current,
            pageSize: customParams.pagination?.pageSize || pagination.pageSize,
          },
        };

        // API 호출
        console.log('Query Params:', queryParams);
        const response = await sfaService.getSfaList(queryParams);

        // 데이터 업데이트
        setSfaData(response.data);

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
        setSfaData([]);
        // return [];
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

  const value = {
    // // 데이터 관련
    sfaData,
    loading,
    error,
    pagination,
    fetchSfaList,
    // fetchSfaDetail,
    setPage,
    setPageSize,
    setPageTotalSize,
    setError,

    // // 레이아웃 관련
    pageLayout,
    setLayout,

    // // 드로어 관련
    // drawerState,
    // setDrawer,
    // setDrawerClose,

    // 필터 관련
    filters,
    setFilters,
    // updateMonthlyFilter,
    // updateDetailFilter,
    // resetFilters,

    // 데이터 및 검색/필터 관련
    // ...searchFilter,

    // 레이아웃 관련
    // pageLayout,
    // setLayout,

    // 드로어 관련
    drawerState,
    setDrawer,
    setDrawerClose,

    //
    setLoading,
    setSfaData,
  };

  return <SfaContext.Provider value={value}>{children}</SfaContext.Provider>;
};
