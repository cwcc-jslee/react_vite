// src/shared/components/ui/layout/DefaultLayout.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../features/auth/store/authSlice';
import { fetchFrequentCodebooks } from '../../../../features/codebook/store/codebookSlice';
import { Button } from '../index.jsx';
import {
  Layout,
  Header,
  Content,
  Sider,
  Logo,
  Navigation,
  NavList,
  NavItem,
} from './components.jsx';

const menuItems = [
  { key: '/', label: 'HOME' },
  { key: '/sfa', label: 'SFA' },
  { key: '/customer', label: 'CUSTOMER' },
  { key: '/project', label: 'PROJECT' },
  { key: '/work', label: 'WORK' },
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
    <Layout>
      <Header>
        <Logo>CWCC PMS</Logo>
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
      </Header>

      <div className="flex pt-16 min-h-[calc(100vh-64px)]">
        <Sider>
          <Navigation>
            <NavList>
              {menuItems.map((item) => (
                <NavItem
                  key={item.key}
                  active={location.pathname === item.key}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                </NavItem>
              ))}
            </NavList>
          </Navigation>
        </Sider>

        <Content>{children}</Content>
      </div>
    </Layout>
  );
};

export default DefaultLayout;
