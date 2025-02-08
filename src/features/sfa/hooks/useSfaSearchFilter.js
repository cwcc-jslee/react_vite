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
    fetchSfaList,
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
    const newFilters = { dateRange, probability };

    return fetchSfaList({
      filters: newFilters, // 전체 필터 객체 전달
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

  /**
   * 상세 검색 필터 업데이트 및 검색
   */
  const updateDetailFilter = async (searchFormData) => {
    console.group('updateDetailFilter');
    console.log('Search Form Data:', searchFormData);
    console.groupEnd();

    return fetchSfaList({
      filters: searchFormData,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  };

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
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  };
};
