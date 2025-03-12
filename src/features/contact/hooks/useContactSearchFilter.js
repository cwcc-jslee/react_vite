/**
 * Contact 검색 및 필터 관리를 위한 통합 Hook
 * - 필터 상태 관리 및 검색 기능 통합
 * - 자동/수동 데이터 갱신 지원
 *
 * @date 25.02.07
 * @version 1.0.0
 * @filename src/features/contact/hooks/useContactSearchFilter.js
 */
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useContact } from '../context/ContactProvider';

export const useContactSearchFilter = () => {
  const { pagination, fetchContactList } = useContact();

  // 필터 상태
  const [filters, setFilters] = useState({
    fullName: '',
    customer: '',
    contactType: '',
    memo: '',
  });

  /**
   * 상세 검색 필터 업데이트 및 검색
   */
  const updateDetailFilter = async (searchFormData) => {
    console.group('updateDetailFilter');
    console.log('Search Form Data:', searchFormData);
    console.groupEnd();

    return fetchContactList({
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
      fullName: '',
      customer: '',
      contactType: '',
      memo: '',
    };

    console.log('Initial Filters:', initialFilters);
    setFilters(initialFilters);
    console.groupEnd();

    return fetchContactList({
      ...initialFilters,
      pagination: { current: 1, pageSize: pagination.pageSize },
    });
  }, [pagination.pageSize, fetchContactList]);

  return {
    filters,
    updateDetailFilter,
    resetFilters,
  };
};
