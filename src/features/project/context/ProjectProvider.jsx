/**
 * Project 컨텍스트 및 Provider 컴포넌트
 * - Project 데이터 및 UI 상태 관리
 * - 전역 상태 관리 및 데이터 공유
 *
 * @date 25.03.25
 * @version 1.0.0
 * @filename src/features/project/context/ProjectProvider.jsx
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { projectApiService } from '../services/projectApiService';

const ProjectContext = createContext(null);

/**
 * 프로젝트 Context Hook
 */
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

/**
 * Project Provider 컴포넌트
 */
export const ProjectProvider = ({ children }) => {
  // 데이터 상태
  const [fetchData, setFetchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 레이아웃 상태
  const [pageLayout, setPageLayout] = useState({
    mode: 'default',
    components: {
      projectTable: true,
      projectAddSection: false,
      //   forecastTable: false,
    },
  });

  // 드로어 상태
  const [drawerState, setDrawerState] = useState({
    visible: false,
    baseMode: null,
    subMode: null,
    data: null,
  });

  // 활성 메뉴 ID
  const [activeMenu, setActiveMenu] = useState('default');

  // 현재 활성 메뉴의 상태만 관리 (다른 메뉴 상태는 저장하지 않음)
  const [currentMenuState, setCurrentMenuState] = useState(null);

  // 메뉴 구성 정의
  const menuConfigs = {
    default: {
      title: '현황',
      layoutMode: 'default',
      components: {
        projectTable: true,
        projectAddSection: false,
      },
      hasState: false,
    },
    addProject: {
      title: '등록',
      layoutMode: 'addProject',
      components: {
        projectTable: false,
        projectAddSection: true,
      },
      hasState: true,
      initialState: {
        // customer: '',
        sfa: null,
        template: null,
      },
    },
    // 다른 메뉴 정의...
  };

  /**
   * 메뉴 변경 함수 - 메뉴 변경 시 상태 완전 초기화
   * @param {string} menuId - 활성화할 메뉴 ID
   */
  const changeMenu = useCallback((menuId) => {
    if (!menuConfigs[menuId]) {
      console.error(`Invalid menu ID: ${menuId}`);
      return;
    }

    const config = menuConfigs[menuId];

    // 활성 메뉴 업데이트
    setActiveMenu(menuId);

    // 레이아웃 컴포넌트 설정
    setPageLayout({
      mode: config.layoutMode,
      components: config.components,
    });

    // 메뉴에 상태가 필요하면 초기 상태로 설정, 아니면 null
    setCurrentMenuState(config.hasState ? config.initialState : null);
  }, []);

  /**
   * 현재 메뉴 상태 업데이트 함수
   * @param {Object} updates - 업데이트할 상태 객체
   */
  const updateMenuState = useCallback(
    (updates) => {
      if (!currentMenuState) {
        console.warn('Current menu has no state to update');
        return;
      }

      setCurrentMenuState((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [currentMenuState],
  );

  /**
   * 현재 활성 메뉴의 상태 초기화
   */
  // const resetActiveMenuState = useCallback(() => {
  //   // const activeMenu = menuSystem.activeMenu;
  //   const config = menuConfigs[activeMenu];

  //   // 현재 메뉴가 상태를 가지지 않으면 무시
  //   if (!config.hasState) return;

  //   // 메뉴 상태 초기화
  //   setMenuSystem((prev) => ({
  //     ...prev,
  //     menuStates: {
  //       ...prev.menuStates,
  //       [activeMenu]: config.initialState,
  //     },
  //   }));
  // }, [menuSystem.activeMenu]);

  /**
   * 현재 활성 메뉴의 상태 조회
   * @returns {Object|null} 현재 메뉴 상태 또는 null
   */
  // const getActiveMenuState = useCallback(() => {
  //   // const activeMenu = menuSystem.activeMenu;
  //   return menuConfigs[activeMenu].hasState
  //     ? menuSystem.menuStates[activeMenu]
  //     : null;
  // }, [menuSystem.activeMenu, menuSystem.menuStates]);

  /**
   * 페이지 변경 처리
   */
  const setPage = (page) => {
    console.group('ProjectProvider - setPage');
    console.log('Current:', pagination.current, 'New:', page);

    setPagination((prev) => ({
      ...prev,
      current: Number(page),
    }));

    console.groupEnd();
  };

  /**
   * 페이지 크기 변경 처리
   */
  const setPageSize = (newSize) => {
    console.group('ProjectProvider - setPageSize');
    console.log('Current:', pagination.pageSize, 'New:', newSize);

    setPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: Number(newSize),
    }));

    console.groupEnd();
  };

  const setPageTotalSize = (size) => {
    console.group('ProjectProvider - setPageTotalSize');
    console.log('Totalsize:', pagination.total, 'New:', size);

    setPagination((prev) => ({
      ...prev,
      total: Number(size),
    }));

    console.groupEnd();
  };

  // 기존 레이아웃 함수 수정 - 메뉴 상태와 연동
  // const setLayout = useCallback(
  //   (mode) => {
  //     // 레이아웃 변경
  //     setPageLayout(layoutModes[mode] || layoutModes.default);

  //     // 레이아웃에 해당하는 메뉴로 자동 전환
  //     const layoutToMenuMap = {
  //       default: 'status',
  //       projectadd: 'register',
  //       search: 'search',
  //       participation: 'participation',
  //     };

  //     const menuId = layoutToMenuMap[mode];
  //     if (menuId && menuId !== activeMenu) {
  //       // 메뉴 ID가 있고 현재 활성 메뉴와 다르면 메뉴 변경
  //       setActiveMenu(menuId);

  //       // 메뉴에 상태가 필요하면 초기화
  //       const menuDef = menuDefinitions[menuId];
  //       if (menuDef && menuDef.needsState) {
  //         setMenuState(menuDef.initialState);
  //       } else {
  //         setMenuState(null);
  //       }
  //     }
  //   },
  //   [activeMenu],
  // );

  /**
   * 드로어 관련 함수들
   */
  const setDrawer = (update) => {
    setDrawerState((prev) => ({
      ...prev,
      ...update,
    }));
  };

  const setDrawerClose = () => {
    setDrawerState({
      visible: false,
      controlMode: null,
      featureMode: null,
      data: null,
    });
  };

  /**
   * Project 목록 조회
   * @param {Object} queryParams - 추가 파라미터 (선택사항)
   */
  const fetchProjectList = useCallback(
    async (customParams = {}) => {
      console.log(`>>queryParams : `, customParams);
      setLoading(true);
      try {
        const queryParams = {
          pagination: {
            current: customParams.pagination?.current || pagination.current,
            pageSize: customParams.pagination?.pageSize || pagination.pageSize,
          },
        };
        // API 호출
        const response = await projectApiService.getProjectList(queryParams);

        // 데이터 업데이트
        setFetchData(response.data);

        // 페이지네이션 정보 업데이트
        if (pagination.total !== response.meta.pagination.total) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.pagination.total,
          }));
        }

        // 에러 상태 초기화
        setError(null);

        return response.data;
      } catch (err) {
        // 에러 처리
        const errorMessage = err.response?.data?.error?.message || err.message;
        setError(errorMessage);
        setFetchData([]);
        // return [];
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize],
  );

  // 초기 데이터 로드
  React.useEffect(() => {
    console.log('Initial data loading');
    fetchProjectList();
  }, [fetchProjectList]);

  const value = {
    // 기본 데이터 상태
    fetchData,
    loading,
    error,
    pagination,
    setPage,
    setPageSize,
    setPageTotalSize,
    setError,

    // 레이아웃 관련
    pageLayout,
    // setLayout,

    // 드로어 관련
    drawerState,
    setDrawer,
    setDrawerClose,

    // 메뉴 상태 관리 함수
    activeMenu,
    menuState: currentMenuState,
    changeMenu,
    updateMenuState,
    menuConfigs,

    // 데이터 관리 함수
    setLoading,
    setFetchData,
    // fetchProjectList,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
