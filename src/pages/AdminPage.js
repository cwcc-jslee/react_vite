import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import AdminContainer from '../containers/admin/AdminContainer';

const AdminPage = () => {
  return (
    <DefaultLayout>
      <AdminContainer />
    </DefaultLayout>
  );
};

export default AdminPage;
