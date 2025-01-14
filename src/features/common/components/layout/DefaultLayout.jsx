// src/features/common/components/layout/DefaultLayout.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../auth/store/authSlice';
import { fetchFrequentCodebooks } from '../../../codebook/store/codebookSlice';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #1e40af; // 진한 파란색
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MainContainer = styled.div`
  display: flex;
  margin-top: 64px;
  height: calc(100vh - 64px); // min-height를 height로 변경
`;

const Sidebar = styled.nav`
  position: fixed;
  top: 64px;
  left: 0;
  width: 240px;
  height: calc(100vh - 64px);
  background: #1e293b;
  color: white;
  overflow-y: auto;
`;

const Content = styled.main`
  margin-left: 240px;
  flex: 1;
  padding: 12px; // padding 값을 24px에서 12px로 줄임, 상단 여백공간
  background: #f1f5f9;
  height: fit-content;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-sizing: border-box;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  padding: 12px 24px;
  cursor: pointer;
  background: ${(props) => (props.active ? '#2563eb' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#94a3b8')};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? '#2563eb' : '#334155')};
    color: white;
  }
`;

const Username = styled.span`
  color: white;
  font-weight: 500;
`;

const menuItems = [
  { key: '/', label: 'HOME' },
  { key: '/sfa', label: 'SFA' },
  { key: '/project', label: 'PROJECT' },
  { key: '/work', label: 'WORK' },
  { key: '/customer', label: 'CUSTOMER' },
];

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    data: codebook,
    status,
    error,
  } = useSelector((state) => state.codebook);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFrequentCodebooks());
    }

    // 실패 시에도 진행은 하되, 콘솔 경고나 Toast 등으로 사용자에게 알릴 수 있음
    if (status === 'failed' && error) {
      window.alert(
        `Codebook 정보를 가져오지 못했습니다.\n오류: ${error}\n페이지를 계속 이용할 수 있으나 일부 기능이 제한될 수 있습니다.`,
      );
    }
  }, [dispatch, status]);

  // 로딩 중일 때 로딩 표시
  if (status === 'loading') {
    return <div>Codebook 로딩중...</div>;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <LayoutContainer>
      <Header>
        <Logo>CWCC PMS</Logo>
        <UserSection>
          <Username>{user?.user?.username || 'Guest'}</Username>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </UserSection>
      </Header>

      <MainContainer>
        <Sidebar>
          <NavMenu>
            {menuItems.map((item) => (
              <NavItem
                key={item.key}
                active={location.pathname === item.key}
                onClick={() => navigate(item.key)}
              >
                {item.label}
              </NavItem>
            ))}
          </NavMenu>
        </Sidebar>

        <Content>{children}</Content>
      </MainContainer>
    </LayoutContainer>
  );
};

export default DefaultLayout;
