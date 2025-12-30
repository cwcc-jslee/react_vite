// src/shared/components/ui/layout/components/Header/Header.jsx
import React from 'react';
import Logo from './Logo';
import HeaderActions from './HeaderActions';

/**
 * 헤더 메인 컴포넌트
 * @param {function} onToggleSidebar - 사이드바 토글 핸들러
 * @param {boolean} collapsed - 사이드바 접힘 상태
 */
const Header = ({ onToggleSidebar, collapsed }) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg z-50">
    <div className="h-full px-6 flex items-center justify-between">
      {/* 왼쪽: 토글 버튼 + 로고 */}
      <div className="flex items-center space-x-4">
        {/* 사이드바 토글 버튼 */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* 로고 */}
        <Logo collapsed={collapsed} />
      </div>

      {/* 오른쪽: 사용자 정보 + 액션 */}
      <HeaderActions />
    </div>
  </header>
);

export default Header;
