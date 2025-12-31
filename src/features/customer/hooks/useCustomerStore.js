/**
 * @file useCustomerStore.js
 * @description Customer 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. Customer 필터 상태 관리
 * 2. 페이지네이션 관리
 * 3. Customer 목록 조회
 *
 * @author Customer Team
 * @since 2025-01-01
 */

import { useSelector, useDispatch } from 'react-redux';
import React from 'react';
import {
  updateFilterField,
  updateFilterFields,
  resetFilters,
  setPage,
  setPageSize,
  fetchCustomers,
} from '../../../store/slices/customerSlice';

/**
 * Customer 관련 상태와 액션을 관리하는 커스텀 훅
 * Customer 필터 상태, 페이지네이션, 목록 조회 등을 통합 관리
 */
export const useCustomerStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.customer.items);
  const pagination = useSelector((state) => state.customer.pagination);
  const filters = useSelector((state) => state.customer.filters);
  const status = useSelector((state) => state.customer.status);
  const error = useSelector((state) => state.customer.error);

  // 액션 핸들러 (메모이제이션으로 무한 루프 방지)
  const actions = React.useMemo(
    () => ({
      // 데이터 조회 액션
      data: {
        fetchCustomers: (params) => dispatch(fetchCustomers(params)),
      },

      // 페이지네이션 액션
      pagination: {
        setPage: (page) => {
          dispatch(setPage(page));
          // 페이지 변경 시 데이터 재조회
          dispatch(fetchCustomers());
        },
        setPageSize: (pageSize) => {
          dispatch(setPageSize(pageSize));
          // 페이지 사이즈 변경 시 데이터 재조회
          dispatch(fetchCustomers());
        },
      },

      // 필터 액션
      filter: {
        // 단일 필터 필드 업데이트
        updateField: (name, value) =>
          dispatch(updateFilterField({ name, value })),

        // 여러 필터 필드 동시 업데이트
        updateFields: (fieldsObject) =>
          dispatch(updateFilterFields(fieldsObject)),

        // 날짜 범위 업데이트 (dateRange 객체로 저장)
        updateDateRange: (startDate, endDate) => {
          dispatch(
            updateFilterFields({
              dateRange: { startDate, endDate },
            })
          );
          // 날짜 범위 변경 시 데이터 재조회
          dispatch(fetchCustomers());
        },

        // 필터 초기화
        resetFilters: () => {
          dispatch(resetFilters());
          // 필터 초기화 후 데이터 재조회
          dispatch(fetchCustomers());
        },
      },
    }),
    [dispatch]
  );

  return {
    // 상태
    items,
    pagination,
    filters,
    status,
    error,
    loading: status === 'loading',
    // 액션
    actions,
  };
};
