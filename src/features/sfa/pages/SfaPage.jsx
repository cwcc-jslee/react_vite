// src/features/sfa/pages/SfaPage.jsx
import React, { useState } from 'react';
import { SfaProvider } from '../context/SfaContext';
import SfaContainer from '../containers/SfaContainer';

const SfaPage = () => {
  return (
    <SfaProvider>
      <SfaContainer />
    </SfaProvider>
  );
};

export default SfaPage;
