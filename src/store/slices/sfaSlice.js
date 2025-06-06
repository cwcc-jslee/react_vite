/**
 * SFA 페이지 데이터 관리
 * - 폼 상태 관리
 */
import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  FORM_INITIAL_STATE,
} from '../../features/sfa/constants/initialState';

// SFA 초기 상태
const initialState = {
  // 폼 상태
  form: { ...FORM_INITIAL_STATE },
  // 페이지네이션
  pagination: { ...DEFAULT_PAGINATION },
  // 필터
  filters: { ...DEFAULT_FILTERS },
};

const sfaSlice = createSlice({
  name: 'sfa',
  initialState,
  reducers: {
    // 폼 필드 업데이트
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.form.data[name] = value;

      // 에러 초기화
      if (state.form.errors[name]) {
        state.form.errors[name] = null;
      }
    },

    // 폼 초기화
    resetForm: (state) => {
      state.form = { ...FORM_INITIAL_STATE };
    },

    // 폼 데이터 일괄 업데이트
    initializeFormData: (state, action) => {
      state.form.data = {
        ...state.form.data,
        ...action.payload,
      };
      state.form.errors = {};
    },

    // 폼 오류 상태 설정
    setFormErrors: (state, action) => {
      state.form.errors = action.payload;
    },

    // 폼 제출 상태 설정
    setFormSubmitting: (state, action) => {
      state.form.isSubmitting = action.payload;
    },

    // 폼 유효성 검사 상태 설정
    setFormIsValid: (state, action) => {
      state.form.isValid = action.payload;
    },
  },
});

export const {
  updateFormField,
  setFormErrors,
  setFormSubmitting,
  resetForm,
  initializeFormData,
  setFormIsValid,
} = sfaSlice.actions;

export default sfaSlice.reducer;
