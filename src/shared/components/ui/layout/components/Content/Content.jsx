// src/shared/components/ui/layout/components/Content/Content.jsx
import React from 'react';

/**
 * 메인 콘텐츠 영역
 * @param {ReactNode} children - 콘텐츠
 * @param {boolean} sidebarCollapsed - 사이드바 접힘 상태
 * @param {boolean} removeContentPadding - 패딩 제거 여부
 */
const Content = ({
  children,
  sidebarCollapsed = false,
  className = '',
  removeContentPadding = false,
}) => {
  // 사이드바 상태에 따라 마진 조정
  const marginLeft = sidebarCollapsed ? 'ml-20' : 'ml-64';

  return (
    <main
      className={`
        ${marginLeft} flex-1 bg-slate-50 min-h-[calc(100vh-64px)] mt-0
        flex flex-col
        transition-all duration-300 ease-in-out
        ${removeContentPadding ? '' : 'p-3'}
        ${className}
      `}
    >
      {children}
    </main>
  );
};

export default Content;
