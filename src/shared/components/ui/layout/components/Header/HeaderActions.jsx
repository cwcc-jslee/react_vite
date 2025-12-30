// src/shared/components/ui/layout/components/Header/HeaderActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../../../../features/auth/store/authSlice';
import { Button } from '../../../index';
import UserInfo from './UserInfo';

/**
 * 헤더 우측 액션 영역
 * 사용자 정보 + 로그아웃 버튼
 */
const HeaderActions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4">
      {/* 사용자 정보 */}
      <UserInfo />

      {/* 로그아웃 버튼 */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
      >
        로그아웃
      </Button>
    </div>
  );
};

export default HeaderActions;
