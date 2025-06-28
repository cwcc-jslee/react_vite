/**
 * @file useSfaStoreFilter.js
 * @description SFA 필터 관련 Redux 상태 관리 Custom Hook
 *
 * 주요 기능:
 * 1. 실시간 필터 상태 동기화
 * 2. 필터 필드별 업데이트 관리
 * 3. 필터 유효성 검사 및 초기화
 *
 * @author [작성자명]
 * @since [버전]
 * @date 25.02.07
 */

// useSfaStoreFilter 에서 useSfaFilter 로 변경 예정

import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSfaStore } from './useSfaStore';

/**
 * SFA 필터 상태를 실시간으로 Redux와 동기화하는 커스텀 훅
 * useSfaStore를 통해 간접적으로 Redux 상태 및 액션에 접근
 */
export const useSfaStoreFilter = () => {
  // useSfaStore를 통해 Redux 상태 및 액션 가져오기
  const { filters, status, error, actions } = useSfaStore();

  /**
   * 단일 필터 필드 업데이트 (실시간 동기화)
   * @param {string} name - 필드명
   * @param {any} value - 필드값
   */
  const updateField = useCallback(
    (name, value) => {
      console.log(`🔄 [useSfaStoreFilter] updateField: ${name} = ${value}`);

      actions.filter.updateField(name, value === '' ? null : value);
    },
    [actions.filter],
  );

  /**
   * 여러 필터 필드 동시 업데이트 (배치 처리)
   * @param {Object} fieldsObject - 업데이트할 필드들의 객체
   */
  const updateFields = useCallback(
    (fieldsObject) => {
      console.log('🔄 [useSfaStoreFilter] updateFields:', fieldsObject);

      actions.filter.updateFields(fieldsObject);
    },
    [actions.filter],
  );

  /**
   * 날짜 범위 업데이트 (시작일/종료일)
   * 기본 액션인 updateFields를 조합하여 구현
   * @param {string} startDate - 시작일 (YYYY-MM-DD)
   * @param {string} endDate - 종료일 (YYYY-MM-DD)
   */
  const updateDateRange = useCallback(
    (startDate, endDate) => {
      console.log(
        `🔄 [useSfaStoreFilter] updateDateRange: ${startDate} ~ ${endDate}`,
      );

      // 기본 액션을 조합하여 날짜 범위 업데이트
      actions.filter.updateFields({
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
    },
    [actions.filter],
  );

  /**
   * 월별 필터 업데이트 (년월 기준)
   * @param {string} yearMonth - 년월 (YYYY-MM)
   * @param {string|null} probability - 확률
   */
  const updateMonthlyFilter = useCallback(
    (yearMonth, probability = null) => {
      console.log(
        `🔄 [useSfaStoreFilter] updateMonthlyFilter: ${yearMonth}/${probability}`,
      );

      const date = dayjs(yearMonth);
      const dateRange = {
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      };

      actions.filter.updateFields({
        dateRange,
        probability,
        // 다른 필터는 초기화하지 않고 유지
      });
    },
    [actions.filter],
  );

  /**
   * 확률 필터 업데이트
   * 기본 액션인 updateField를 조합하여 구현
   * @param {string} probability - 확률값
   */
  const updateProbability = useCallback(
    (probability) => {
      console.log(`🔄 [useSfaStoreFilter] updateProbability: ${probability}`);

      // 기본 액션을 조합하여 확률 업데이트
      actions.filter.updateField('probability', probability);
    },
    [actions.filter],
  );

  /**
   * 필터 초기화 (기본값으로 리셋)
   */
  const resetAllFilters = useCallback(() => {
    console.log('🔄 [useSfaStoreFilter] resetAllFilters');

    actions.filter.resetFilters();
  }, [actions.filter]);

  /**
   * 특정 필터 타입별 핸들러들
   */
  const handlers = useMemo(
    () => ({
      // 일반 텍스트/선택 필드 핸들러
      handleFieldChange: (name) => (e) => {
        const value = e.target ? e.target.value : e;
        updateField(name, value);
      },

      // 날짜 필드 전용 핸들러
      handleDateChange: (dateType) => (e) => {
        const value = e.target.value;
        const currentDateRange = filters.dateRange || {};

        if (dateType === 'startDate') {
          updateDateRange(value, currentDateRange.endDate);
        } else if (dateType === 'endDate') {
          updateDateRange(currentDateRange.startDate, value);
        }
      },

      // 고객사 선택 핸들러
      handleCustomerSelect: (customer) => {
        updateField('customer', customer?.id || null);
      },

      // 매출구분 변경 핸들러 (매출품목 초기화 포함)
      handleClassificationChange: (value) => {
        updateFields({
          sfaClassification: value,
          salesItem: null, // 매출구분 변경시 매출품목 초기화
        });
      },

      // 복합 조건 핸들러 (매출품목 + 사업부)
      handleItemTeamChange: (name, value) => {
        updateField(name, value);
      },
    }),
    [filters.dateRange, updateField, updateFields, updateDateRange],
  );

  /**
   * 필터 상태 유효성 검사
   */
  const validation = useMemo(() => {
    const { dateRange } = filters;

    return {
      isDateRangeValid:
        dateRange?.startDate &&
        dateRange?.endDate &&
        dayjs(dateRange.startDate).isBefore(
          dayjs(dateRange.endDate).add(1, 'day'),
        ),
      hasActiveFilters: Object.entries(filters).some(([key, value]) => {
        if (key === 'dateRange') {
          return value?.startDate || value?.endDate;
        }
        return value !== null && value !== undefined && value !== '';
      }),
    };
  }, [filters]);

  /**
   * 현재 필터를 검색 파라미터 형태로 변환
   */
  const getSearchParams = useCallback(() => {
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'dateRange' && value) {
          if (value.startDate || value.endDate) {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    console.log('🔍 [useSfaStoreFilter] getSearchParams:', cleanFilters);
    return cleanFilters;
  }, [filters]);

  return {
    // 상태
    filters,
    isLoading: status?.loading,
    error,
    validation,

    // 액션 메서드
    updateField,
    updateFields,
    updateDateRange,
    updateMonthlyFilter,
    updateProbability,
    resetAllFilters,

    // 편의 핸들러들
    handlers,

    // 유틸리티
    getSearchParams,
  };
};

export default useSfaStoreFilter;
