// src/shared/components/ui/layout/components.jsx
import React, { useState } from 'react';

// 사이드바 너비 상수화 (확장성을 위해)
const SIDEBAR_WIDTH = {
  expanded: 'w-60',
  collapsed: 'w-20',
};

// 사이드바 상태 컨텍스트를 위한 hook
export const useLayoutState = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return {
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
    expandSidebar: () => setSidebarCollapsed(false),
    collapseSidebar: () => setSidebarCollapsed(true),
  };
};

export const Layout = ({ children, className = '' }) => (
  <div className={`flex min-h-screen flex-col ${className}`}>{children}</div>
);

export const Header = ({ children, className = '', onToggleSidebar }) => (
  <header
    className={`fixed top-0 left-0 right-0 h-16 bg-blue-800 shadow-md z-50 ${className}`}
  >
    <div className="h-full px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="text-white hover:bg-blue-700 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        {children[0]} {/* Logo 컴포넌트가 첫번째 자식으로 오는 것을 가정 */}
      </div>
      <div>{children.slice(1)}</div>{' '}
      {/* 나머지 자식들 (사용자 정보, 로그아웃 등) */}
    </div>
  </header>
);

export const Content = ({
  children,
  sidebarCollapsed = false,
  className = '',
  removeContentPadding = false,
}) => {
  // 사이드바 상태에 따라 마진 조정
  const marginLeft = sidebarCollapsed ? 'ml-20' : 'ml-60';

  return (
    <main
      className={`${marginLeft} flex-1 bg-slate-50 min-h-[calc(100vh-64px)] mt-0 overflow-y-auto transition-all duration-200 ${
        removeContentPadding ? '' : 'p-3'
      } ${className}`}
    >
      {children}
    </main>
  );
};

export const Sider = ({
  children,
  collapsed = false,
  onToggle,
  className = '',
}) => {
  // 사이드바 너비 설정
  const width = collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;

  return (
    <aside
      className={`fixed top-16 left-0 ${width} h-[calc(100vh-64px)] bg-slate-800 overflow-y-auto transition-all duration-200 ${className}`}
    >
      {/* 사이드바 토글 버튼 */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-blue-700 rounded-full p-1 text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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

      {children}
    </aside>
  );
};

export const Logo = ({ children, collapsed = false, className = '' }) => (
  <div
    className={`text-xl font-bold text-white ${
      collapsed ? 'px-2 text-center' : ''
    } ${className}`}
  >
    {collapsed ? children.toString().charAt(0) : children}
  </div>
);

export const Navigation = ({ children, className = '' }) => (
  <nav className={`h-full ${className}`}>{children}</nav>
);

export const NavList = ({ children, className = '' }) => (
  <ul className={`list-none p-0 m-0 ${className}`}>{children}</ul>
);

export const NavItem = ({
  active,
  children,
  onClick,
  collapsed = false,
  icon,
  className = '',
}) => (
  <li
    onClick={onClick}
    className={`
      px-6 py-3 cursor-pointer transition-colors flex items-center
      ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }
      ${collapsed ? 'justify-center px-2' : ''}
      ${className}
    `}
  >
    {/* 아이콘이 있는 경우 표시 */}
    {icon && <span className={collapsed ? 'mx-auto' : 'mr-3'}>{icon}</span>}

    {/* 사이드바가 접힌 상태가 아닐 때만 텍스트 표시 */}
    {!collapsed && <span>{children}</span>}

    {/* 접힌 상태에서 아이콘이 없는 경우, 텍스트의 첫 글자만 표시 */}
    {collapsed && !icon && (
      <span className="mx-auto font-medium">
        {children.toString().charAt(0)}
      </span>
    )}
  </li>
);

export const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm mb-6 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-medium text-slate-800">{title}</h2>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// 브레드크럼 컴포넌트 (네비게이션 계층 표시)
export const Breadcrumb = ({ items = [], className = '' }) => (
  <div className={`flex items-center text-sm text-slate-500 mb-4 ${className}`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="mx-2">/</span>}
        {item.path ? (
          <a href={item.path} className="hover:text-blue-600 transition-colors">
            {item.label}
          </a>
        ) : (
          <span className="font-medium text-slate-700">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

// 간단한 탭 컴포넌트
export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => (
  <div className={`border-b border-slate-200 ${className}`}>
    <div className="flex space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors
            ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-blue-500'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);
