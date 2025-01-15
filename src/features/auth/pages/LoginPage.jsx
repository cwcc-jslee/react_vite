// src/features/auth/pages/LoginPage.jsx
import React from 'react';
import { LoginForm } from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-8">
          로그인
        </h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
