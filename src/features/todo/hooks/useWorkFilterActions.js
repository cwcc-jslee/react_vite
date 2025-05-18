/**
 * @file useWorkFilterActions.js
 * @description Work 필터 관련 액션을 관리하는 커스텀 훅
 * - 항상 스토어 내 필터만 사용하는 방식으로 구현
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  setWorkFilters,
  resetWorkFilters,
  fetchWorks,
} from '../../../store/slices/todoSlice';

export const useWorkFilterActions = () => {
  const dispatch = useDispatch();

  // 필터 상태 가져오기
  const filters = useSelector((state) => state.todo.work.filters);
  const workStatus = useSelector((state) => state.todo.work.status);

  // 필터 유틸리티 함수들
  const filterUtils = {
    // 특정 타입의 필터를 $and 배열에서 찾음
    findFilterIndex: (filterType) => {
      if (!filters.$and) return -1;

      // 점 표기법으로 된 키를 처리하기 위한 로직
      return filters.$and.findIndex((filter) => {
        const keys = Object.keys(filter);
        if (keys.length === 0) return false;

        // 필터 타입이 객체 경로인 경우 (예: 'users.id')
        if (keys[0].startsWith(filterType)) return true;

        // 필터 타입이 객체인 경우 (예: users: {id: ...})
        return keys[0] === filterType.split('.')[0];
      });
    },

    // 새 필터를 $and 배열에 추가하거나 업데이트
    updateAndFilter: (newFilter) => {
      const filterKey = Object.keys(newFilter)[0];
      const currentAndFilters = filters.$and || [];
      const existingFilterIndex = filterUtils.findFilterIndex(filterKey);

      const newAndFilters = [...currentAndFilters];

      if (existingFilterIndex >= 0) {
        newAndFilters[existingFilterIndex] = newFilter;
      } else {
        newAndFilters.push(newFilter);
      }

      return { $and: newAndFilters };
    },

    // 날짜 범위 생성
    createDateRange: (days = 30) => {
      const endDate = dayjs();
      const startDate = endDate.subtract(days, 'day');

      return {
        work_date: {
          $gte: startDate.format('YYYY-MM-DD'),
          $lte: endDate.format('YYYY-MM-DD'),
        },
      };
    },
  };

  const actions = {
    // 기본 필터 액션
    filter: {
      update: useCallback(
        (filterUpdates) => {
          // $and 배열이 없는 경우 생성
          const updatedFilters = {
            $and: filters.$and || [],
            ...filterUpdates,
          };
          dispatch(setWorkFilters(updatedFilters));
        },
        [dispatch, filters],
      ),

      updateAndFetch: useCallback(
        (filterUpdates) => {
          // $and 배열이 없는 경우 생성
          const updatedFilters = {
            $and: filters.$and || [],
            ...filterUpdates,
          };
          dispatch(setWorkFilters(updatedFilters));
          dispatch(fetchWorks());
        },
        [dispatch, filters],
      ),

      clear: useCallback(
        (fetchData = false) => {
          dispatch(resetWorkFilters());
          if (fetchData) dispatch(fetchWorks());
        },
        [dispatch],
      ),

      refresh: useCallback(() => {
        dispatch(fetchWorks());
      }, [dispatch]),
    },

    // 사용자 및 기간 필터 액션
    setUserAndDateRange: useCallback(
      (userId, days = 30, fetchData = false) => {
        if (!userId) return;

        // 현재 필터에서 $and 배열 가져오기
        const currentAndFilters = filters.$and || [];

        // 사용자 필터
        const userFilter = {
          user: {
            id: {
              $eq: userId,
            },
          },
        };

        // 날짜 필터
        const dateFilter = filterUtils.createDateRange(days);

        // 필터 업데이트
        const updatedFilters = {
          $and: [userFilter, dateFilter],
        };

        dispatch(setWorkFilters(updatedFilters));

        if (fetchData) dispatch(fetchWorks());
      },
      [dispatch, filters, filterUtils],
    ),

    // 필터 초기화
    clearFilters: useCallback(
      (fetchData = false) => {
        dispatch(resetWorkFilters());
        if (fetchData) dispatch(fetchWorks());
      },
      [dispatch],
    ),
  };

  return {
    // 상태
    filters,
    isLoading: workStatus === 'loading',
    hasActiveFilters: filters.$and && filters.$and.length > 0,

    // 액션
    actions,
  };
};

export default useWorkFilterActions;
