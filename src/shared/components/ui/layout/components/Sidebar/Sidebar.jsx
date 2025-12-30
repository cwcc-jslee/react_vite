// src/shared/components/ui/layout/components/Sidebar/Sidebar.jsx
import React from 'react';

/**
 * 사이드바 메인 컴포넌트
 * @param {ReactNode} children - 네비게이션 및 액션 버튼
 * @param {boolean} collapsed - 접힘 상태
 * @param {function} onToggle - 토글 핸들러
 */
const Sidebar = ({ children, collapsed = false, onToggle, className = '' }) => {
  // 사이드바 너비 설정
  const width = collapsed ? 'w-20' : 'w-64';

  // 자식 요소 분리 (네비게이션과 액션 버튼을 구분하기 위해)
  let mainNavigation = null;
  let actionButtons = null;

  // children이 배열인 경우 (복수의 자식 요소)
  if (Array.isArray(children)) {
    mainNavigation = children[0];
    actionButtons = children[1];
  } else {
    // 단일 자식인 경우 (네비게이션만 있는 경우)
    mainNavigation = children;
  }

  return (
    <aside
      className={`
        fixed top-16 left-0 ${width} h-[calc(100vh-64px)]
        bg-slate-900 shadow-xl
        flex flex-col transition-all duration-300 ease-in-out
        border-r border-slate-700/50
        ${className}
      `}
    >
      {/* 사이드바 토글 버튼 */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-blue-600 rounded-full p-1.5 text-white shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 z-10 transition-all duration-200 hover:scale-110"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform duration-200"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {collapsed ? (
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      )}

      {/* 메인 네비게이션 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {mainNavigation}
      </div>

      {/* 하단 액션 버튼 영역 */}
      {actionButtons && (
        <div className="border-t border-slate-700/50 mt-auto">
          {actionButtons}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
