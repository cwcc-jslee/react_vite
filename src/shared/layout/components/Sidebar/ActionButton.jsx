// src/shared/layout/components/Sidebar/ActionButton.jsx
import React from 'react';

/**
 * 사이드바 하단 액션 버튼
 * @param {ReactNode} children - 버튼 텍스트
 * @param {function} onClick - 클릭 핸들러
 * @param {boolean} collapsed - 사이드바 접힘 상태
 * @param {ReactNode} icon - 아이콘
 */
const ActionButton = ({
  children,
  onClick,
  collapsed = false,
  icon,
  className = '',
}) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left px-6 py-3 cursor-pointer transition-all duration-200
      flex items-center relative overflow-hidden group
      text-white bg-gradient-to-r from-blue-600 to-blue-500
      hover:from-blue-500 hover:to-blue-400
      shadow-lg hover:shadow-xl
      ${collapsed ? 'justify-center px-2' : ''}
      ${className}
    `}
  >
    {/* 호버 효과 */}
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200" />

    {/* 콘텐츠 */}
    <div className="flex items-center relative z-10 w-full">
      {/* 아이콘 */}
      {icon && (
        <span className={`${collapsed ? 'mx-auto' : 'mr-3'} text-lg`}>
          {icon}
        </span>
      )}

      {/* 텍스트 */}
      {!collapsed && <span className="font-medium">{children}</span>}

      {/* + 아이콘 (펼쳐진 상태에서만) */}
      {!collapsed && !icon && (
        <span className="ml-auto text-xl font-bold">+</span>
      )}

      {/* 접힌 상태에서 아이콘이 없는 경우 첫 글자만 표시 */}
      {collapsed && !icon && (
        <span className="mx-auto font-bold text-lg">
          {children.toString().charAt(0)}
        </span>
      )}
    </div>
  </button>
);

export default ActionButton;
