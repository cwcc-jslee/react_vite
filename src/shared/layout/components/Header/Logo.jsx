// src/shared/layout/components/Header/Logo.jsx
import React from 'react';

/**
 * 헤더 로고 컴포넌트
 * @param {boolean} collapsed - 사이드바 접힘 상태
 */
const Logo = ({ collapsed }) => (
  <div className="flex items-center gap-3 transition-all duration-200">
    {/* 로고 아이콘 */}
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
      <span className="text-blue-900 font-bold text-2xl">C</span>
    </div>

    {/* 로고 텍스트 */}
    {!collapsed && (
      <span className="text-white text-xl font-bold tracking-wide">
        CWCC PMS
      </span>
    )}
  </div>
);

export default Logo;
