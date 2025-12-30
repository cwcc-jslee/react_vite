// src/shared/components/ui/layout/DefaultLayout.jsx
/**
 * 애플리케이션의 기본 레이아웃 구조
 * 리팩토링: 컴포넌트 분리 완료 (Header, Sidebar, Content)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { changePage } from '../../../../store/slices/uiSlice';
import {
  SIDEBAR_ITEMS,
  PAGE_MENUS,
  DEFAULT_LAYOUTS,
} from '../../../constants/navigation';
import BreadcrumbWithMenu from './BreadcrumbWithMenu.jsx';
import SidebarActionButton from './SidebarActionButton.jsx';
import { hasMenuPermission } from '../../../utils/permissionUtils';

// 새로 분리된 컴포넌트 import
import {
  Layout,
  Header,
  Sidebar,
  SidebarNav,
  NavList,
  NavItem,
  Content,
  Footer,
} from './components/index.js';

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

  // 사이드바 토글 핸들러
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Layout>
      {/* Header - 새로운 컴포넌트 */}
      <Header onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />

      <div className="flex pt-16 min-h-[calc(100vh-64px)]">
        {/* Sidebar - 새로운 컴포넌트 */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar}>
          {/* 메인 네비게이션 - 첫 번째 자식 */}
          <SidebarNav>
            <NavList>
              {SIDEBAR_ITEMS.map((item) => {
                // 권한 체크
                if (!hasMenuPermission(user?.user?.user_access_control, item)) {
                  return null;
                }

                return (
                  <NavItem
                    key={item.id}
                    active={
                      location.pathname === item.id ||
                      location.pathname.startsWith(item.path)
                    }
                    onClick={() => navigate(item.path)}
                    collapsed={sidebarCollapsed}
                    icon={item.icon}
                  >
                    {item.label}
                  </NavItem>
                );
              })}
            </NavList>
          </SidebarNav>

          {/* 액션 버튼 - 두 번째 자식 */}
          <SidebarActionButton collapsed={sidebarCollapsed} />
        </Sidebar>

        {/* Content - 새로운 컴포넌트 */}
        <Content
          sidebarCollapsed={sidebarCollapsed}
          removeContentPadding={true}
        >
          {/* 상단 영역 (메뉴 + 서브 메뉴) */}
          <div className="border-b border-gray-200 flex-shrink-0">
            <BreadcrumbWithMenu
              currentPage={currentPage}
              pageMenus={PAGE_MENUS}
              activeMenu={pageLayout.menu}
              subMenu={pageLayout.subMenu}
            />
          </div>

          {/* 본문 영역 (필터 + 콘텐츠) - flex-1로 남은 공간 차지 */}
          <div className="p-0 flex-1">
            {/* 현재 레이아웃 정보 디버깅 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-1 text-xs text-gray-500 border-b">
                Page: {pageLayout.page} | Menu: {pageLayout.menu} | Layout:{' '}
                {pageLayout.layout || 'default'}
              </div>
            )}

            {children}
          </div>

          {/* Footer - 새로운 컴포넌트 - flex-shrink-0로 항상 하단 고정 */}
          <Footer className="flex-shrink-0" />
        </Content>
      </div>
    </Layout>
  );
};

export default DefaultLayout;
