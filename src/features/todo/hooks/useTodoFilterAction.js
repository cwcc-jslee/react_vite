/**
 * @file useTodoFilterAction.js
 * @description Todo 필터 관련 액션을 관리하는 커스텀 훅
 * - 항상 스토어 내 필터만 사용하는 방식으로 구현
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFilters,
  resetFilters,
  fetchTodos,
  updateFiltersAndFetch,
  updateNestedFilter,
  updateFilterArray,
  replaceFilters,
} from '../../../store/slices/todoSlice';

export const useTodoFilterAction = () => {
  const dispatch = useDispatch();

  // 필터 상태 가져오기
  const filters = useSelector((state) => state.todo.filters);
  const todoStatus = useSelector((state) => state.todo.status);

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
  };

  const actions = {
    // 기본 필터 액션
    filter: {
      update: useCallback(
        (filterUpdates) => {
          dispatch(setFilters(filterUpdates));
        },
        [dispatch],
      ),

      updateAndFetch: useCallback(
        (filterUpdates) => {
          dispatch(updateFiltersAndFetch(filterUpdates));
        },
        [dispatch],
      ),

      clear: useCallback(
        (fetchData = false) => {
          dispatch(resetFilters());
          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch],
      ),

      replace: useCallback(
        (newFilters, fetchData = false) => {
          dispatch(replaceFilters(newFilters));
          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch],
      ),

      refresh: useCallback(() => {
        dispatch(fetchTodos());
      }, [dispatch]),
    },

    // 중첩 필터 액션
    nested: {
      update: useCallback(
        (path, operator, value, fetchData = false) => {
          dispatch(updateNestedFilter({ path, operator, value }));
          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch],
      ),

      updateArray: useCallback(
        (arrayPath, index, value, fetchData = false) => {
          dispatch(updateFilterArray({ arrayPath, index, value }));
          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch],
      ),
    },

    // 사용자 필터 액션
    user: {
      set: useCallback(
        (userId, fetchData = false) => {
          if (!userId) return;

          // 현재 필터에서 $and 배열 가져오기
          const currentAndFilters = filters.$and || [];

          // 기존 사용자 필터 찾기
          const existingUserFilterIndex = currentAndFilters.findIndex(
            (filter) => filter.users?.id?.$eq,
          );

          // 새로운 사용자 필터
          const userFilter = {
            users: {
              id: {
                $eq: userId,
              },
            },
          };
          // 필터 업데이트
          const updatedFilters = filterUtils.updateAndFilter(userFilter);
          dispatch(setFilters(updatedFilters));

          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch, filters, filterUtils],
      ),
    },

    // 프로젝트 필터 액션
    project: {
      setStatus: useCallback(
        (statusIds, fetchData = false) => {
          if (statusIds === null || statusIds === undefined) return;

          const statusIdArray = Array.isArray(statusIds)
            ? statusIds
            : [statusIds];
          if (statusIdArray.length === 0) return;

          const statusFilter = {
            project: {
              pjt_status: {
                id: {
                  $in: statusIdArray,
                },
              },
            },
          };

          // 필터 업데이트
          const updatedFilters = filterUtils.updateAndFilter(statusFilter);
          dispatch(setFilters(updatedFilters));

          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch, filterUtils],
      ),

      addStatus: useCallback(
        (newStatusIds, fetchData = false) => {
          if (!newStatusIds) return;

          const newStatusIdArray = Array.isArray(newStatusIds)
            ? newStatusIds
            : [newStatusIds];

          if (newStatusIdArray.length === 0) return;

          // 현재 프로젝트 상태 ID 가져오기
          const currentStatusIds = helpers.getProjectStatusIds();

          // 중복 제거하여 결합
          const combinedStatusIds = [
            ...new Set([...currentStatusIds, ...newStatusIdArray]),
          ];

          // 평탄화된 프로젝트 상태 필터
          const statusFilter = {
            project: {
              pjt_status: {
                id: {
                  $in: combinedStatusIds,
                },
              },
            },
          };

          // 필터 업데이트
          const updatedFilters = filterUtils.updateAndFilter(statusFilter);
          dispatch(setFilters(updatedFilters));

          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch, filters, filterUtils],
      ),

      removeStatus: useCallback(
        (statusIdsToRemove, fetchData = false) => {
          if (!statusIdsToRemove) return;

          const statusIdsToRemoveArray = Array.isArray(statusIdsToRemove)
            ? statusIdsToRemove
            : [statusIdsToRemove];

          if (statusIdsToRemoveArray.length === 0) return;

          // 현재 프로젝트 상태 ID 가져오기
          const currentStatusIds = helpers.getProjectStatusIds();

          // 제거할 ID를 필터링
          const filteredStatusIds = currentStatusIds.filter(
            (id) => !statusIdsToRemoveArray.includes(id),
          );

          if (filteredStatusIds.length === 0) {
            console.warn(
              '프로젝트 상태 필터가 비어있게 됩니다. 최소한 하나의 값이 필요합니다.',
            );
            return;
          }

          // 평탄화된 프로젝트 상태 필터
          const statusFilter = {
            'project.pjt_status.id': {
              $in: filteredStatusIds,
            },
          };

          // 필터 업데이트
          const updatedFilters = filterUtils.updateAndFilter(statusFilter);
          dispatch(setFilters(updatedFilters));

          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch, filters, filterUtils],
      ),
    },

    // 일정 필터 액션
    schedule: {
      setType: useCallback(
        (scheduleTypes, fetchData = false) => {
          if (!scheduleTypes) return;

          const scheduleTypeArray = Array.isArray(scheduleTypes)
            ? scheduleTypes
            : [scheduleTypes];

          if (scheduleTypeArray.length === 0) return;

          const operator = scheduleTypeArray.length === 1 ? '$eq' : '$in';
          const value =
            scheduleTypeArray.length === 1
              ? scheduleTypeArray[0]
              : scheduleTypeArray;

          // 평탄화된 일정 유형 필터
          const scheduleFilter = {
            task_schedule_type: { [operator]: value },
          };

          // 필터 업데이트
          const updatedFilters = filterUtils.updateAndFilter(scheduleFilter);
          dispatch(setFilters(updatedFilters));

          if (fetchData) dispatch(fetchTodos());
        },
        [dispatch, filterUtils],
      ),
    },

    // 날짜 필터 액션
    date: {
      setRange: useCallback(
        (field, startDate, endDate, fetchData = false) => {
          let dateConditions = {};

          if (startDate) {
            dateConditions.$gte =
              startDate instanceof Date ? startDate.toISOString() : startDate;
          }

          if (endDate) {
            dateConditions.$lte =
              endDate instanceof Date ? endDate.toISOString() : endDate;
          }

          if (Object.keys(dateConditions).length > 0) {
            // 평탄화된 날짜 필터
            const dateFilter = {
              [field]: dateConditions,
            };

            // 필터 업데이트
            const updatedFilters = filterUtils.updateAndFilter(dateFilter);
            dispatch(setFilters(updatedFilters));

            if (fetchData) dispatch(fetchTodos());
          }
        },
        [dispatch, filterUtils],
      ),
    },
  };

  // 헬퍼 메서드
  const helpers = {
    getProjectStatusIds: useCallback(() => {
      if (!filters.$and) return [];

      try {
        // 평탄화된 구조에서 프로젝트 상태 ID 찾기
        const projectFilter = filters.$and.find(
          (filter) => filter['project.pjt_status.id']?.$in,
        );

        return projectFilter?.['project.pjt_status.id']?.$in || [];
      } catch (error) {
        console.error(
          '필터 구조에서 프로젝트 상태 ID를 찾을 수 없습니다:',
          error,
        );
        return [];
      }
    }, [filters]),

    getScheduleTypes: useCallback(() => {
      if (!filters.$and) return null;

      try {
        // 평탄화된 구조에서 일정 유형 찾기
        const scheduleFilter = filters.$and.find(
          (filter) => filter.task_schedule_type,
        );

        const typeFilter = scheduleFilter?.task_schedule_type;

        if (typeFilter?.$eq) {
          return typeFilter.$eq;
        } else if (typeFilter?.$in) {
          return typeFilter.$in;
        }

        return null;
      } catch (error) {
        console.error('필터 구조에서 일정 유형을 찾을 수 없습니다:', error);
        return null;
      }
    }, [filters]),
  };

  return {
    // 상태
    filters,
    isLoading: todoStatus === 'loading',
    hasActiveFilters: filters.$and && filters.$and.length > 1, // 기본 필터 외에 다른 필터가 있는지

    // 액션
    actions,

    // 헬퍼
    helpers,
  };
};

export default useTodoFilterAction;
