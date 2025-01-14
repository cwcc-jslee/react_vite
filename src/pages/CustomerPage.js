import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import CustomerContainer from '../containers/CustomerContainer';

const CustomerPage = () => {
  return (
    <>
      <DefaultLayout>
        <CustomerContainer />
      </DefaultLayout>
    </>
  );
};

export default CustomerPage;
