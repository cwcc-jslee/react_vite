// src/shared/components/ui/layout/DefaultLayout.jsx
import React, { useState, useEffect } from 'react';
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
  Breadcrumb,
} from './components.jsx';

// 메뉴 아이템에 아이콘 추가
const menuItems = [
  {
    key: '/',
    label: 'HOME',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    key: '/sfa',
    label: 'SFA',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: '/customer',
    label: 'CUSTOMER',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    key: '/contact',
    label: 'CONTACT',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    ),
  },
  {
    key: '/project',
    label: 'PROJECT',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm2 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  // { key: '/work', label: 'WORK' },
];

// 현재 경로에 기반한 브레드크럼 생성 함수
const getBreadcrumbItems = (path) => {
  const segments = path.split('/').filter(Boolean);
  const items = [{ label: 'Home', path: '/' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    items.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath,
    });
  });

  // 마지막 항목은 링크가 아닌 텍스트로 표시
  if (items.length > 1) {
    items[items.length - 1] = { label: items[items.length - 1].label };
  }

  return items;
};

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status, error } = useSelector((state) => state.codebook);

  // 사이드바 접힘/펼침 상태
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 브레드크럼 아이템
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFrequentCodebooks());
    }

    if (status === 'failed' && error) {
      window.alert(
        `Codebook 정보를 가져오지 못했습니다.\n오류: ${error}\n페이지를 계속 이용할 수 있으나 일부 기능이 제한될 수 있습니다.`,
      );
    }

    // 화면 크기에 따라 사이드바 상태 초기화
    const handleResize = () => {
      if (window.innerWidth < 1200 && window.innerWidth >= 800) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1200) {
        setSidebarCollapsed(false);
      }
    };

    // 초기 실행 및 이벤트 리스너 등록
    handleResize();
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, status, error]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3 text-slate-600">Codebook 로딩중...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 사이드바 토글 핸들러
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Layout>
      <Header onToggleSidebar={toggleSidebar}>
        <Logo collapsed={sidebarCollapsed}>CWCC PMS</Logo>
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
        <Sider collapsed={sidebarCollapsed} onToggle={toggleSidebar}>
          <Navigation>
            <NavList>
              {menuItems.map((item) => (
                <NavItem
                  key={item.key}
                  active={location.pathname === item.key}
                  onClick={() => navigate(item.key)}
                  collapsed={sidebarCollapsed}
                  icon={item.icon}
                >
                  {item.label}
                </NavItem>
              ))}
            </NavList>
          </Navigation>
        </Sider>

        <Content sidebarCollapsed={sidebarCollapsed}>
          {/* 브레드크럼 추가 */}
          <Breadcrumb items={breadcrumbItems} />

          {children}
        </Content>
      </div>
    </Layout>
  );
};

export default DefaultLayout;
