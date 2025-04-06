// src/store/slices/pageFormSlice.js
/**
 * 페이지 폼 상태 관리를 위한 Redux 슬라이스
 * 각 페이지의 폼 상태(데이터, 에러, 제출 상태 등)를 관리합니다.
 * 페이지 간 이동 시 폼 상태 초기화는 pageStateSlice의 currentPath를 사용합니다.
 */

import { createSlice } from '@reduxjs/toolkit';

// 초기 상태 정의
const initialState = {
  data: {}, // 폼 데이터
  errors: {}, // 폼 에러
  isSubmitting: false, // 제출 상태
  mode: 'create', // 폼 모드 (create, edit)
  isValid: true, // 유효성 검사 상태
  editingId: null, // 현재 편집 중인 항목 ID
  // 폼 초기화 여부 - 폼이 초기 데이터로 로드되었는지 여부를 추적 (폼 렌더링 최적화에 사용)
  isInitialized: false,
  // 폼 변경 여부 - 사용자가 폼을 변경했는지 여부를 추적 (저장하지 않고 나가기 전 경고 표시에 사용)
  isDirty: false,
};

/**
 * 폼 데이터 전처리 유틸리티 함수
 * 빈 값 및 임시 데이터 제거
 * @param {Object} data - 원본 폼 데이터
 * @returns {Object} 처리된 데이터
 */
export const prepareFormData = (data) => {
  // 깊은 복사로 원본 데이터 유지
  const clonedData = JSON.parse(JSON.stringify(data));

  // 불필요한 임시 필드 제거
  const { __temp, ...cleanData } = clonedData;

  // null이나 빈 문자열인 경우 해당 키 삭제
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === '' || cleanData[key] === null) {
      delete cleanData[key];
    }
  });

  return cleanData;
};

