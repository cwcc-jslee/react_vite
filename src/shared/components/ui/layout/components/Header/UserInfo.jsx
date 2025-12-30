// src/shared/components/ui/layout/components/Header/UserInfo.jsx
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * 헤더 사용자 정보 컴포넌트
 * 사용자 아바타, 이름, 권한 표시
 */
const UserInfo = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all duration-200">
      {/* 사용자 아바타 */}
      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-white/30 shadow-md">
        <span className="text-white text-sm font-semibold">
          {user?.user?.username?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>

      {/* 사용자 정보 */}
      <div className="text-white">
        <div className="text-sm font-medium leading-tight">
          {user?.user?.username || 'Guest'}
        </div>
        <div className="text-xs text-blue-200 leading-tight">
          {user?.user?.user_access_control?.name || '사용자'}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
