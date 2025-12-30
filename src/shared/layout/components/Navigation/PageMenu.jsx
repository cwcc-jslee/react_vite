// src/shared/layout/components/Navigation/PageMenu.jsx
import React from 'react';

/**
 * 페이지 메뉴 버튼 (개선된 UI)
 * @param {boolean} active - 활성 상태
 * @param {function} onClick - 클릭 핸들러
 * @param {ReactNode} children - 메뉴 레이블
 * @param {ReactNode} icon - 아이콘 (선택사항)
 */
const PageMenu = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`
      px-5 py-2.5 rounded-lg text-sm font-semibold
      transition-all duration-200 transform
      flex items-center gap-2
      relative overflow-hidden group
      ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
      }
    `}
  >
    {/* 호버 배경 효과 */}
    {!active && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    )}

    {/* 콘텐츠 */}
    <div className="flex items-center gap-2 relative z-10">
      {icon && <span className="text-base">{icon}</span>}
      <span>{children}</span>
    </div>

    {/* 활성 상태 하단 라인 */}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
    )}
  </button>
);

export default PageMenu;
