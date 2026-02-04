/**
 * BizRadar API Client - FastAPI 백엔드 전용
 *
 * 특징:
 * - baseURL: /bizradar (Vite 프록시 → http://192.168.20.100:8000)
 * - 인증 불필요
 * - snake_case 변환 불필요 (FastAPI 기본 형식 그대로 사용)
 */

import axios from 'axios';

// BizRadar FastAPI 전용 클라이언트
export const bizradarApiClient = axios.create({
  baseURL: '/bizradar',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 응답 인터셉터 - 에러 핸들링만 처리 (인증 불필요)
bizradarApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('BizRadar API Error:', error);

    // 에러 응답 형식 표준화
    const errorResponse = {
      message: error.response?.data?.detail || error.message || 'API 요청 실패',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    return Promise.reject(errorResponse);
  }
);

export default bizradarApiClient;
