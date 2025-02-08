/**
 * SFA 검색 및 필터 관리를 위한 통합 Hook
 * - 필터 상태 관리 및 검색 기능 통합
 * - 자동/수동 데이터 갱신 지원
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/sfa/hooks/useSfaSearchFilter.js
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { sfaService } from '../services/sfaService';

/**
 * SFA 검색 필터 Hook
 * @param {Object} options - Hook 설정 옵션
 * @param {Function} options.onSearchComplete - 검색 완료 후 콜백
 * @param {Function} options.onError - 에러 발생 시 콜백
 */
export const useSfaSearchFilter = ({ onSearchComplete, onError } = {}) => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sfaData, setSfaData] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 초기 로딩 체크를 위한 ref
  const isInitialLoadDone = useRef(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    },
    name: '',
    customer: '',
    sfaSalesType: '',
    sfaClassification: '',
    salesItem: '',
    team: '',
    billingType: '',
    isConfirmed: '',
    probability: '',
  });

  /**
   * SFA 목록 조회 (수동 갱신)
   * @param {Object} customParams - 커스텀 검색 파라미터
   */
  const fetchSfaList = useCallback(
    async (customParams = {}, isManualSearch = false) => {
      // 이미 로딩 중이면 중복 요청 방지
      if (loading) return;

      setLoading(true);
      try {
        // filters에서 dateRange 관련 필드 제거
        const { dateRange: filterDateRange, ...restFilters } = filters;
        const { dateRange: customDateRange, ...restCustomFilters } =
          customParams?.filters || {};

        const queryParams = {
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
          },
          filters: {
            ...restFilters,
            ...restCustomFilters,
          },
          dateRange: customParams.dateRange || filters.dateRange,
          probability: customParams.probability || filters.probability,
        };

        const { data, meta } = await sfaService.getSfaList(queryParams);

        setSfaData(data);
        setPagination((prev) => ({
          ...prev,
          total: meta.pagination.total,
          // 서버 응답의 페이지네이션 정보 반영
          current:
            Math.floor(meta.pagination.start / meta.pagination.limit) + 1,
          pageSize: meta.pagination.limit,
        }));
        setError(null);

        // if (isManualSearch) {
        //   onSearchComplete?.(data);
        // }

        return data;
      } catch (err) {
        const errorMessage = err.message || '검색 중 오류가 발생했습니다.';
        setError(errorMessage);
        setSfaData([]);
        onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // [loading, filters, pagination.current, pagination.pageSize, onError], // 의존성 배열을 비워서 함수 재생성 방지
    [],
  );

  // 초기 데이터 로딩
  useEffect(() => {
    if (!isInitialLoadDone.current) {
      isInitialLoadDone.current = true;
      fetchSfaList();
    }
  }, [fetchSfaList]);

  /**
   * 페이지네이션 관련 함수들
   */
  const setPageSize = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: newSize,
    }));
  };

  const setPage = useCallback(
    (page) => {
      const newPagination = {
        current: page,
        pageSize: pagination.pageSize,
      };

      setPagination((prev) => ({
        ...prev,
        ...newPagination,
      }));

      fetchSfaList({ pagination: newPagination });
    },
    [pagination.pageSize, fetchSfaList],
  );

  /**
   * 월별 필터 업데이트 및 검색
   */
  const updateMonthlyFilter = useCallback(
    async (yearMonth, probability = null) => {
      const date = dayjs(yearMonth);
      const newFilters = {
        ...filters,
        dateRange: {
          startDate: date.startOf('month').format('YYYY-MM-DD'),
          endDate: date.endOf('month').format('YYYY-MM-DD'),
        },
        probability,
        // 기타 필터 초기화
        name: '',
        customer: '',
        sfaSalesType: '',
        sfaClassification: '',
        salesItem: '',
        team: '',
        billingType: '',
        isConfirmed: '',
      };

      setFilters(newFilters);
      // 필터 변경 후 수동으로 데이터 갱신
      return fetchSfaList({ dateRange: newFilters.dateRange, probability });
    },
    [filters, fetchSfaList],
  );

  /**
   * 상세 검색 필터 업데이트 및 검색
   */
  const updateDetailFilter = useCallback(
    async (searchFormData) => {
      setFilters((prev) => ({
        ...prev,
        ...searchFormData,
      }));
      // 필터 변경 후 수동으로 데이터 갱신
      return fetchSfaList(searchFormData);
    },
    [fetchSfaList],
  );

  /**
   * 페이지네이션 업데이트
   */
  const updatePagination = useCallback(
    async (page, pageSize = pagination.pageSize) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
      }));
      // 페이지네이션 변경 후 수동으로 데이터 갱신
      return fetchSfaList();
    },
    [pagination.pageSize, fetchSfaList],
  );

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(async () => {
    const initialFilters = {
      dateRange: {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      },
      name: '',
      customer: '',
      sfaSalesType: '',
      sfaClassification: '',
      salesItem: '',
      team: '',
      billingType: '',
      isConfirmed: '',
      probability: '',
    };

    setFilters(initialFilters);
    // 필터 초기화 후 수동으로 데이터 갱신
    return fetchSfaList(initialFilters);
  }, [fetchSfaList]);

  return {
    // 상태
    loading,
    error,
    sfaData,
    detailData,
    filters,
    pagination,

    //액션
    // 페이지변경
    setPage,
    setPageSize,
    // 데이터 조회
    fetchSfaList,
    // fetchSfaDetail,
    // 필터관리
    updateMonthlyFilter,
    updateDetailFilter,
    updatePagination,
    resetFilters,
  };
};
