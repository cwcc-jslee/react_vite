// src/app/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from '../shared/components/ui/layout/DefaultLayout';
import { useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Lazy load pages
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage'));
const SfaPage = React.lazy(() => import('../features/sfa/pages/SfaPage'));
const CustomerPage = React.lazy(() =>
  import('../features/customer/pages/CustomerPage'),
);
const ContactPage = React.lazy(() =>
  import('../features/contact/pages/ContactPage'),
);

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

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <QueryClientProvider client={queryClient}>
      {!user ? (
        <Suspense fallback={<div>Loading...</div>}>
          <LoginPage />
        </Suspense>
      ) : (
        <DefaultLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes future={{ v7_startTransition: true }}>
              <Route path="/" element={<Navigate to="/sfa" replace />} />
              <Route path="/sfa" element={<SfaPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/contact" element={<ContactPage />} />
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
