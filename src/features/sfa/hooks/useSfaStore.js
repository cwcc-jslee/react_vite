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
import {
  updateFormField,
  resetForm,
  setFormErrors,
  setFormSubmitting,
  setFormIsValid,
} from '../../../store/slices/sfaSlice';

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

  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
      },
      setPageSize: (pageSize) => {
        dispatch(setPageSize(pageSize));
      },
    },

    // 필터 액션
    filter: {},

    // 폼 액션
    form: {
      // 필드 업데이트
      updateField: (name, value) => dispatch(updateFormField({ name, value })),
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

    // 액션
    actions,
  };
};

export default useSfaStore;
