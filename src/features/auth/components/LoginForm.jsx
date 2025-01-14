// src/features/auth/components/LoginForm.jsx
import { useAuth } from '../hooks/useAuth';
import {
  StyledLoginForm,
  InputField,
  SubmitButton,
  ErrorMessage, // ErrorMessage 컴포넌트 추가
} from './styles';

export const LoginForm = () => {
  const { form, loading, error, handleLogin, handleInputChange } = useAuth();

  return (
    <StyledLoginForm onSubmit={handleLogin}>
      <InputField
        name="username"
        placeholder="아이디"
        value={form.username}
        onChange={handleInputChange}
        autoComplete="username"
      />
      <InputField
        name="password"
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={handleInputChange}
        autoComplete="current-password"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <SubmitButton type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </SubmitButton>
    </StyledLoginForm>
  );
};
