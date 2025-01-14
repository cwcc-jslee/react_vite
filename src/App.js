import 'antd/dist/reset.css';
import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import { useSelector } from 'react-redux';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

//page import
import ProgramPage from './pages/ProgramPage';
import ProposalPage from './pages/ProposalPage';
import SfaPage from './pages/SfaPage';
import SfaDashboardPage from './pages/SfaDashboardPage';
import ProjectPage from './pages/ProjectPage';
import MaintenancePage from './pages/MaintenancePage';
import WorkPage from './pages/WorkPage';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import RndPage from './pages/RndPage';
// import WorkPage from './pages/WorkPage';

import LoginPage from './pages/LoginPage';
import ErrorPage from './pages/ErrorPage';

function App() {
  // const { user } = useSelector(({ auth }) => ({ user: auth.auth }));
  // if (!user) {
  //   return <LoginPage />;
  // }

  return (
    <>
      <Routes>
        {/* <Route path="/" element={<ErrorPage />} /> */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login" element={<ErrorPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/proposal" element={<ProposalPage />} />
          <Route path="/sfa" element={<SfaPage />} />
          <Route path="/sfadashboard" element={<SfaDashboardPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/rnd" element={<RndPage />} />
          <Route path="/*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
