// src/shared/components/ui/layout/BreadcrumbWithMenu.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import {
  changePageMenu,
  changeSubMenu,
} from '../../../../store/slices/uiSlice';
import { setCurrentPath } from '../../../../store/slices/pageStateSlice';
import { resetForm } from '../../../../store/slices/pageFormSlice';
import { Breadcrumb } from './components';
import { PAGE_SUB_MENUS } from '../../../constants/navigation';

/**
 * 브레드크럼과 페이지별 메뉴를 포함하는 컴포넌트
 */
const BreadcrumbWithMenu = ({
  breadcrumbItems = [],
  currentPage = '',
  pageMenus = {},
  activeMenu = 'default',
  subMenu = {},
}) => {
  const dispatch = useDispatch();
  // const { subMenuActive, subMenuKey, subMenu } = useSelector(
  //   (state) => state.ui.pageLayout,
  // );

  // 현재 페이지의 메뉴 항목들을 배열로 변환하고 visible 속성으로 필터링
  const currentPageMenus =
    currentPage && pageMenus[currentPage]?.items
      ? Object.entries(pageMenus[currentPage].items)
          .filter(([_, value]) => value.visible !== false) // visible이 명시적으로 false가 아닌 항목만 포함
          .map(([key, value]) => ({
            key: key,
            label: value.label,
          }))
      : [];

  console.log('표시 가능한 페이지 메뉴 항목:', currentPageMenus);

  // 현재 활성화된 하위 메뉴 그룹 가져오기
  let currentSubMenus = [];
  const subMenuActive = subMenu && Object.keys(subMenu).length > 0;
  const subMenuKey = subMenu.key;
  const activeSubMenu = subMenu.menu; // table, board,
  if (subMenuActive && subMenuKey && PAGE_SUB_MENUS[subMenuKey]) {
    currentSubMenus = Object.entries(PAGE_SUB_MENUS[subMenuKey].items)
      .filter(([_, value]) => value.visible !== false)
      // .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
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
    dispatch(changeSubMenu({ subMenuId }));
  };

  // 메뉴 항목 존재 확인
  const hasMenuItems = currentPageMenus.length > 0;
  const hasSubMenuItems = currentSubMenus.length > 0;
  console.log(`표시 가능한 메뉴 항목 여부: ${hasMenuItems}`);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 px-4 bg-white">
      {/* 브레드크럼과 페이지별 메뉴를 같은 줄에 배치 */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0 w-full">
        <div className="mr-4 w-[150px]">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* 페이지별 메뉴 */}
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {hasMenuItems ? (
            currentPageMenus.map((menuInfo, index) => (
              <button
                key={menuInfo.key}
                onClick={() => handleMenuClick(menuInfo.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium 
                  ${
                    activeMenu === menuInfo.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {menuInfo.label}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-400">
              사용 가능한 메뉴가 없습니다
            </div>
          )}
        </div>

        {/* 하위 메뉴 (오른쪽 정렬) */}
        {hasSubMenuItems && (
          <div className="flex space-x-2 ml-auto border-l border-gray-200 pl-4">
            {currentSubMenus.map((subMenuItem) => (
              <button
                key={subMenuItem.key}
                onClick={() => handleSubMenuClick(subMenuItem.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center
                    ${
                      activeSubMenu === subMenuItem.key
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
              >
                {subMenuItem.icon && (
                  <span className="mr-1.5">{subMenuItem.icon}</span>
                )}
                {subMenuItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbWithMenu;
