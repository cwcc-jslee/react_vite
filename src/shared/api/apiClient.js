// src/shared/api/apiClient.js
import axios from 'axios';
import { ENV } from '../config/environment';

export const apiClient = axios.create({
  baseURL: '/api', // proxy 설정과 일치
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초
});

// 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // 세션 스토리지에서 토큰 가져오기
    const user = sessionStorage.getItem('user');
    if (user) {
      const { jwt } = JSON.parse(user);
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 처리
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
