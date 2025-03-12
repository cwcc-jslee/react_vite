/**
 * Contact 컨텍스트 및 Provider 컴포넌트
 * - Contact 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/Contact/contexts/ContactProvider.jsx
 */
import React, { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';
import { contactService } from '../services/contactService';

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
    controlMode: null, // 삭제예정 - baseMode 로 변경
    featureMode: null, // 삭제예정 - subMode 로 변경
    baseMode: null,
    subMode: null,
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
          contactSearchForm: true,
          contactTable: true,
          contactExcelUpload: false,
          //   searchForm: false,
          //   forecastTable: false,
        },
      },
      upload: {
        mode: 'upload',
        components: {
          contactSearchForm: false,
          contactTable: false,
          contactExcelUpload: true,
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
   * Contact 목록 조회
   * @param {Object} queryParams - 추가 파라미터 (선택사항)
   */
  const fetchContactList = async (queryParams = {}) => {
    console.log(`>>queryParams : `, queryParams);
    setLoading(true);
    try {
      // API 호출
      const response = await contactService.getContactList(queryParams);

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
    //
    fetchContactList,
  };

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
};
