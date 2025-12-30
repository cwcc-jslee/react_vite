// src/shared/layout/components/Navigation/PageMenuBar.jsx
import React from 'react';
import PageMenu from './PageMenu';
import SubMenuBar from './SubMenuBar';

/**
 * 페이지 메뉴 바 (2단 레이아웃의 두 번째 줄)
 * @param {Array} menus - 페이지 메뉴 배열
 * @param {string} activeMenu - 활성 메뉴 ID
 * @param {function} onMenuClick - 메뉴 클릭 핸들러
 * @param {Array} subMenus - 서브 메뉴 배열 (선택사항)
 * @param {string} activeSubMenu - 활성 서브 메뉴 ID
 * @param {function} onSubMenuClick - 서브 메뉴 클릭 핸들러
 */
const PageMenuBar = ({
  menus = [],
  activeMenu,
  onMenuClick,
  subMenus = [],
  activeSubMenu,
  onSubMenuClick,
}) => {
  const hasMenus = menus.length > 0;
  const hasSubMenus = subMenus.length > 0;

  return (
    <div className="px-6 py-3 bg-white flex items-center justify-between">
      {/* 페이지 메뉴 */}
      <div className="flex gap-2">
        {hasMenus ? (
          menus.map((menu) => (
            <PageMenu
              key={menu.key}
              active={activeMenu === menu.key}
              onClick={() => onMenuClick(menu.key)}
              icon={menu.icon}
            >
              {menu.label}
            </PageMenu>
          ))
        ) : (
          <div className="text-sm text-gray-400">
            사용 가능한 메뉴가 없습니다
          </div>
        )}
      </div>

      {/* 서브 메뉴 */}
      {hasSubMenus && (
        <SubMenuBar
          menus={subMenus}
          activeMenu={activeSubMenu}
          onMenuClick={onSubMenuClick}
        />
      )}
    </div>
  );
};

export default PageMenuBar;
