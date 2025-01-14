// src/features/auth/pages/LoginPage.jsx
import React from 'react';
import { LoginForm } from '../components/LoginForm';
import styled from 'styled-components';

const LoginPageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoginHeader = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
  font-size: 1.5rem;
`;

const LoginPage = () => {
  return (
    <LoginPageWrapper>
      <LoginContainer>
        <LoginHeader>로그인</LoginHeader>
        <LoginForm />
      </LoginContainer>
    </LoginPageWrapper>
  );
};

export default LoginPage;
