// src/features/sfa/services/sfaSubmitService.js
import axios from 'axios';
import { transformToDBFields } from '../utils/transformUtils';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * JWT 토큰 가져오기
 */
const getAuthToken = () => {
  try {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      console.error('사용자 정보가 없습니다.');
      return null;
    }
    const user = JSON.parse(userStr);
    console.log('Retrieved token:', user.jwt);
    return user.jwt;
  } catch (e) {
    console.error('토큰 파싱 오류:', e);
    return null;
  }
};

// API 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
});

// 요청 인터셉터 - 토큰 주입 및 헤더 설정
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    // 헤더 설정
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // 요청 데이터 로깅
    console.log('API Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  },
);

/**
 * SFA 데이터 제출 서비스
 */
export const sfaSubmitService = {
  /**
   * SFA 기본 정보 생성
   */
  async createSfaBase(formData) {
    console.log('[API] Creating SFA base with formData:', formData);

    const dbData = transformToDBFields.transformBaseFields(formData);

    try {
      const response = await api.post('/api/sfas', { data: dbData });
      console.log('[API] SFA base creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  /**
   * SFA 매출 아이템 생성
   */
  async createSalesItems(sfaId, salesItems) {
    console.log('[API] Creating sales items for SFA:', sfaId, salesItems);

    const promises = salesItems.map((item) => {
      const dbData = transformToDBFields.transformSalesItem(item);
      return api.post('/api/sfa-items', {
        data: {
          ...dbData,
          sfa: sfaId,
        },
      });
    });

    const results = await Promise.all(promises);
    console.log('[API] Sales items creation results:', results);
    return results;
  },

  /**
   * SFA 매출 항목 생성
   */
  async createSalesEntries(sfaId, salesEntries) {
    console.log('[API] Creating sales entries for SFA:', sfaId, salesEntries);

    const promises = salesEntries.map((entry) => {
      const dbData = transformToDBFields.transformSalesEntry(entry);
      return api.post('/api/sfa-entries', {
        data: {
          ...dbData,
          sfa: sfaId,
        },
      });
    });

    const results = await Promise.all(promises);
    console.log('[API] Sales entries creation results:', results);
    return results;
  },
};

/**
 * SFA 전체 제출 처리
 */
export const submitSfaForm = async (formData) => {
  try {
    console.log('===== Starting SFA Form Submission =====');
    console.log('Input formData:', formData);

    // 1. SFA 기본 정보 생성
    const sfaResponse = await sfaSubmitService.createSfaBase(formData);
    const sfaId = sfaResponse.data.id;
    console.log('Created SFA base with ID:', sfaId);

    // 2. 매출 아이템 생성 (있는 경우에만)
    // if (formData.salesItems?.length > 0) {
    //   await sfaSubmitService.createSalesItems(sfaId, formData.salesItems);
    //   console.log('Created sales items');
    // }

    // 3. 매출 항목 생성 (있는 경우에만)
    // if (formData.salesEntries?.length > 0) {
    //   await sfaSubmitService.createSalesEntries(sfaId, formData.salesEntries);
    //   console.log('Created sales entries');
    // }

    console.log('===== SFA Form Submission Completed =====');

    return {
      success: true,
      data: sfaResponse.data,
    };
  } catch (error) {
    console.error('SFA Form Submission Error:', error);
    throw new Error(error.message || '데이터 저장 중 오류가 발생했습니다.');
  }
};
