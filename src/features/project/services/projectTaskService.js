// src/features/project/services/projectTaskService.js
/**
 * 프로젝트 태스크 관련 API 서비스
 * 태스크의 생성, 조회, 수정, 삭제 등의 기능을 제공합니다.
 */

import { apiService } from '../../../shared/api/apiService';
import qs from 'qs';

/**
 * 프로젝트 태스크 API 서비스
 */
export const projectTaskService = {
  /**
   * 새 태스크 생성
   * @param {Object} taskData - 태스크 데이터 (project_id, bucket_id 포함)
   * @returns {Promise<Object>} 생성된 태스크 객체
   */
  createTask: async (taskData) => {
    try {
      const response = await apiService.post('/project-tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Task creation error:', error);
      throw new Error(
        '태스크 생성 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크 상세 조회
   * @param {string|number} taskId - 태스크 ID
   * @returns {Promise<Object>} 태스크 객체
   */
  getTask: async (taskId) => {
    try {
      const response = await apiService.get(`/project-tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Task fetch error:', error);
      throw new Error(
        '태스크 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 버킷의 모든 태스크 조회
   * @param {string|number} bucketId - 버킷 ID
   * @returns {Promise<Array>} 태스크 객체 배열
   */
  getBucketTasks: async (bucketId) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            bucket: { id: { $eq: bucketId } },
          },
          sort: ['position:asc'],
        },
        { encodeValuesOnly: true },
      );

      const response = await apiService.get(`/project-tasks?${query}`);
      return response.data;
    } catch (error) {
      console.error('Bucket tasks fetch error:', error);
      throw new Error(
        '버킷 태스크 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 프로젝트의 모든 태스크 조회
   * @param {string|number} projectId - 프로젝트 ID
   * @returns {Promise<Array>} 태스크 객체 배열
   */
  getProjectTasks: async (projectId) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            project: { id: { $eq: projectId } },
          },
          sort: ['bucket.position:asc', 'position:asc'],
          populate: ['bucket'],
        },
        { encodeValuesOnly: true },
      );

      const response = await apiService.get(`/project-tasks?${query}`);
      return response.data;
    } catch (error) {
      console.error('Project tasks fetch error:', error);
      throw new Error(
        '프로젝트 태스크 조회 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크 수정
   * @param {string|number} taskId - 태스크 ID
   * @param {Object} taskData - 수정할 태스크 데이터
   * @returns {Promise<Object>} 수정된 태스크 객체
   */
  updateTask: async (taskId, taskData) => {
    try {
      const response = await apiService.put(
        `/project-tasks/${taskId}`,
        taskData,
      );
      return response.data;
    } catch (error) {
      console.error('Task update error:', error);
      throw new Error(
        '태스크 수정 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크 삭제
   * @param {string|number} taskId - 삭제할 태스크 ID
   * @returns {Promise<Object>} 응답 객체
   */
  deleteTask: async (taskId) => {
    try {
      const response = await apiService.delete(`/project-tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Task deletion error:', error);
      throw new Error(
        '태스크 삭제 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크 순서 변경
   * @param {string|number} bucketId - 버킷 ID
   * @param {Array} tasksOrder - 태스크 ID와 새 position을 포함한 객체 배열
   * @returns {Promise<Object>} 응답 객체
   */
  updateTasksOrder: async (bucketId, tasksOrder) => {
    try {
      const payload = {
        bucket_id: bucketId,
        tasks: tasksOrder,
      };

      const response = await apiService.patch(`/project-tasks/order`, payload);
      return response.data;
    } catch (error) {
      console.error('Tasks order update error:', error);
      throw new Error(
        '태스크 순서 변경 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크를 다른 버킷으로 이동
   * @param {string|number} taskId - 태스크 ID
   * @param {string|number} targetBucketId - 대상 버킷 ID
   * @param {number} position - 새로운 위치 (선택적)
   * @returns {Promise<Object>} 이동된 태스크 객체
   */
  moveTaskToBucket: async (taskId, targetBucketId, position = null) => {
    try {
      const payload = {
        bucket_id: targetBucketId,
      };

      if (position !== null) {
        payload.position = position;
      }

      const response = await apiService.patch(
        `/project-tasks/${taskId}/move`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error('Task move error:', error);
      throw new Error(
        '태스크 이동 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 대량 태스크 생성
   * @param {string|number} bucketId - 버킷 ID
   * @param {Array} tasks - 태스크 데이터 배열
   * @returns {Promise<Array>} 생성된 태스크 객체 배열
   */
  createBulkTasks: async (bucketId, tasks) => {
    try {
      const payload = {
        bucket_id: bucketId,
        tasks: tasks,
      };

      const response = await apiService.post('/project-tasks/bulk', payload);
      return response.data;
    } catch (error) {
      console.error('Bulk tasks creation error:', error);
      throw new Error(
        '대량 태스크 생성 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },

  /**
   * 태스크 프로그레스 업데이트
   * @param {string|number} taskId - 태스크 ID
   * @param {number} progress - 진행률 값 (0-100)
   * @returns {Promise<Object>} 업데이트된 태스크 객체
   */
  updateTaskProgress: async (taskId, progress) => {
    try {
      const payload = {
        task_progress: progress,
      };

      const response = await apiService.patch(
        `/project-tasks/${taskId}/progress`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error('Task progress update error:', error);
      throw new Error(
        '태스크 진행률 업데이트 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },
};

export default projectTaskService;
