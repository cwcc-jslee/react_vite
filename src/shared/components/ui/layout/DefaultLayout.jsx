// src/shared/components/ui/layout/DefaultLayout.jsx
/**
 * 애플리케이션의 기본 레이아웃 구조를 정의하며 전체 UI 프레임워크를 제공합니다.
 * 헤더, 사이드바, 콘텐츠 영역 및 경로 기반 네비게이션을 통합적으로 관리하며 계층적 UI 구조를 지원합니다.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../features/auth/store/authSlice';
// import { fetchFrequentCodebooks } from '../../../../features/codebook/store/codebookSlice';
import { useCodebook } from '../../../hooks/useCodebook.js';
import { changePage } from '../../../../store/slices/uiSlice';
import {
  SIDEBAR_ITEMS,
  PAGE_MENUS,
  DEFAULT_LAYOUTS,
} from '../../../constants/navigation';
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
import BreadcrumbWithMenu from './BreadcrumbWithMenu.jsx';
import SidebarActionButton from './SidebarActionButton.jsx';

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

// 현재 페이지 식별자 추출 함수
const getCurrentPageFromPath = (path) => {
  const segments = path.split('/').filter(Boolean);
  return segments.length > 0 ? segments[0] : '';
};

// PAGE_MENUS Config(layout, components, sections, drawer) 상태 가져오기
const getPageMenuConfig = (page) => {
  if (!page || !PAGE_MENUS[page]) return {};

  const defaultMenuId = PAGE_MENUS[page]?.defaultMenu || 'default';
  const menuConfig = PAGE_MENUS[page]?.items?.[defaultMenuId]?.config || {};

  return menuConfig || {};
};

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // const { status, error } = useSelector((state) => state.codebook);
  const { pageLayout } = useSelector((state) => state.ui);

  // 현재 페이지 식별자 추출
  const currentPage = getCurrentPageFromPath(location.pathname);

  // 사이드바 접힘/펼침 상태
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 브레드크럼 아이템
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  // 페이지 메뉴 관리
  useEffect(() => {
    // 이전에 저장된 페이지와 현재 페이지가 다르면 초기화
    if (currentPage && pageLayout.page !== currentPage) {
      const config = getPageMenuConfig(currentPage);
      const defaultComponents = config?.components || {};
      const defaultSections = config?.sections || {};
      const defaultMenu = PAGE_MENUS[currentPage]?.defaultMenu || 'default';
      const defaultLayout =
        config?.layout || DEFAULT_LAYOUTS[currentPage] || 'default';

      dispatch(
        changePage({
          page: currentPage,
          defaultSections,
          defaultComponents,
          defaultMenu,
          defaultLayout,
        }),
      );

      console.log('페이지 변경: ', {
        page: currentPage,
        sections: defaultSections,
        components: defaultComponents,
        menu: defaultMenu,
        layout: defaultLayout,
      });
    }
  }, [currentPage, pageLayout.page, dispatch]);

  useEffect(() => {
    // if (status === 'idle') {
    //   dispatch(fetchFrequentCodebooks());
    // }

    // if (status === 'failed' && error) {
    //   window.alert(
    //     `Codebook 정보를 가져오지 못했습니다.\n오류: ${error}\n페이지를 계속 이용할 수 있으나 일부 기능이 제한될 수 있습니다.`,
    //   );
    // }

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
  }, [dispatch]);

  // if (status === 'loading') {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-slate-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
  //         <p className="mt-3 text-slate-600">Codebook 로딩중...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
          {/* 메인 네비게이션 - 첫 번째 자식 */}
          <Navigation>
            <NavList>
              {SIDEBAR_ITEMS.map((item) => (
                <NavItem
                  key={item.id}
                  active={
                    location.pathname === item.id ||
                    location.pathname.startsWith(item.path)
                  }
                  onClick={() => navigate(item.id)}
                  collapsed={sidebarCollapsed}
                  icon={item.icon}
                >
                  {item.label}
                </NavItem>
              ))}
            </NavList>
          </Navigation>

          {/* 액션 버튼 - 두 번째 자식 */}
          <SidebarActionButton collapsed={sidebarCollapsed} />
        </Sider>

        <Content
          sidebarCollapsed={sidebarCollapsed}
          removeContentPadding={true}
        >
          {/* 상단 영역 (브레드크럼 + 메뉴) */}
          <div className="border-b border-gray-200">
            <BreadcrumbWithMenu
              breadcrumbItems={breadcrumbItems}
              currentPage={currentPage}
              pageMenus={PAGE_MENUS}
              activeMenu={pageLayout.menu}
            />
          </div>

          {/* 본문 영역 (필터 + 콘텐츠) */}
          <div className="p-0">
            {/* 현재 레이아웃 정보 디버깅 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-1 text-xs text-gray-500 border-b">
                Page: {pageLayout.page} | Menu: {pageLayout.menu} | Layout:{' '}
                {pageLayout.layout || 'default'}
              </div>
            )}

            {children}
          </div>
        </Content>
      </div>
    </Layout>
  );
};

export default DefaultLayout;
