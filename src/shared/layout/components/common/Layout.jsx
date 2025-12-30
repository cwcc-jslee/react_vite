// src/shared/layout/components/common/Layout.jsx
import React from 'react';

/**
 * 최상위 레이아웃 컨테이너
 */
const Layout = ({ children, className = '' }) => (
  <div className={`flex min-h-screen flex-col bg-slate-50 ${className}`}>
    {children}
  </div>
);

export default Layout;
