// src/features/project/services/projectBucketService.js
/**
 * 프로젝트 버킷 관련 API 서비스
 * 버킷의 생성, 조회, 수정, 삭제 등의 기능을 제공합니다.
 */

import { apiService } from '../../../shared/api/apiService';
import qs from 'qs';

/**
 * 프로젝트 버킷 API 서비스
 */
export const projectBucketService = {
  /**
   * 새 버킷 생성
   * @param {Object} bucketData - 버킷 데이터 (project_id 포함)
   * @returns {Promise<Object>} 생성된 버킷 객체
   */
  createBucket: async (bucketData) => {
    try {
      const response = await apiService.post(
        '/project-task-buckets',
        bucketData,
      );
      return response.data;
    } catch (error) {
      console.error('Bucket creation error:', error);
      throw new Error(
        '버킷 생성 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷 상세 조회
   * @param {string|number} bucketId - 버킷 ID
   * @returns {Promise<Object>} 버킷 객체
   */
  getBucket: async (bucketId) => {
    try {
      const response = await apiService.get(
        `/project-task-buckets/${bucketId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Bucket fetch error:', error);
      throw new Error(
        '버킷 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 프로젝트의 모든 버킷 조회
   * @param {string|number} projectId - 프로젝트 ID
   * @returns {Promise<Array>} 버킷 객체 배열
   */
  getProjectBuckets: async (projectId) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            project: { id: { $eq: projectId } },
          },
          sort: ['position:asc'],
          populate: {
            tasks: {
              sort: ['position:asc'],
            },
          },
        },
        { encodeValuesOnly: true },
      );

      const response = await apiService.get(`/project-task-buckets?${query}`);
      return response.data;
    } catch (error) {
      console.error('Project buckets fetch error:', error);
      throw new Error(
        '프로젝트 버킷 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷 수정
   * @param {string|number} bucketId - 버킷 ID
   * @param {Object} bucketData - 수정할 버킷 데이터
   * @returns {Promise<Object>} 수정된 버킷 객체
   */
  updateBucket: async (bucketId, bucketData) => {
    try {
      const response = await apiService.put(
        `/project-task-buckets/${bucketId}`,
        bucketData,
      );
      return response.data;
    } catch (error) {
      console.error('Bucket update error:', error);
      throw new Error(
        '버킷 수정 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷 삭제
   * @param {string|number} bucketId - 삭제할 버킷 ID
   * @returns {Promise<Object>} 응답 객체
   */
  deleteBucket: async (bucketId) => {
    try {
      const response = await apiService.delete(
        `/project-task-buckets/${bucketId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Bucket deletion error:', error);
      throw new Error(
        '버킷 삭제 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷 순서 변경
   * @param {Array} bucketsOrder - 버킷 ID와 새 position을 포함한 객체 배열
   * @returns {Promise<Object>} 응답 객체
   */
  updateBucketsOrder: async (bucketsOrder) => {
    try {
      const payload = {
        buckets: bucketsOrder,
      };

      const response = await apiService.patch(
        `/project-task-buckets/order`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error('Buckets order update error:', error);
      throw new Error(
        '버킷 순서 변경 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷과 해당 태스크 한 번에 생성
   * @param {Object} data - 버킷과 태스크 데이터를 포함한 객체
   * @returns {Promise<Object>} 생성된 버킷과 태스크 정보
   */
  createBucketWithTasks: async (data) => {
    try {
      const response = await apiService.post(
        '/project-task-buckets/with-tasks',
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Bucket with tasks creation error:', error);
      throw new Error(
        '버킷 및 태스크 생성 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 프로젝트와 전체 구조 조회 (Strapi 5.x documentId 방식)
   * @param {string|number} projectId - 프로젝트 ID
   * @returns {Promise<Object>} 프로젝트, 버킷, 태스크 정보를 포함한 객체
   */
  getProjectWithStructure: async (projectId) => {
    try {
      // Strapi 5.x에서는 documentId로 쿼리 필요
      const query = qs.stringify(
        {
          // documentId 방식 사용
          documentId: projectId,
          populate: {
            buckets: {
              sort: ['position:asc'],
              populate: {
                tasks: {
                  sort: ['position:asc'],
                },
              },
            },
          },
        },
        { encodeValuesOnly: true },
      );

      const response = await apiService.get(`/projects?${query}`);
      // 단일 항목 반환을 위해 첫 번째 항목만 반환
      return response.data && response.data.length > 0
        ? response.data[0]
        : null;
    } catch (error) {
      console.error('Project structure fetch error:', error);
      throw new Error(
        '프로젝트 구조 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },
};

export default projectBucketService;
