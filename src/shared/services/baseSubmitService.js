// src/shared/services/baseSubmitService.js
import { apiService } from '../api/apiService';

/**
 * 기본 제출 서비스 팩토리 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/customers')
 * @returns {Object} - 서비스 메서드들을 담은 객체
 */
export const baseSubmitService = (endpoint) => {
  const entityName = endpoint.replace('/', ''); // '/customers' -> 'customers'

  /**
   * 기본 데이터 생성
   * @param {Object} formData - 폼 데이터 (이미 변환된 상태)
   */
  const createBase = async (formData) => {
    console.log(`[${entityName}] Creating base with formData:`, formData);

    try {
      const response = await apiService.post(endpoint, formData);
      return response.data;
    } catch (error) {
      console.error(`[${entityName}] Creation error:`, error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  };

  /**
   * 기본 필드 수정
   * @param {string} id - 엔티티 ID
   * @param {Object} formData - 수정할 데이터 (이미 변환된 상태)
   */
  const updateBase = async (id, formData) => {
    console.log(`[${entityName}] Updating with formData:`, formData);

    try {
      const response = await apiService.put(`${endpoint}/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error(`[${entityName}] Update error:`, error);
      throw new Error(
        error.response?.data?.error?.message ||
          '데이터 저장 중 오류가 발생했습니다.',
      );
    }
  };

  /**
   * 소프트 삭제 기능 (is_deleted 필드 활용)
   * @param {string} id - 삭제할 엔티티 ID
   */
  const softDelete = async (id) => {
    console.log(`[${entityName}] Soft delete:`, { id });

    try {
      const dbData = { is_deleted: true };
      const response = await apiService.put(`${endpoint}/${id}`, dbData);
      return response.data;
    } catch (error) {
      console.error(`[${entityName}] Delete error:`, error);
      throw new Error(
        error.response?.data?.error?.message || '삭제 중 오류가 발생했습니다.',
      );
    }
  };

  /**
   * 데이터 완전 삭제 (하드 삭제)
   * @param {string} id - 삭제할 엔티티 ID
   */
  const hardDelete = async (id) => {
    console.log(`[${entityName}] Hard delete:`, { id });

    try {
      const response = await apiService.delete(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[${entityName}] Hard delete error:`, error);
      throw new Error(
        error.response?.data?.error?.message || '삭제 중 오류가 발생했습니다.',
      );
    }
  };

  // 서비스 메서드 객체 반환
  return {
    createBase,
    updateBase,
    softDelete,
    // hardDelete,
    entityName,
  };
};

/**
 * 제네릭 엔티티 생성 함수
 * @param {Object} service - 사용할 서비스 객체
 * @param {Object} formData - 폼 데이터 (이미 변환된 상태)
 * @param {string} entityName - 엔티티 이름 (로깅용)
 */
export const createEntity = async (
  service,
  formData,
  entityName = 'Entity',
) => {
  try {
    console.log(`===== Starting ${entityName} Form Submission =====`);

    // 기본 정보 생성
    const response = await service.createBase(formData);
    if (!response || !response.data) {
      throw new Error(`${entityName} 기본 정보 생성 실패`);
    }

    console.log(`===== ${entityName} Form Submission Completed =====`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`${entityName} Form Submission Error:`, error);
    throw error;
  }
};
