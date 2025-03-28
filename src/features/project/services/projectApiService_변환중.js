// src/features/project/services/projectApiService.js
/**
 * 프로젝트 관련 API 통신 서비스
 *
 * Axios를 사용한 API 요청 처리 및 에러 핸들링
 */
import { apiClient } from '../../../shared/api/apiClient';
import { buildProjectListQuery } from '../api/queries';
import {
  normalizeResponse,
  normalizeError,
} from '../../../shared/api/normalize';
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
} from '../../../shared/utils/transformUtils';

// 응답 데이터 변환 인터셉터 (스네이크케이스 → 카멜케이스)
apiClient.interceptors.response.use(
  (response) => {
    // 데이터가 있는 경우만 변환
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 프로젝트 목록 조회
 * @param {Object} params - 페이지네이션, 필터 등 요청 파라미터
 * @returns {Promise} API 응답 Promise
 */
const getProjectList = async (params = {}) => {
  try {
    // 전송 전 파라미터 스네이크케이스로 변환
    const snakeCaseParams = convertKeysToSnakeCase(params);

    const response = await apiClient.get('/projects', {
      params: snakeCaseParams,
    });
    return response.data;
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    throw handleApiError(error);
  }
};

/**
 * 프로젝트 상세 조회
 * @param {string|number} projectId - 조회할 프로젝트 ID
 * @returns {Promise} API 응답 Promise
 */
const getProjectDetail = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`프로젝트 상세 조회 실패 (ID: ${projectId}):`, error);
    throw handleApiError(error);
  }
};

/**
 * 새 프로젝트 생성
 * @param {Object} projectData - 저장할 프로젝트 데이터
 * @returns {Promise} API 응답 Promise
 */
const createProject = async (projectData) => {
  try {
    // 전송 전 데이터 스네이크케이스로 변환
    const snakeCaseData = convertKeysToSnakeCase(projectData);

    const response = await apiClient.post('/projects', snakeCaseData);
    return response.data;
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    throw handleApiError(error);
  }
};

/**
 * 기존 프로젝트 수정
 * @param {string|number} projectId - 수정할 프로젝트 ID
 * @param {Object} projectData - 수정할 프로젝트 데이터
 * @returns {Promise} API 응답 Promise
 */
const updateProject = async (projectId, projectData) => {
  try {
    // 전송 전 데이터 스네이크케이스로 변환
    const snakeCaseData = convertKeysToSnakeCase(projectData);

    const response = await apiClient.put(
      `/projects/${projectId}`,
      snakeCaseData,
    );
    return response.data;
  } catch (error) {
    console.error(`프로젝트 수정 실패 (ID: ${projectId}):`, error);
    throw handleApiError(error);
  }
};

/**
 * 프로젝트 저장 (생성 또는 수정)
 * @param {Object} projectData - 저장할 프로젝트 데이터
 * @returns {Promise} API 응답 Promise
 */
const saveProject = async (projectData) => {
  if (projectData.id) {
    return updateProject(projectData.id, projectData);
  } else {
    return createProject(projectData);
  }
};

/**
 * 프로젝트 삭제
 * @param {string|number} projectId - 삭제할 프로젝트 ID
 * @returns {Promise} API 응답 Promise
 */
const deleteProject = async (projectId) => {
  try {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`프로젝트 삭제 실패 (ID: ${projectId}):`, error);
    throw handleApiError(error);
  }
};

/**
 * 코드북 조회
 * @param {Array} types - 조회할 코드북 타입 배열
 * @returns {Promise} API 응답 Promise
 */
const getCodebooks = async (types = []) => {
  try {
    const params = types.length > 0 ? { types: types.join(',') } : {};
    const response = await apiClient.get('/codebooks', { params });
    return response.data;
  } catch (error) {
    console.error('코드북 조회 실패:', error);
    throw handleApiError(error);
  }
};

/**
 * 태스크 템플릿 조회
 * @param {string|number} templateId - 조회할 템플릿 ID (선택적)
 * @returns {Promise} API 응답 Promise
 */
const getTaskTemplate = async (templateId = null) => {
  try {
    const url = templateId
      ? `/task-templates/${templateId}`
      : '/task-templates';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('태스크 템플릿 조회 실패:', error);
    throw handleApiError(error);
  }
};

/**
 * 고객사별 SFA 목록 조회
 * @param {string|number} customerId - 고객사 ID
 * @returns {Promise} API 응답 Promise
 */
const getSfasByCustomer = async (customerId) => {
  if (!customerId) {
    return { data: [] };
  }

  try {
    const response = await apiClient.get(`/customers/${customerId}/sfas`);
    return response.data;
  } catch (error) {
    console.error(
      `고객사별 SFA 목록 조회 실패 (고객사ID: ${customerId}):`,
      error,
    );
    throw handleApiError(error);
  }
};

/**
 * API 에러 처리 헬퍼 함수
 * @param {Error} error - 발생한 에러 객체
 * @returns {Error} 처리된 에러 객체
 */
const handleApiError = (error) => {
  if (error.response) {
    // 서버에서 응답한 에러
    const status = error.response.status;
    const message = error.response.data?.message || '서버 에러가 발생했습니다.';

    // HTTP 상태 코드별 메시지 커스터마이징
    switch (status) {
      case 400:
        return new Error(message || '잘못된 요청입니다.');
      case 401:
        return new Error('인증이 필요합니다.');
      case 403:
        return new Error('접근 권한이 없습니다.');
      case 404:
        return new Error('요청한 리소스를 찾을 수 없습니다.');
      case 500:
        return new Error('서버 내부 오류가 발생했습니다.');
      default:
        return new Error(`서버 에러 (${status}): ${message}`);
    }
  } else if (error.request) {
    // 요청은 보냈으나 응답을 받지 못한 경우
    return new Error('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
  } else {
    // 요청 설정 중 발생한 오류
    return new Error(`요청 오류: ${error.message}`);
  }
};

// API 서비스 객체 내보내기
export const projectApiService = {
  getProjectList,
  getProjectDetail,
  createProject,
  updateProject,
  saveProject,
  deleteProject,
  getCodebooks,
  getTaskTemplate,
  getSfasByCustomer,
};
