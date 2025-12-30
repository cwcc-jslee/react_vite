// src/shared/api/apiClientV2.js
/**
 * API Client V2 - camelCase ↔ snake_case 자동 변환
 *
 * 주요 기능:
 * - Request: camelCase → snake_case 자동 변환
 * - Response: snake_case → camelCase 자동 변환
 * - JWT 토큰 자동 인증
 * - 401 에러 시 자동 로그아웃
 *
 * 적용된 Feature:
 * - Project (프로젝트 관리)
 *
 * 마이그레이션 예정:
 * - Todo
 * - SFA
 * - Customer
 * - Contact
 */

import axios from 'axios';
import { ENV } from '../config/environment';
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
} from '../utils/transformUtils';

export const apiClientV2 = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ENV.api.timeout,
});

// Request Interceptor: camelCase → snake_case
apiClientV2.interceptors.request.use(
  (config) => {
    // 1. 세션 스토리지에서 토큰 가져오기
    const user = sessionStorage.getItem('user');
    if (user) {
      const { jwt } = JSON.parse(user);
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }

    // 2. 데이터 변환: camelCase → snake_case
    if (config.data) {
      config.data = convertKeysToSnakeCase(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: snake_case → camelCase
apiClientV2.interceptors.response.use(
  (response) => {
    // 데이터 변환: snake_case → camelCase
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    // 인증 오류 처리
    if (error.response?.status === 401) {
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
