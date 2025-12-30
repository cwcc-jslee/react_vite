// src/shared/components/ui/layout/BreadcrumbWithMenu.jsx
/**
 * 브레드크럼과 페이지별 메뉴를 포함하는 컴포넌트
 * 리팩토링: 새로운 Navigation 컴포넌트 사용 (2단 레이아웃)
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changePageMenu,
  changeSubMenu,
} from '../../../../store/slices/uiSlice';
import { setCurrentPath } from '../../../../store/slices/pageStateSlice';
import { resetForm } from '../../../../store/slices/pageFormSlice';
import { resetFilters, clearChartFilters } from '../../../../store/slices/projectSlice';
import { PAGE_SUB_MENUS } from '../../../constants/navigation';
import {
  hasMenuItemPermission,
  hasSubMenuPermission,
} from '../../../utils/permissionUtils';

// 새로운 Navigation 컴포넌트
import { PageMenuBar } from './components/index.js';

const BreadcrumbWithMenu = ({
  currentPage = '',
  pageMenus = {},
  activeMenu = 'default',
  subMenu = {},
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 현재 페이지의 메뉴 항목들을 배열로 변환하고 visible 속성 + 권한으로 필터링
  const currentPageMenus =
    currentPage && pageMenus[currentPage]?.items
      ? Object.entries(pageMenus[currentPage].items)
          .filter(([key, value]) => {
            // UI 레벨 visible 체크
            if (value.visible === false) return false;

            // 백엔드 권한 체크
            return hasMenuItemPermission(
              user?.user?.user_access_control,
              currentPage,
              key,
            );
          })
          .map(([key, value]) => ({
            key: key,
            label: value.label,
          }))
      : [];

  // 현재 활성화된 하위 메뉴 그룹 가져오기 + 권한 필터링
  let currentSubMenus = [];
  const subMenuActive = subMenu && Object.keys(subMenu).length > 0;
  const subMenuKey = subMenu.key;
  const activeSubMenu = subMenu.menu;

  if (subMenuActive && subMenuKey && PAGE_SUB_MENUS[subMenuKey]) {
    currentSubMenus = Object.entries(PAGE_SUB_MENUS[subMenuKey].items)
      .filter(([key, value]) => {
        // UI 레벨 visible 체크
        if (value.visible === false) return false;

        // 백엔드 권한 체크
        return hasSubMenuPermission(
          user?.user?.user_access_control,
          currentPage,
          activeMenu,
          key,
        );
      })
      .map(([key, value]) => ({
        key: key,
        label: value.label,
        icon: value.icon,
      }));
  }

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuId) => {
    const currentMenu = pageMenus[currentPage]?.items[menuId];
    console.log(`메뉴 클릭: ${menuId}`, currentMenu);

    // 페이지 메뉴 변경 시 상태 초기화
    dispatch(setCurrentPath(currentPage));
    dispatch(resetForm());

    // 프로젝트 페이지인 경우 필터 초기화
    if (currentPage === 'project') {
      dispatch(resetFilters());
      dispatch(clearChartFilters());
    }

    // UI 메뉴 변경
    dispatch(
      changePageMenu({
        menuId,
        config: currentMenu.config || {},
      }),
    );
  };

  // 하위 메뉴 클릭 핸들러
  const handleSubMenuClick = (subMenuId) => {
    // 프로젝트 페이지의 서브 메뉴 이동 시 필터 초기화
    if (currentPage === 'project') {
      dispatch(resetFilters());
      dispatch(clearChartFilters());
    }

    dispatch(changeSubMenu({ subMenuId }));
  };

  return (
    <div className="bg-white">
      {/* 페이지 메뉴 + 서브 메뉴 */}
      <PageMenuBar
        menus={currentPageMenus}
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        subMenus={currentSubMenus}
        activeSubMenu={activeSubMenu}
        onSubMenuClick={handleSubMenuClick}
      />
    </div>
  );
};

export default BreadcrumbWithMenu;
