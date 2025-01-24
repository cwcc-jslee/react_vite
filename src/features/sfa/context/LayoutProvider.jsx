// src/features/sfa/contexts/LayoutProvider.jsx
// 구조개선(25.01.24)
import React, { createContext, useContext, useState } from 'react';

// Context 생성
const LayoutContext = createContext(null);

/**
 * 레이아웃 관리를 위한 커스텀 훅
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};

/**
 * 레이아웃 관리를 위한 Provider 컴포넌트
 */
export const LayoutProvider = ({ children }) => {
  // 페이지 레이아웃 상태
  const [pageLayout, setPageLayout] = useState({
    mode: 'default',
    components: {
      monthlyStatus: true,
      sfaTable: true,
      searchForm: false,
      forecastTable: false,
    },
  });

  // 드로어 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    controlMode: null,
    featureMode: null,
    data: null,
  });

  /**
   * 레이아웃 모드 변경
   * @param {string} mode - 레이아웃 모드
   */
  const setLayout = (mode) => {
    const layouts = {
      default: {
        mode: 'default',
        components: {
          monthlyStatus: true,
          sfaTable: true,
          searchForm: false,
          forecastTable: false,
        },
      },
      search: {
        mode: 'search',
        components: {
          monthlyStatus: false,
          sfaTable: true,
          searchForm: true,
          forecastTable: false,
        },
      },
      forecast: {
        mode: 'forecast',
        components: {
          monthlyStatus: false,
          sfaTable: false,
          searchForm: false,
          forecastTable: true,
        },
      },
    };

    setPageLayout(layouts[mode] || layouts.default);
  };

  /**
   * 드로어 상태 변경
   * @param {Object} update - 업데이트할 드로어 상태
   */
  const setDrawer = (update) => {
    setDrawerState((prev) => ({
      ...prev,
      ...update,
    }));
  };

  /**
   * 드로어 닫기
   */
  const setDrawerClose = () => {
    setDrawerState({
      visible: false,
      controlMode: null,
      featureMode: null,
      data: null,
    });
  };

  // 컨텍스트 값
  const value = {
    pageLayout,
    drawerState,
    setLayout,
    setDrawer,
    setDrawerClose,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};
