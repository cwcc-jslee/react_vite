// src/app/routes.jsx
import { lazy } from 'react';
import PrivateRoute from '../features/auth/components/PrivateRoute';
import PublicRoute from '../features/auth/components/PublicRoute';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const SfaPage = lazy(() => import('../features/sfa/pages/SfaPage'));
const CustomerPage = lazy(() =>
  import('../features/customer/pages/CustomerPage'),
);
// Other lazy-loaded pages...

export const routes = [
  {
    element: <PublicRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/sfa', element: <SfaPage /> },
      { path: '/customer', element: <CustomerPage /> },
      // Other private routes...
    ],
  },
];
