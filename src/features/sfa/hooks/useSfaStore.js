/**
 * @file useSfaStore.js
 * @description SFA 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. SFA 폼 상태 관리
 * 2. 폼 유효성 검사
 * 3. 페이지네이션 및 필터링
 *
 * @author [작성자명]
 * @since [버전]
 */

import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import {
  updateFormField,
  resetForm,
  setFormErrors,
  setFormSubmitting,
  setFormIsValid,
  // 필터 관련 기본 액션만 (특화된 액션 제거)
  updateFilterField,
  updateFilterFields,
  resetFilters,
  // 페이지네이션 액션 추가
  setPage,
  setPageSize,
  // SFA 목록 조회 액션 추가
  fetchSfas,
  // SFA 상세 조회 및 선택 항목 관리 액션 추가
  fetchSfaDetail,
  clearSelectedItem,
} from '../../../store/slices/sfaSlice';
import React from 'react';

/**
 * SFA 관련 상태와 액션을 관리하는 커스텀 훅
 * SFA 폼 상태, 페이지네이션, 필터링 등을 통합 관리
 */
export const useSfaStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.sfa.items);
  const pagination = useSelector((state) => state.sfa.pagination);
  const filters = useSelector((state) => state.sfa.filters);
  const status = useSelector((state) => state.sfa.status);
  const error = useSelector((state) => state.sfa.error);
  const form = useSelector((state) => state.sfa.form);
  const selectedItem = useSelector((state) => state.sfa.selectedItem);

  // 액션 핸들러
  const actions = {
    // 데이터 조회 액션
    data: {
      fetchSfas: (params) => dispatch(fetchSfas(params)),
      fetchSfaDetail: (sfaId) => dispatch(fetchSfaDetail(sfaId)),
      clearSelectedItem: () => dispatch(clearSelectedItem()),
    },

    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
        // 페이지 변경 시 데이터 재조회
        dispatch(fetchSfas());
      },
      setPageSize: (pageSize) => {
        dispatch(setPageSize(pageSize));
        // 페이지 사이즈 변경 시 데이터 재조회
        dispatch(fetchSfas());
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
          }),
        );
        // 날짜 범위 변경 시 데이터 재조회
        dispatch(fetchSfas());
      },

      // 시작일만 업데이트
      updateStartDate: (startDate) => {
        const currentFilters = filters;
        const currentEndDate =
          currentFilters.dateRange?.endDate ||
          dayjs().endOf('month').format('YYYY-MM-DD');
        dispatch(
          updateFilterFields({
            dateRange: { startDate, endDate: currentEndDate },
          }),
        );
        dispatch(fetchSfas());
      },

      // 종료일만 업데이트
      updateEndDate: (endDate) => {
        const currentFilters = filters;
        const currentStartDate =
          currentFilters.dateRange?.startDate ||
          dayjs().startOf('month').format('YYYY-MM-DD');
        dispatch(
          updateFilterFields({
            dateRange: { startDate: currentStartDate, endDate },
          }),
        );
        dispatch(fetchSfas());
      },

      // 확률 업데이트
      updateProbability: (probability) => {
        dispatch(
          updateFilterField({ name: 'probability', value: probability }),
        );
        // 확률 변경 시 데이터 재조회
        dispatch(fetchSfas());
      },

      // 월별 필터 업데이트 (yearMonth: "YYYY-MM" 형태)
      updateMonthlyFilter: (yearMonth, probability) => {
        const date = dayjs(yearMonth, 'YYYY-MM');
        const startDate = date.startOf('month').format('YYYY-MM-DD');
        const endDate = date.endOf('month').format('YYYY-MM-DD');

        const filterUpdates = {
          dateRange: { startDate, endDate },
          probability: probability, // null도 포함하여 처리
        };

        dispatch(updateFilterFields(filterUpdates));
        dispatch(fetchSfas());
      },

      // 필터 초기화
      resetFilters: () => {
        dispatch(resetFilters());
        // 필터 초기화 시 데이터 재조회
        dispatch(fetchSfas());
      },
    },

    // 폼 액션
    form: {
      // 필드 업데이트
      updateField: (name, value) => {
        return dispatch(updateFormField({ name, value }));
      },
      // 폼 초기화
      resetForm: () => dispatch(resetForm()),
      // 폼 오류 설정
      setErrors: (errors) => dispatch(setFormErrors(errors)),
      // 제출 상태 설정
      setSubmitting: (isSubmitting) =>
        dispatch(setFormSubmitting(isSubmitting)),
      // 유효성 검사 상태 설정
      setIsValid: (isValid) => dispatch(setFormIsValid(isValid)),
    },
  };

  return {
    // 상태
    items,
    pagination,
    filters,
    status,
    error,
    form,
    selectedItem,

    // 액션
    actions,
  };
};

export default useSfaStore;
