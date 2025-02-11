// src/shared/api/apiService.js
/**
 * 확장 API 서비스
 */
import axios from 'axios';
import { getAuthToken } from '../services/authService';
import { ENV } from '../config/environment';

// const API_URL = import.meta.env.VITE_API_URL;

/**
 * API 요청 설정 생성
 * @param {Object} data - 요청 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Object} axios 설정 객체
 */
export const createApiConfig = (data = null, options = {}) => {
  const token = getAuthToken();
  const config = {
    baseURL: ENV.api.url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (data) {
    config.data = { data };
  }

  return config;
};

/**
 * API 클라이언트 인스턴스
 */
export const apiClient = axios.create({
  baseURL: ENV.api.url,
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // 토큰 주입
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 로깅
    console.log('API Request:', {
      url: config?.url,
      method: config?.method,
      data: config?.data,
    });

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

/**
 * API 요청 함수들
 */
export const apiService = {
  get: async (url, options = {}) => {
    const config = createApiConfig(null, options);
    return apiClient.get(url, config);
  },

  post: async (url, data, options = {}) => {
    const config = createApiConfig(data, options);
    return apiClient.post(url, config.data, config);
  },

  // put: async (url, data, options = {}) => {
  //   const config = createApiConfig(data, options);
  //   return apiClient.put(url, config.data, config);
  // },
  put: async (url, data, options = {}) => {
    // data wrapping 제거, createApiConfig에서 한 번만 wrapping되도록 함
    return apiClient.put(
      url,
      { data },
      {
        baseURL: ENV.api.url,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      },
    );
  },

  delete: async (url, options = {}) => {
    const config = createApiConfig(null, options);
    return apiClient.delete(url, config);
  },
};
