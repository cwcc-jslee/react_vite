/**
 * CUSTOMER 컨텍스트 및 Provider 컴포넌트
 * - CUSTOMER 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/customer/contexts/CustomerProvider.jsx
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrawer } from '../../../store/slices/uiSlice';
import dayjs from 'dayjs';
import { customerService } from '../services/customerService';

const CustomerContext = createContext(null);

/**
 * CUSTOER Context Hook
 */
export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};

/**
 * CUSTOMER Provider 컴포넌트
 */
export const CustomerProvider = ({ children }) => {
  const dispatch = useDispatch();
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
      customerTable: true,
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
    fetchCustomerList({
      ...filters,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

  /**
   * 페이지 변경 처리
   */
  const setPage = (page) => {
    console.group('CustomerProvider - setPage');
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
    console.group('CustomerProvider - setPageSize');
    console.log('Current:', pagination.pageSize, 'New:', newSize);

    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: Number(newSize),
    }));

    console.groupEnd();
  };

  const setPageTotalSize = (size) => {
    console.group('CustomerProvider - setPageTotalSize');
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
          customerTable: true,
          //   searchForm: false,
          //   forecastTable: false,
        },
      },
      search: {
        mode: 'search',
        components: {
          customerTable: true,
          //   searchForm: true,
          //   forecastTable: false,
        },
      },
      forecast: {
        mode: 'forecast',
        components: {
          customerTable: true,
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
  // const setDrawer = (update) => {
  //   setDrawerState((prev) => ({
  //     ...prev,
  //     ...update,
  //   }));
  // };

  // const setDrawerClose = () => {
  //   setDrawerState({
  //     visible: false,
  //     controlMode: null,
  //     featureMode: null,
  //     data: null,
  //   });
  // };

  /**
   * CUSTOMER 목록 조회
   * @param {Object} customParams - 추가 파라미터 (선택사항)
   */
  const fetchCustomerList = useCallback(
    async (customParams = {}) => {
      // console.log(`>>customParams : `, customParams);
      setLoading(true);
      try {
        const queryParams = {
          pagination: {
            current: customParams.pagination?.current || pagination.current,
            pageSize: customParams.pagination?.pageSize || pagination.pageSize,
          },
        };

        // API 호출
        console.log('Query Params:', queryParams);
        const response = await customerService.getCustomerList(queryParams);

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
    fetchCustomerList();
  }, [fetchCustomerList]);

  /**
   * CUSTOMER 상세 조회
   */
  const fetchCustomerDetail = async (id) => {
    try {
      const response = await customerService.getCustomerDetail(id);
      console.log(`fetchCustomer : `, response);
      dispatch(setDrawer({ visible: true, mode: 'view', data: response }));
      // setDrawerState({
      //   visible: true,
      //   controlMode: 'view',
      //   featureMode: null,
      //   data: response,
      // });
    } catch (err) {
      // setError(err.message);
      return null;
    } finally {
    }
  };

  const value = {
    // // 데이터 관련
    fetchData,
    loading,
    error,
    pagination,
    fetchCustomerList,
    fetchCustomerDetail,
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
    // setDrawer,
    // setDrawerClose,

    //
    setLoading,
    setFetchData,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
