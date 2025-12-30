// src/shared/components/ui/layout/components/Sidebar/NavList.jsx
import React from 'react';

/**
 * 네비게이션 리스트 컨테이너
 */
const NavList = ({ children, className = '' }) => (
  <ul className={`list-none p-0 m-0 ${className}`}>
    {children}
  </ul>
);

export default NavList;
