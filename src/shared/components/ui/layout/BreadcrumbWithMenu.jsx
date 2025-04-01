// src/shared/components/ui/layout/BreadcrumbWithMenu.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { changePageMenu } from '../../../../store/slices/uiSlice';
import { Breadcrumb } from './components';

/**
 * 브레드크럼과 페이지별 메뉴를 포함하는 컴포넌트
 */
const BreadcrumbWithMenu = ({
  breadcrumbItems = [],
  currentPage = '',
  pageMenus = {},
  activeMenu = 'default',
}) => {
  const dispatch = useDispatch();

  // 디버깅을 위한 로그
  // console.log('BreadcrumbWithMenu props:', {
  //   currentPage,
  //   activeMenu,
  //   pageMenus,
  // });

  // 현재 페이지의 메뉴 항목들 (직접 접근)
  // const currentPageMenus =
  //   currentPage && pageMenus[currentPage]?.menus
  //     ? pageMenus[currentPage].menus
  //     : {};

  // 현재 페이지의 메뉴 항목 키들을 배열로 가져오기
  const currentPageMenus = pageMenus[currentPage]?.items
    ? Object.entries(pageMenus[currentPage].items).map(([key, value]) => ({
        key: key,
        label: value.label,
      }))
    : [];

  console.log('현재 페이지 메뉴 항목:', currentPageMenus);

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuId) => {
    const currentMenu = pageMenus[currentPage]?.items[menuId];
    console.log(`메뉴 클릭: ${menuId}`, currentMenu);
    console.log('현재 페이지 메뉴 항목:', currentPageMenus);

    dispatch(
      changePageMenu({
        menuId,
        config: currentMenu.config || {},
      }),
    );
  };

  // 메뉴 항목 존재 확인
  const hasMenuItems = Object.keys(currentPageMenus).length > 0;
  console.log(`메뉴 항목 존재 여부: ${hasMenuItems}`);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 px-4 bg-white">
      {/* 브레드크럼 */}
      <div className="mb-2 sm:mb-0">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* 페이지별 메뉴 */}
      <div className="flex space-x-2">
        {hasMenuItems ? (
          Object.entries(currentPageMenus).map(([index, menuInfo]) => (
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
    </div>
  );
};

export default BreadcrumbWithMenu;
