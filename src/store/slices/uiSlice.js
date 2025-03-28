// src/store/slices/uiSlice.js
/**
 * 전역 UI 상태 관리 슬라이스
 * - 레이아웃, 드로어, 활성 메뉴 상태 관리
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 레이아웃 상태
  pageLayout: {
    mode: 'default',
    components: {
      // 페이지별 컴포넌트 - project
      projectTable: true,
      projectAddSection: false,
    },
  },

  // 드로어 상태
  drawer: {
    visible: false,
    baseMode: null,
    subMode: null,
    data: null,
  },

  // 각 페이지별 활성 메뉴
  activeMenu: {
    project: 'default',
    sfa: 'default',
    work: 'default',
    customer: 'default',
  },

  // 페이지별 메뉴 상태 저장 (각 메뉴가 가진 상태값)
  menuState: {
    project: {
      default: null,
      addProject: {
        customer: null,
        sfa: null,
        template: null,
      },
    },
    sfa: {
      default: null,
      addSfa: {
        customer: null,
        // sfa 관련 상태들...
      },
    },
    // 다른 페이지들...
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * 레이아웃 모드 변경
     */
    setPageLayout: (state, action) => {
      const { mode, components } = action.payload;
      state.pageLayout.mode = mode;

      if (components) {
        state.pageLayout.components = {
          ...state.pageLayout.components,
          ...components,
        };
      }
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
        visible: false,
        baseMode: null,
        subMode: null,
        data: null,
      };
    },

    /**
     * 활성 메뉴 변경
     */
    setActiveMenu: (state, action) => {
      const { page, menuId } = action.payload;
      state.activeMenu[page] = menuId;
    },

    /**
     * 메뉴 상태 업데이트
     */
    updateMenuState: (state, action) => {
      const { page, menuId, updates } = action.payload;

      // 해당 페이지와 메뉴의 상태가 없으면 초기화
      if (!state.menuState[page][menuId]) {
        state.menuState[page][menuId] = {};
      }

      // 상태 업데이트
      state.menuState[page][menuId] = {
        ...state.menuState[page][menuId],
        ...updates,
      };
    },

    /**
     * 메뉴 변경 시 전체 UI 상태 업데이트
     * (메뉴에 따른 레이아웃, 드로어 등 변경)
     */
    changePageMenu: (state, action) => {
      const { page, menuId, config } = action.payload;

      // 활성 메뉴 업데이트
      state.activeMenu[page] = menuId;

      // 레이아웃 업데이트
      if (config.components) {
        state.pageLayout.mode = config.layoutMode || 'default';
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

      // 메뉴 상태 초기화 (필요한 경우)
      if (config.hasState && config.initialState) {
        state.menuState[page][menuId] = {
          ...config.initialState,
        };
      }
    },
  },
});

export const {
  setPageLayout,
  setDrawer,
  closeDrawer,
  setActiveMenu,
  updateMenuState,
  changePageMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
