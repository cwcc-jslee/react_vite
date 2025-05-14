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

  getMe: async (token) => {
    return apiClient.get('/users/me', {
      params: {
        populate: {
          team: {
            fields: ['id', 'name', 'code'],
          },
          user_access_control: {
            fields: ['code', 'name', 'permissions', 'remarks'],
          },
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
