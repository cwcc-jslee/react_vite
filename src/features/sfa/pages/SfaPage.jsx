// src/features/sfa/pages/SfaPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { SfaProvider } from '../context/SfaContext';
import SfaContainer from '../containers/SfaContainer';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SfaPage = () => {
  return (
    <SfaProvider>
      <SfaContainer />
    </SfaProvider>
  );
};

export default SfaPage;
