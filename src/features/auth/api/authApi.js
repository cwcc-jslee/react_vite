// src/features/auth/api/authApi.js
import { apiClient } from '../../../shared/api/apiClient';

export const authApi = {
  login: async ({ username, password }) => {
    const payload = {
      identifier: username,
      password: password,
    };
    return apiClient.post('/auth/local', payload);
  },
};
