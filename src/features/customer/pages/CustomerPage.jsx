import React from 'react';
import { CustomerProvider } from '../context/CustomerProvider';
import CustomerContainer from '../containers/CustomerContainer';

const CustomerPage = () => {
  return (
    <CustomerProvider>
      <CustomerContainer />
    </CustomerProvider>
  );
};

export default CustomerPage;
