// src/features/sfa/context/SfaContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { sfaApi } from '../api/sfaApi';
import dayjs from 'dayjs';

const SfaContext = createContext(null);

// Custom Hook
export const useSfa = () => {
  const context = useContext(SfaContext);
  if (!context) {
    throw new Error('useSfa must be used within SfaProvider');
  }
  return context;
};

export const SfaProvider = ({ children }) => {
  // 기본 데이터 상태
  const [sfaData, setSfaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지모드, 컴포넌트 가시성 기능을 통합하여 구조 개선
  const [pageLayout, setPageLayout] = useState({
    mode: 'default', // 'default' | 'search' | 'forecast'
    components: {
      monthlyStatus: true,
      sfaTable: true,
      searchForm: false,
      forecastTable: false,
    },
  });

  // drawer 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    // mode: null, // 'add' | 'detail'
    // detailMode: null, // 'edit' | 'sales-view' | 'sales-edit' | 'sales-add'
    codtrolMode: null,
    featureMode: null,
    data: null,
  });

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 월별 매출합계 테이블 필터 상태
  const [dateFilter, setDateFilter] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });
  const [probabilityFilter, setProbabilityFilter] = useState(null);

  // const [mode, setMode] = useState('list'); // list, search, add, view, edit
  // const [selectedSfa, setSelectedSfa] = useState(null); //Sfa 상세 조회 데이터

  // 상세 검색 조건 상태
  const [searchCriteria, setSearchCriteria] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    salesType: null,
    probability: null,
    confirmed: null,
    customer: null,
    salesItem: null,
    salesCategory: null,
    title: '',
    team: null,
    paymentType: null,
  });

  // 월별 매출합계 테이블 필터 업데이트 함수
  const updateFilter = (yearMonth, probability = null) => {
    const date = dayjs(yearMonth);
    setDateFilter({
      startDate: date.startOf('month').format('YYYY-MM-DD'),
      endDate: date.endOf('month').format('YYYY-MM-DD'),
    });
    setProbabilityFilter(probability);
    setPagination((prev) => ({ ...prev, current: 1 }));
    console.log(
      `>>Clicked Table [ ${date.startOf('month').format('YYYY-MM-DD')} / ${date
        .endOf('month')
        .format('YYYY-MM-DD')} / ${probability}]`,
    );
  };

  // 리스트 데이터
  const fetchSfaList = useCallback(async () => {
    setLoading(true);
    try {
      console.log('>>>>>>>>>>>>>>>:', dateFilter);
      console.log('>>>>>>>>>>>>>>>:', probabilityFilter);
      const response = await sfaApi.getSfaList({
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        dateRange: dateFilter,
        probability: probabilityFilter,
      });
      setSfaData(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.pagination.total,
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
      setSfaData([]);
    } finally {
      setLoading(false);
    }
    //}, [pagination.current, pagination.pageSize]);
  }, [pagination.current, pagination.pageSize, dateFilter, probabilityFilter]);

  // 월별 매출합계 테이블 필터 변경 시 데이터 새로 불러오기
  React.useEffect(() => {
    fetchSfaList();
  }, [fetchSfaList]);

  // 상세 데이터 조회
  const fetchSfaDetail = async (id) => {
    try {
      setLoading(true);
      const response = await sfaApi.getSfaDetail(id);
      setDrawerState({
        visible: true,
        controlMode: 'view',
        featureMode: null,
        data: response.data[0],
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Drawer 모드 변경 핸들러
  const setDrawer = (update) => {
    setDrawerState((prev) => ({
      ...prev,
      ...update,
    }));
  };

  // drawer 닫기
  const setDrawerClose = () => {
    setDrawerState({
      visible: false,
      mode: null,
      detailMode: null,
      data: null,
    });
  };

  // 페이지 레이아웃 변경경
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

  // 페이지 변경 handlePageChange-> setPage
  const setPage = (page) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
    }));
  };

  // 페이지 사이즈 변경 handlePageSizeChange -> setPageSize
  const setPageSize = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: newSize,
    }));
  };
  ////////////////////////////////

  ////////////////////////

  // 검색 실행 함수
  const executeSearch = async (criteria) => {
    setLoading(true);
    try {
      const response = await sfaApi.searchSfa(criteria);
      setSfaData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 초기화 함수
  const resetSearch = () => {
    setSearchCriteria({
      dateRange: {
        startDate: null,
        endDate: null,
      },
      salesType: null,
      probability: null,
      confirmed: null,
      customer: null,
      salesItem: null,
      salesCategory: null,
      title: '',
      team: null,
      paymentType: null,
    });
  };

  // 상세보기 Drawer Form 수정 데이터 처리(edit 모드드)
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      // API 호출 및 데이터 업데이트 로직
      await sfaApi.updateSfa(drawerState.data.id, values);
      // 성공 시 view 모드로 전환
      setDrawerState((prev) => ({
        ...prev,
        mode: 'view',
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  React.useEffect(() => {
    fetchSfaList();
  }, [fetchSfaList]);

  const value = {
    // 상태
    sfaData,
    loading,
    error,
    pageLayout,
    pagination,
    drawerState,
    dateFilter, //월별 매출합계 테이블 필터
    probabilityFilter, //월별 매출합계 테이블 필터
    /////////////////

    // 액션
    fetchSfaList,
    fetchSfaDetail,
    setDrawer,
    setDrawerClose,
    setLayout, // 화면 레이아웃 변경
    setPage,
    setPageSize,

    // 삭제 or 변경필요요
    handleFormSubmit,
    updateFilter, //월별 매출합계 테이블 필터 업데이트 함수
    executeSearch,
    resetSearch,
    setSearchCriteria,
  };

  return <SfaContext.Provider value={value}>{children}</SfaContext.Provider>;
};
