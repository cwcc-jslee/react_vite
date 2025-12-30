// src/shared/components/ui/layout/components/Navigation/SubMenu.jsx
import React from 'react';

/**
 * 서브 메뉴 버튼
 * @param {boolean} active - 활성 상태
 * @param {function} onClick - 클릭 핸들러
 * @param {ReactNode} children - 메뉴 레이블
 * @param {ReactNode} icon - 아이콘
 */
const SubMenu = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-md text-sm font-medium
      flex items-center gap-2
      transition-all duration-200
      ${active
        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200 shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
  >
    {icon && <span className="text-sm">{icon}</span>}
    <span>{children}</span>
  </button>
);

export default SubMenu;
