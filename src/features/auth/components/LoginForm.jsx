// src/features/auth/components/LoginForm.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Form,
  Input,
  Button,
  Message,
} from '../../../shared/components/ui/index.jsx';

export const LoginForm = () => {
  const { form, loading, error, handleLogin, handleInputChange } = useAuth();

  return (
    <Form maxWidth="sm" className="space-y-6">
      <Input
        name="username"
        placeholder="아이디"
        value={form.username}
        onChange={handleInputChange}
        autoComplete="username"
      />
      <Input
        name="password"
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={handleInputChange}
        autoComplete="current-password"
      />
      {error && <Message type="error">{error}</Message>}
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
        onClick={handleLogin}
      >
        {loading ? '로그인 중...' : '로그인'}
      </Button>
    </Form>
  );
};
