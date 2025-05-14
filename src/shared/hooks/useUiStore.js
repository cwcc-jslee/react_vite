/**
 * @file useUiStore.js
 * @description 전역 UI 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. 페이지 레이아웃 관리 (페이지, 메뉴, 서브메뉴, 레이아웃 타입)
 * 2. 드로어 상태 관리 (표시 여부, 타입, 모드, 데이터)
 * 3. 섹션 및 컴포넌트 가시성 관리
 */

import { useSelector, useDispatch } from 'react-redux';
import {
  changePage,
  setPageLayout,
  setLayout,
  updateSections,
  setDrawer,
  closeDrawer,
  setActiveMenu,
  changePageMenu,
  changeSubMenu,
} from '../../store/slices/uiSlice';

/**
 * UI 관련 상태와 액션을 관리하는 커스텀 훅
 * 페이지 레이아웃, 드로어, 섹션, 컴포넌트 상태 등을 통합 관리
 */
export const useUiStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const pageLayout = useSelector((state) => state.ui.pageLayout);
  const drawer = useSelector((state) => state.ui.drawer);

  // 액션 핸들러
  const actions = {
    // 페이지 변경
    page: {
      change: (config) => {
        dispatch(changePage(config));
      },
      setLayout: (config) => {
        dispatch(setPageLayout(config));
      },
      setLayoutType: (layoutType) => {
        dispatch(setLayout(layoutType));
      },
    },

    // 섹션 관리
    section: {
      update: (sections) => {
        dispatch(updateSections(sections));
      },
    },

    // 드로어 관리
    drawer: {
      open: (config) => {
        dispatch(
          setDrawer({
            visible: true,
            ...config,
          }),
        );
      },
      close: () => {
        dispatch(closeDrawer());
      },
      update: (config) => {
        dispatch(setDrawer(config));
      },
    },

    // 메뉴 관리
    menu: {
      setActive: (menuId) => {
        dispatch(setActiveMenu(menuId));
      },
      change: (config) => {
        dispatch(changePageMenu(config));
      },
      changeSub: (subMenuId) => {
        dispatch(changeSubMenu({ subMenuId }));
      },
    },
  };

  return {
    // 상태
    pageLayout,
    drawer,

    // 액션
    actions,
  };
};

export default useUiStore;
