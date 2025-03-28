/**
 * 페이지별 메뉴 상태 관리를 위한 Redux 슬라이스
 * - 모든 페이지의 메뉴 상태를 중앙에서 관리
 * - UI 일관성 유지 및 페이지 간 상태 공유
 *
 * @date 25.03.24
 * @version 1.0.0
 * @filename src/store/slices/pageMenuSlice.js
 */
import { createSlice } from '@reduxjs/toolkit';

// 각 페이지별 기본 메뉴 구성 정보
const PAGE_MENUS = {
  // 프로젝트 페이지 메뉴
  project: {
    menus: {
      default: {
        label: '현황',
        config: {
          title: '현황',
          layoutMode: 'default',
          components: {
            projectTable: true,
            projectAddSection: false,
          },
          hasState: false,
        },
      },
      addProject: {
        label: '등록',
        config: {
          title: '등록',
          layoutMode: 'addProject',
          components: {
            projectTable: false,
            projectAddSection: true,
          },
          hasState: true,
          initialState: {
            sfa: null,
            template: null,
            customer: null,
          },
        },
      },
    },
    default: 'default',
  },
  // 고객사 페이지 메뉴
  customer: {
    menus: {
      view: {
        label: '고객사 현황',
        config: {
          title: '고객사 현황',
          layoutMode: 'view',
          components: {
            customerTable: true,
            customerDetail: false,
          },
        },
      },
      add: {
        label: '고객사 등록',
        config: {
          title: '고객사 등록',
          layoutMode: 'add',
          components: {
            customerTable: false,
            customerDetail: true,
          },
        },
      },
    },
    default: 'view',
  },
  // SFA 페이지 메뉴
  sfa: {
    menus: {
      list: {
        label: '매출 목록',
        config: {
          title: '매출 목록',
          components: {
            sfaList: true,
            sfaDetail: false,
          },
        },
      },
      create: {
        label: '매출 등록',
        config: {
          title: '매출 등록',
          components: {
            sfaList: false,
            sfaDetail: true,
          },
        },
      },
      analysis: {
        label: '매출 분석',
        config: {
          title: '매출 분석',
          components: {
            sfaList: false,
            sfaDetail: false,
            sfaAnalysis: true,
          },
        },
      },
    },
    default: 'list',
  },
};

// 페이지별 활성 메뉴와 상태 초기화
const initialActiveMenu = Object.keys(PAGE_MENUS).reduce((acc, page) => {
  acc[page] = PAGE_MENUS[page].default;
  return acc;
}, {});

// 페이지별 메뉴 상태 초기화
const initialMenuState = Object.keys(PAGE_MENUS).reduce((acc, page) => {
  acc[page] = {};

  Object.keys(PAGE_MENUS[page].menus).forEach((menuId) => {
    const menu = PAGE_MENUS[page].menus[menuId];
    if (menu.config.hasState && menu.config.initialState) {
      acc[page][menuId] = { ...menu.config.initialState };
    }
  });

  return acc;
}, {});

const initialState = {
  // 페이지별 메뉴 구성 정보
  pageMenus: PAGE_MENUS,

  // 페이지별 현재 활성화된 메뉴
  activeMenu: initialActiveMenu,

  // 페이지별 메뉴 상태
  menuState: initialMenuState,

  // 현재 페이지 레이아웃 구성
  pageLayout: {
    title: '',
    layoutMode: 'default',
    components: {},
  },
};

const pageMenuSlice = createSlice({
  name: 'pageMenu',
  initialState,
  reducers: {
    /**
     * 페이지 메뉴 변경
     * @param {Object} state - 현재 상태
     * @param {Object} action - { page, menuId }
     */
    changePageMenu: (state, action) => {
      const { page, menuId } = action.payload;

      if (state.pageMenus[page] && state.pageMenus[page].menus[menuId]) {
        // 활성 메뉴 업데이트
        state.activeMenu[page] = menuId;

        // 페이지 레이아웃 업데이트
        const config = state.pageMenus[page].menus[menuId].config;
        state.pageLayout = {
          title: config.title || '',
          layoutMode: config.layoutMode || 'default',
          components: config.components || {},
        };

        // 메뉴 상태가 없으면 초기화
        if (
          config.hasState &&
          config.initialState &&
          !state.menuState[page][menuId]
        ) {
          state.menuState[page][menuId] = { ...config.initialState };
        }
      }
    },

    /**
     * 메뉴 상태 업데이트
     * @param {Object} state - 현재 상태
     * @param {Object} action - { page, menuId, updates }
     */
    updateMenuState: (state, action) => {
      const { page, menuId, updates } = action.payload;

      if (state.menuState[page] && state.menuState[page][menuId]) {
        state.menuState[page][menuId] = {
          ...state.menuState[page][menuId],
          ...updates,
        };
      } else {
        // 메뉴 상태가 없으면 새로 생성
        if (!state.menuState[page]) {
          state.menuState[page] = {};
        }
        state.menuState[page][menuId] = { ...updates };
      }
    },

    /**
     * 메뉴 상태 초기화
     * @param {Object} state - 현재 상태
     * @param {Object} action - { page, menuId }
     */
    resetMenuState: (state, action) => {
      const { page, menuId } = action.payload;

      if (
        state.pageMenus[page] &&
        state.pageMenus[page].menus[menuId] &&
        state.pageMenus[page].menus[menuId].config.initialState
      ) {
        state.menuState[page][menuId] = {
          ...state.pageMenus[page].menus[menuId].config.initialState,
        };
      }
    },
  },
});

export const { changePageMenu, updateMenuState, resetMenuState } =
  pageMenuSlice.actions;

export default pageMenuSlice.reducer;
