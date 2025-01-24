// src/features/sfa/hooks/useSfaTable.js
// 구조개선(25.01.24)
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

/**
 * SFA 테이블의 필터링과 정렬을 관리하는 커스텀 훅
 * @param {Function} onFilterChange - 필터 변경 시 호출될 콜백 함수
 * @returns {Object} 테이블 필터와 정렬 관련 상태 및 함수들
 */
export const useSfaTable = (onFilterChange) => {
  // 날짜 필터 상태
  const [dateFilter, setDateFilter] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  // 확률 필터 상태
  const [probabilityFilter, setProbabilityFilter] = useState(null);

  // 정렬 상태
  const [sortState, setSortState] = useState({
    field: null,
    order: null,
  });

  /**
   * 필터 업데이트 함수
   * @param {string} yearMonth - 년월 문자열 (YYYY-MM)
   * @param {number|null} probability - 확률 값
   */
  const updateFilter = useCallback(
    (yearMonth, probability = null) => {
      console.log(`****** useSfaTable ****** : ${yearMonth}, ${probability}`);
      const date = dayjs(yearMonth);
      const newDateFilter = {
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      };

      setDateFilter(newDateFilter);
      setProbabilityFilter(probability);

      // 필터 변경 콜백 호출
      if (onFilterChange) {
        onFilterChange({
          dateFilter: newDateFilter,
          probabilityFilter: probability,
        });
      }
    },
    [onFilterChange],
  );

  /**
   * 테이블 정렬 처리 함수
   * @param {string} field - 정렬할 필드명
   * @param {string} order - 정렬 순서 ('ascend' | 'descend' | null)
   */
  const handleSort = useCallback(
    (field, order) => {
      setSortState({ field, order });

      // 정렬 상태에 따른 데이터 처리 로직
      const sortOrder = {
        ascend: 'asc',
        descend: 'desc',
      }[order];

      if (onFilterChange) {
        onFilterChange({
          dateFilter,
          probabilityFilter,
          sort: sortOrder ? { field, order: sortOrder } : null,
        });
      }
    },
    [dateFilter, probabilityFilter, onFilterChange],
  );

  /**
   * 특정 달의 필터 상태 확인
   * @param {string} yearMonth - 확인할 년월 (YYYY-MM)
   * @returns {boolean} 해당 월이 현재 필터에 적용되어 있는지 여부
   */
  const isMonthSelected = useCallback(
    (yearMonth) => {
      const targetMonth = dayjs(yearMonth).format('YYYY-MM');
      const filterMonth = dayjs(dateFilter.startDate).format('YYYY-MM');
      return targetMonth === filterMonth;
    },
    [dateFilter],
  );

  /**
   * 현재 필터 상태를 문자열로 반환
   * @returns {string} 현재 적용된 필터 설명
   */
  const getFilterDescription = useCallback(() => {
    const monthStr = dayjs(dateFilter.startDate).format('YYYY년 MM월');
    const probabilityStr = probabilityFilter
      ? ` (확률: ${probabilityFilter}%)`
      : '';
    return `${monthStr}${probabilityStr}`;
  }, [dateFilter, probabilityFilter]);

  return {
    // 상태
    dateFilter,
    probabilityFilter,
    sortState,

    // 상태 변경 함수
    updateFilter,
    handleSort,

    // 유틸리티 함수
    isMonthSelected,
    getFilterDescription,
  };
};
