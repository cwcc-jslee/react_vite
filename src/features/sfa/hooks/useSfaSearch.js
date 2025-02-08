import { useCallback } from 'react';
import { useSfa } from '../contexts/SfaProvider';
// import { transformSearchParams } from '../utils/transformSearchParams';
import dayjs from 'dayjs';

/**
 * SFA 검색 기능을 관리하는 훅
 * @param {Object} options - 훅 옵션
 * @param {Function} options.onSearchComplete - 검색 완료 후 콜백
 */
export const useSfaSearch = ({ onSearchComplete } = {}) => {
  const {
    fetchSfaList,
    setLayout,
    loading,
    error,
    filters,
    updateFilter,
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  } = useSfa();

  /**
   * 검색 실행
   * @param {Object} searchParams - 검색 파라미터
   * @param {Object} options - 검색 옵션
   */
  const executeSearch = useCallback(
    async (searchParams, options = {}) => {
      const { mode = 'search', updateType = 'detail' } = options;

      try {
        // 레이아웃 모드 설정
        setLayout(mode);

        // 검색 조건 업데이트 방식 결정
        switch (updateType) {
          case 'monthly':
            const { yearMonth, probability } = searchParams;
            updateMonthlyFilter(yearMonth, probability);
            break;

          case 'detail':
            updateDetailFilter(searchParams);
            break;

          default:
            console.warn('Unknown update type:', updateType);
        }

        // API 파라미터 변환 및 검색 실행
        // const params = transformSearchParams(searchParams);
        const result = await fetchSfaList(params);

        onSearchComplete?.(result);
        return result;
      } catch (error) {
        console.error('Search failed:', error);
        throw error;
      }
    },
    [
      fetchSfaList,
      setLayout,
      updateMonthlyFilter,
      updateDetailFilter,
      onSearchComplete,
    ],
  );

  /**
   * 월별 검색 실행
   * @param {string} yearMonth - 년월 (YYYY-MM 형식)
   * @param {string|null} probability - 확률
   */
  const executeMonthlySearch = useCallback(
    async (yearMonth, probability = null) => {
      return executeSearch(
        { yearMonth, probability },
        { mode: 'search', updateType: 'monthly' },
      );
    },
    [executeSearch],
  );

  /**
   * 상세 검색 실행
   * @param {Object} searchFormData - 검색 폼 데이터
   */
  const executeDetailSearch = useCallback(
    async (searchFormData) => {
      return executeSearch(searchFormData, {
        mode: 'search',
        updateType: 'detail',
      });
    },
    [executeSearch],
  );

  return {
    isSearching: loading,
    error,
    filters,
    executeMonthlySearch,
    executeDetailSearch,
    updateFilter,
    resetFilters,
  };
};
