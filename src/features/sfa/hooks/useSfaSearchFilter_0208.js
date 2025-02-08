/**
 * SFA 검색 및 필터 관리를 위한 통합 Hook
 * - 필터 상태 관리 및 검색 기능 통합
 * - 자동/수동 데이터 갱신 지원
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/sfa/hooks/useSfaSearchFilter.js
 */
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useSfa } from '../context/SfaProvider';
import { sfaService } from '../services/sfaService';
// import { useSfa } from '../contexts/SfaProvider';

export const useSfaSearchFilter = () => {
  const {
    setSfaData,
    setLoading,
    setError,
    pagination,
    setPage,
    setPageSize,
    setPageTotalSize,
    setLayout,
  } = useSfa();

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
   * SFA 목록 조회
   */
  const fetchSfaList = useCallback(
    async (customParams = {}) => {
      console.group('fetchSfaList');
      console.log('Filters:', filters);
      console.log('Custom Params:', customParams);

      setLoading(true);
      try {
        // filters에서 dateRange 관련 필드 제거
        const { dateRange: filterDateRange, ...restFilters } = filters;
        const { dateRange: customDateRange, ...restCustomFilters } =
          customParams?.filters || {};

        const queryParams = {
          pagination: {
            current: customParams.pagination?.current || pagination.current,
            pageSize: customParams.pagination?.pageSize || pagination.pageSize,
          },
          filters: {
            ...restFilters,
            ...restCustomFilters,
          },
          dateRange: customParams.dateRange || filters.dateRange,
        };

        console.log('Query Params:', queryParams);
        const response = await sfaService.getSfaList(queryParams);

        setSfaData(response.data);
        // 페이지네이션 정보 업데이트
        if (pagination.total !== response.meta.pagination.total) {
          setPageTotalSize(response.meta.pagination.total);
        }
        setError(null);

        return response.data;
      } catch (err) {
        const errorMessage = err.message || '검색 중 오류가 발생했습니다.';
        setError(errorMessage);
        setSfaData([]);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    },
    [filters, pagination, setSfaData, setLoading, setError],
  );

  /**
   * 월별 필터 업데이트 및 검색
   */
  const updateMonthlyFilter = async (yearMonth, probability = null) => {
    console.group('updateMonthlyFilter');
    console.log('YearMonth:', yearMonth, 'Probability:', probability);
    const date = dayjs(yearMonth);
    const dateRange = {
      startDate: date.startOf('month').format('YYYY-MM-DD'),
      endDate: date.endOf('month').format('YYYY-MM-DD'),
    };
    // filters 상태 완전히 초기화
    const newFilters = {
      dateRange,
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

    // probability 조건에 따라 필터 설정
    if (probability === 'confirmed') {
      newFilters.isConfirmed = true;
    } else if (probability) {
      newFilters.probability = probability;
    }

    setFilters(newFilters); // 필터 상태 초기화

    return fetchSfaList({
      filters: newFilters, // 전체 필터 객체 전달
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

  /**
   * 상세 검색 필터 업데이트 및 검색
   */
  const updateDetailFilter = useCallback(
    async (searchFormData) => {
      console.group('updateDetailFilter');
      console.log('Search Form Data:', searchFormData);

      setFilters((prev) => ({
        ...prev,
        ...searchFormData,
      }));

      setLayout('search');
      console.groupEnd();

      return fetchSfaList({
        ...searchFormData,
        pagination: { current: 1, pageSize: pagination.pageSize },
      });
    },
    [pagination.pageSize, fetchSfaList, setLayout],
  );

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(async () => {
    console.group('resetFilters');
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

    console.log('Initial Filters:', initialFilters);
    setFilters(initialFilters);
    console.groupEnd();

    return fetchSfaList({
      ...initialFilters,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  }, [pagination.pageSize, fetchSfaList]);

  return {
    filters,
    fetchSfaList,
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  };
};
