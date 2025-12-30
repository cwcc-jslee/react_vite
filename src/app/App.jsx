// src/app/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from '@layout/DefaultLayout';
import { useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { hasPagePermission } from '../shared/utils/permissionUtils';

// Lazy load pages
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage'));
const SfaPage = React.lazy(() => import('../features/sfa/pages/SfaPage'));
const CustomerPage = React.lazy(() =>
  import('../features/customer/pages/CustomerPage'),
);
const ContactPage = React.lazy(() =>
  import('../features/contact/pages/ContactPage'),
);
const ProjectPage = React.lazy(() =>
  import('../features/project/pages/ProjectPage'),
);
const TodoPage = React.lazy(() => import('../features/todo/pages/TodoPage'));

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // API 호출 실패시 재시도 횟수
      staleTime: 1000 * 60 * 5, // 데이터가 fresh 상태로 유지되는 시간 (5분)
      cacheTime: 1000 * 60 * 30, // 데이터가 캐시에 유지되는 시간 (30분)
      refetchOnMount: true, // 컴포넌트 마운트시 데이터 리페치
      refetchOnWindowFocus: false, // 윈도우 포커스시 데이터 리페치 비활성화
      refetchOnReconnect: true, // 네트워크 재연결시 데이터 리페치
      suspense: false, // Suspense 모드 비활성화
    },
    mutations: {
      retry: 1, // 뮤테이션 실패시 재시도 횟수
      useErrorBoundary: false, // 에러 바운더리 사용 여부
    },
  },
});

// 권한 체크 유틸리티 함수
const checkPagePermission = (user, path) => {
  const pageId = path.split('/')[1];
  return hasPagePermission(user?.user?.user_access_control, pageId);
};

// PrivateRoute 컴포넌트 수정
const PrivateRoute = ({ children, path }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 페이지 접근 권한 체크
  if (!checkPagePermission(user, path)) {
    // 권한이 없는 경우 초기 페이지로 리다이렉트
    const initialPage =
      user?.user?.user_access_control?.permissions?.initialPage?.path ||
      '/todo';
    return <Navigate to={initialPage} replace />;
  }

  // 초기 페이지 설정
  const initialPage =
    user?.user?.user_access_control?.permissions?.initialPage?.path || '/todo';

  // 현재 경로가 루트('/')인 경우 초기 페이지로 리다이렉트
  if (window.location.pathname === '/') {
    return <Navigate to={initialPage} replace />;
  }

  return children;
};

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <QueryClientProvider client={queryClient}>
      {!user ? (
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      ) : (
        <DefaultLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes future={{ v7_startTransition: true }}>
              <Route
                path="/"
                element={
                  <PrivateRoute path="/">
                    <Navigate
                      to={
                        user?.user?.user_access_control?.permissions
                          ?.initialPage?.path || '/dashboard'
                      }
                      replace
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute path="/dashboard">
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sfa"
                element={
                  <PrivateRoute path="/sfa">
                    <SfaPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/customer"
                element={
                  <PrivateRoute path="/customer">
                    <CustomerPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <PrivateRoute path="/contact">
                    <ContactPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/project"
                element={
                  <PrivateRoute path="/project">
                    <ProjectPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/todo"
                element={
                  <PrivateRoute path="/todo">
                    <TodoPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DefaultLayout>
      )}
      {/* 개발 환경에서만 DevTools 표시 */}
      {/* 환경변수 접근 방식 변경 */}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};

export default App;
