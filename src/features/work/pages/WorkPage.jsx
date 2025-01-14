// src/features/sfa/pages/SfaPage.jsx
import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const WorkPage = () => {
  return (
    <PageContainer>
      <PageTitle>SFA</PageTitle>
      <ContentCard>SFA 테스트 페이지 입니다.</ContentCard>
    </PageContainer>
  );
};

export default WorkPage;
