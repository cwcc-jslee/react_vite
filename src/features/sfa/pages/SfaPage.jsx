// src/features/sfa/pages/SfaPage.jsx
import React from 'react';
// import { SfaProvider } from '../context/SfaContext';
// import { LayoutProvider } from '../context/LayoutProvider';
import { SfaProvider } from '../context/SfaProvider';
import SfaContainer from '../containers/SfaContainer';

/**
 * Main SFA Page Component
 * Provides SFA context to child components
 */
const SfaPage = () => {
  return (
    // <SfaProvider>
    //   <SfaContainer />
    // </SfaProvider>
    // <LayoutProvider>
    <SfaProvider>
      <SfaContainer />
    </SfaProvider>
    // </LayoutProvider>
  );
};

export default SfaPage;
