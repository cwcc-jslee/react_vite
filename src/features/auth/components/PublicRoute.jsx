// src/features/auth/components/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // 이미 인증된 사용자는 메인 페이지로 리디렉션
  if (user) {
    return <Navigate to="/sfa" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
