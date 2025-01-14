import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, updateForm, clearForm } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { form, user, loading, error } = useSelector((state) => state.auth);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await dispatch(loginUser(form)).unwrap();
        dispatch(clearForm());
        navigate('/');
      } catch (err) {
        // Error is handled by the slice
      }
    },
    [dispatch, form, navigate],
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch(updateForm({ field: name, value }));
    },
    [dispatch],
  );

  return {
    form,
    user,
    loading,
    error,
    handleLogin,
    handleInputChange,
  };
};
