// src/features/sfa/pages/SfaPage.jsx
import React from 'react';
import { SfaProvider } from '../context/SfaContext';
import SfaPageContent from './SfaPageContent';

/**
 * Main SFA Page Component
 * Provides SFA context to child components
 */
const SfaPage = () => {
  return (
    <SfaProvider>
      <SfaPageContent />
    </SfaProvider>
  );
};

export default SfaPage;
