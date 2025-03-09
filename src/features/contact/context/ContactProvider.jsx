/**
 * Contact 컨텍스트 및 Provider 컴포넌트
 * - Contact 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/Contact/contexts/ContactProvider.jsx
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import dayjs from 'dayjs';

const ContactContext = createContext(null);

/**
 * CUSTOER Context Hook
 */
export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within ContactProvider');
  }
  return context;
};

/**
 * Contact Provider 컴포넌트
 */
export const ContactProvider = ({ children }) => {
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
      contactTable: true,
      //   searchForm: false,
      //   forecastTable: false,
    },
  });

  // 드로어 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    controlMode: null,
    featureMode: null,
    data: null,
  });

  const resetFilters = () => {
    fetchContactList({
      ...filters,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

  /**
   * 페이지 변경 처리
   */
  const setPage = (page) => {
    console.group('ContactProvider - setPage');
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
    console.group('ContactProvider - setPageSize');
    console.log('Current:', pagination.pageSize, 'New:', newSize);

    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: Number(newSize),
    }));

    console.groupEnd();
  };

  const setPageTotalSize = (size) => {
    console.group('ContactProvider - setPageTotalSize');
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
          contactTable: true,
          //   searchForm: false,
          //   forecastTable: false,
        },
      },
      search: {
        mode: 'search',
        components: {
          contactTable: true,
          //   searchForm: true,
          //   forecastTable: false,
        },
      },
      forecast: {
        mode: 'forecast',
        components: {
          contactTable: true,
          //   searchForm: false,
          //   forecastTable: true,
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
  };

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
};