const pageFormSlice = createSlice({
  name: 'pageForm',
  initialState,
  reducers: {
    // 폼 초기화 (생성 또는 수정 시작 시 호출)
    initForm: (state, action) => {
      const {
        data = { pjtStatus: 86, importanceLevel: 121 },
        mode = 'create',
        id = null,
      } = action.payload || {};

      state.data = data;
      state.mode = mode;
      state.editingId = id;
      state.errors = {};
      state.isSubmitting = false;
      state.isValid = true;
      state.isInitialized = true; // 폼이 초기화됨을 표시
      state.isDirty = false; // 폼이 변경되지 않음을 표시
    },

    // 폼 완전 초기화
    resetForm: (state) => {
      state.data = { pjtStatus: 86, importanceLevel: 121 };
      state.errors = {};
      state.isSubmitting = false;
      state.mode = 'create';
      state.isValid = true;
      state.editingId = null;
      state.isInitialized = false; // 폼이 초기화되지 않음을 표시
      state.isDirty = false; // 폼이 변경되지 않음을 표시
    },

    // 제출 상태 설정
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },

    // 폼 필드 업데이트 - 개선된 구조
    updateFormField: (state, action) => {
      const { name, value } = action.payload;

      // 중첩된 객체 경로 지원 (예: 'customer.name')
      if (name.includes('.')) {
        const keys = name.split('.');
        let current = state.data;

        // 마지막 키를 제외한 모든 키에 대해 객체 경로 생성
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // 경로가 없으면 빈 객체 생성
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        // 마지막 키에 값 할당
        current[keys[keys.length - 1]] = value;
      } else {
        // 단일 키 업데이트
        state.data[name] = value;
      }

      // 에러 초기화
      if (state.errors[name]) {
        state.errors[name] = null;
      }

      // 폼 변경 상태 업데이트
      state.isDirty = true; // 폼이 변경됨을 표시
    },

    // 여러 폼 필드 한번에 업데이트
    updateFormFields: (state, action) => {
      state.data = {
        ...state.data,
        ...action.payload,
      };

      // 업데이트된 필드에 대한 에러 초기화
      Object.keys(action.payload).forEach((key) => {
        if (state.errors[key]) {
          state.errors[key] = null;
        }
      });

      // 폼 변경 상태 업데이트
      state.isDirty = true; // 폼이 변경됨을 표시
    },

    // 에러 설정
    setFormErrors: (state, action) => {
      state.errors = { ...state.errors, ...action.payload };

      // 에러가 있는 경우 유효성 상태 업데이트
      state.isValid =
        Object.keys(state.errors).length === 0 ||
        Object.values(state.errors).every(
          (error) => error === null || error === undefined,
        );
    },

    // 에러 초기화
    clearFormErrors: (state) => {
      state.errors = {};
      state.isValid = true;
    },

    // 폼 모드 설정 (create, edit)
    setFormMode: (state, action) => {
      state.mode = action.payload;
    },

    // 폼 유효성 검사 상태 설정
    setFormValidity: (state, action) => {
      state.isValid = action.payload;
    },

    // 편집 중인 항목 ID 설정
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },

    // 폼 초기화 상태 설정
    setFormInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },

    // 폼 변경 상태 설정 (더티 상태)
    setFormDirty: (state, action) => {
      state.isDirty = action.payload;
    },

    // 폼 제출 시작
    submitFormStart: (state) => {
      state.isSubmitting = true;
    },

    // 폼 제출 성공
    submitFormSuccess: (state) => {
      state.isSubmitting = false;
      state.errors = {};
      state.isDirty = false; // 폼이 변경되지 않음을 표시
    },

    // 폼 제출 실패
    submitFormFailure: (state, action) => {
      state.isSubmitting = false;
      state.errors = {
        ...state.errors,
        ...(action.payload || { global: '알 수 없는 오류가 발생했습니다.' }),
      };
    },
  },
  // 비동기 액션 처리
  extraReducers: (builder) => {
    // 어떤 타입이든 addItem/pending 으로 끝나는 액션 처리
    builder
      .addMatcher(
        (action) => action.type.endsWith('/addItem/pending'),
        (state) => {
          state.isSubmitting = true;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/addItem/fulfilled'),
        (state) => {
          state.isSubmitting = false;
          state.data = {};
          state.errors = {};
          state.isDirty = false; // 폼이 변경되지 않음을 표시
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/addItem/rejected'),
        (state, action) => {
          state.isSubmitting = false;
          state.errors = {
            global: action.payload || '항목 생성 실패',
          };
        },
      )

      // 어떤 타입이든 updateItem/pending 으로 끝나는 액션 처리
      .addMatcher(
        (action) => action.type.endsWith('/updateItem/pending'),
        (state) => {
          state.isSubmitting = true;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/updateItem/fulfilled'),
        (state) => {
          state.isSubmitting = false;
          state.data = {};
          state.errors = {};
          state.mode = 'create';
          state.editingId = null;
          state.isDirty = false; // 폼이 변경되지 않음을 표시
        },
      )
      .addMatcher(
        (action) => action.type.endsWith('/updateItem/rejected'),
        (state, action) => {
          state.isSubmitting = false;
          state.errors = {
            global: action.payload || '항목 수정 실패',
          };
        },
      );
  },
});

export const {
  initForm,
  resetForm,
  setSubmitting,
  updateFormField,
  updateFormFields,
  setFormErrors,
  clearFormErrors,
  setFormMode,
  setFormValidity,
  setEditingId,
  setFormInitialized,
  setFormDirty,
  submitFormStart,
  submitFormSuccess,
  submitFormFailure,
} = pageFormSlice.actions;

// 유틸리티 선택자
export const selectFormData = (state) => state.pageForm.data;
export const selectFormErrors = (state) => state.pageForm.errors;
export const selectFormSubmitting = (state) => state.pageForm.isSubmitting;
export const selectFormMode = (state) => state.pageForm.mode;
export const selectFormValidity = (state) => state.pageForm.isValid;
export const selectEditingId = (state) => state.pageForm.editingId;
export const selectFormInitialized = (state) => state.pageForm.isInitialized;
export const selectFormDirty = (state) => state.pageForm.isDirty;

export default pageFormSlice.reducer;
