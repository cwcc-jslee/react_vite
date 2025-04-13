// src/store/slices/uiSlice.js
/**
 * 전역 UI 상태 관리 슬라이스
 * - 레이아웃, 드로어, 활성 메뉴, 섹션 상태를 통합적으로 관리
 * - 컨테이너 > 레이아웃 > 섹션 > 컴포넌트 계층 구조를 지원
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 레이아웃 상태
  pageLayout: {
    page: null, // 현재 페이지 (ex: 'project', 'sfa')
    menu: 'default', // 현재 활성화된 메뉴
    layout: null, // 현재 레이아웃 타입 (ex: 'list', 'detail', 'add')
    sections: {}, // 섹션 표시 상태 (계층적 구조의 중간 레벨)
    components: {}, // 개별 컴포넌트 표시 상태 (최하위 레벨)
  },

  // 드로어 상태
  drawer: {
    visible: false, // 드로어 표시 여부
    type: null, // 드로어 유형 (예: 'filter', 'detail', 'form')
    mode: null, // 드로어 모드 (예: 'create', 'edit', 'view')
    data: null, // 필요한 데이터
    options: {}, // 추가 옵션 subMode 설정
    width: 'md', // 드로어 너비 (xs, sm, md, lg, xl)
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * 페이지 변경 시 호출
     * 페이지 정보와 해당 페이지의 기본 섹션/컴포넌트/레이아웃 설정
     */
    changePage: (state, action) => {
      const {
        page,
        defaultSections = {},
        defaultComponents = {},
        defaultMenu = 'default',
        defaultLayout = 'list',
      } = action.payload;

      state.pageLayout.page = page;
      state.pageLayout.sections = defaultSections;
      state.pageLayout.components = defaultComponents;
      state.pageLayout.menu = defaultMenu;
      state.pageLayout.layout = defaultLayout;
    },

    /**
     * 레이아웃 모드 변경
     */
    setPageLayout: (state, action) => {
      const { layout, mode, sections, components } = action.payload;

      if (layout) {
        state.pageLayout.layout = layout;
      }

      if (mode) {
        state.pageLayout.mode = mode;
      }

      if (sections) {
        state.pageLayout.sections = {
          ...state.pageLayout.sections,
          ...sections,
        };
      }

      if (components) {
        state.pageLayout.components = {
          ...state.pageLayout.components,
          ...components,
        };
      }
    },

    /**
     * 레이아웃 타입 변경
     */
    setLayout: (state, action) => {
      state.pageLayout.layout = action.payload;
    },

    /**
     * 섹션 가시성 상태 업데이트
     */
    updateSections: (state, action) => {
      state.pageLayout.sections = {
        ...state.pageLayout.sections,
        ...action.payload,
      };
    },

    /**
     * 드로어 상태 변경
     */
    setDrawer: (state, action) => {
      state.drawer = {
        ...state.drawer,
        ...action.payload,
      };
    },

    /**
     * 드로어 닫기
     */
    closeDrawer: (state) => {
      state.drawer = {
        visible: false, // 드로어 표시 여부
        type: null, // 드로어 유형 (예: 'filter', 'detail', 'form')
        mode: null, // 드로어 모드 (예: 'create', 'edit', 'view')
        data: null, // 필요한 데이터
        options: {}, // 추가 옵션 subMode 설정
        width: 'md', // 드로어 너비 (xs, sm, md, lg, xl)
      };
    },

    /**
     * 현재 페이지의 활성 메뉴 변경
     */
    setActiveMenu: (state, action) => {
      state.pageLayout.menu = action.payload;
    },

    /**
     * 메뉴 변경 시 전체 UI 상태 업데이트
     * (메뉴에 따른 레이아웃, 섹션, 컴포넌트, 드로어 등 변경)
     */
    changePageMenu: (state, action) => {
      const { menuId, config } = action.payload;

      // 활성 메뉴 업데이트
      state.pageLayout.menu = menuId;

      // 레이아웃 업데이트
      if (config.layout) {
        state.pageLayout.layout = config.layout;
      }

      // 섹션 업데이트
      if (config.sections) {
        state.pageLayout.sections = {
          ...state.pageLayout.sections,
          ...config.sections,
        };
      }

      // 컴포넌트 업데이트
      if (config.components) {
        state.pageLayout.components = {
          ...state.pageLayout.components,
          ...config.components,
        };
      }

      // 드로어 상태 업데이트
      if (config.drawer) {
        state.drawer = {
          ...state.drawer,
          ...config.drawer,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // pageState와 pageForm 슬라이스와 연동
    builder
      // 메뉴가 변경될 때마다 pageState와 pageForm 초기화
      .addCase('pageState/setCurrentPath', (state, action) => {
        // 페이지 상태 리셋 처리
        console.log('페이지 상태 초기화: ', action.payload);
      })
      .addCase('pageForm/resetForm', (state, action) => {
        // 폼 상태 리셋 처리
        console.log('폼 상태 초기화 완료');
      });
  },
});

export const {
  changePage,
  setPageLayout,
  setLayout,
  updateSections,
  setDrawer,
  closeDrawer,
  setActiveMenu,
  changePageMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
