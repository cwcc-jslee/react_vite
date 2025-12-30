// src/shared/layout/components/Sidebar/Navigation.jsx
import React from 'react';

/**
 * 사이드바 네비게이션 컨테이너
 */
const SidebarNav = ({ children, className = '' }) => (
  <nav className={`h-full py-4 ${className}`}>
    {children}
  </nav>
);

export default SidebarNav;
