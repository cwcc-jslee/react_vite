// src/shared/layout/components/Navigation/SubMenuBar.jsx
import React from 'react';
import SubMenu from './SubMenu';

/**
 * 서브 메뉴 바 (오른쪽 정렬)
 * @param {Array} menus - 서브 메뉴 배열
 * @param {string} activeMenu - 활성 메뉴 ID
 * @param {function} onMenuClick - 클릭 핸들러
 */
const SubMenuBar = ({ menus = [], activeMenu, onMenuClick }) => (
  <div className="flex gap-2 pl-4 border-l border-gray-200">
    {menus.map((menu) => (
      <SubMenu
        key={menu.key}
        active={activeMenu === menu.key}
        onClick={() => onMenuClick(menu.key)}
        icon={menu.icon}
      >
        {menu.label}
      </SubMenu>
    ))}
  </div>
);

export default SubMenuBar;
