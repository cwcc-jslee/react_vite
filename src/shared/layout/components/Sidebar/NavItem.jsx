// src/shared/layout/components/Sidebar/NavItem.jsx
import React from 'react';

/**
 * 사이드바 네비게이션 아이템
 * @param {boolean} active - 활성 상태
 * @param {ReactNode} children - 레이블 텍스트
 * @param {function} onClick - 클릭 핸들러
 * @param {boolean} collapsed - 접힘 상태
 * @param {ReactNode} icon - 아이콘
 * @param {string|number} badge - 뱃지 (선택사항)
 */
const NavItem = ({
  active,
  children,
  onClick,
  collapsed,
  icon,
  badge
}) => (
  <li
    onClick={onClick}
    className={`
      mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200
      relative overflow-hidden group
      ${active
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }
      ${collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
    `}
  >
    {/* 호버 효과 배경 */}
    {!active && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    )}

    {/* 콘텐츠 */}
    <div className="flex items-center relative z-10">
      {/* 아이콘 */}
      {icon && (
        <span className={`
          ${collapsed ? 'mx-auto' : 'mr-3'}
          ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}
          transition-colors duration-200 text-lg
        `}>
          {icon}
        </span>
      )}

      {/* 텍스트 */}
      {!collapsed && (
        <span className="font-medium flex-1">{children}</span>
      )}

      {/* 뱃지 */}
      {!collapsed && badge && (
        <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold">
          {badge}
        </span>
      )}
    </div>

    {/* 활성 상태 인디케이터 (왼쪽 라인) */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
    )}
  </li>
);

export default NavItem;
