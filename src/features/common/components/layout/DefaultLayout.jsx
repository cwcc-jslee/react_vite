// src/shared/components/ui/layout/DefaultLayout.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../features/auth/store/authSlice';
import { fetchFrequentCodebooks } from '../../../../features/codebook/store/codebookSlice';
import { Button } from '../index';
import {
  Layout,
  Header,
  Content,
  Sider,
  Logo,
  Navigation,
  NavList,
  NavItem,
} from './index';

const menuItems = [
  { key: '/', label: 'HOME' },
  { key: '/sfa', label: 'SFA' },
  { key: '/project', label: 'PROJECT' },
  { key: '/work', label: 'WORK' },
  { key: '/customer', label: 'CUSTOMER' },
  { key: '/contact', label: 'CONTACT' },
];

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status, error } = useSelector((state) => state.codebook);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFrequentCodebooks());
    }

    if (status === 'failed' && error) {
      window.alert(
        `Codebook 정보를 가져오지 못했습니다.\n오류: ${error}\n페이지를 계속 이용할 수 있으나 일부 기능이 제한될 수 있습니다.`,
      );
    }
  }, [dispatch, status, error]);

  if (status === 'loading') {
    return <div>Codebook 로딩중...</div>;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-800 shadow-md z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="text-xl font-bold text-white">CWCC PMS</div>
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              {user?.user?.username || 'Guest'}
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-white border-white/30 hover:bg-white/10"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-[calc(100vh-64px)]">
        <aside className="fixed top-16 left-0 w-60 h-[calc(100vh-64px)] bg-slate-800 overflow-y-auto">
          <nav className="h-full">
            <ul className="list-none p-0 m-0">
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  className={`
                    px-6 py-3 cursor-pointer transition-colors
                    ${
                      location.pathname === item.key
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="ml-60 flex-1 p-3 bg-slate-50 min-h-[calc(100vh-64px)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
