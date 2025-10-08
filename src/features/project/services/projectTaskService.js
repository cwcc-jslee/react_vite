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
   * 새 태스크 생성
   * taskScheduleType: true -> 'scheduled', false -> 'ongoing' 변환 처리
   *
   * @param {Object} taskData - 태스크 데이터 (project_id, bucket_id 포함)
   * @returns {Promise<Object>} 생성된 태스크 객체
   */
  createTask: async (taskData) => {
    try {
      // taskScheduleType 변환 처리 (boolean -> string)
      let processedData = { ...taskData };

      // 문자열이 아닌 boolean 값이 들어온 경우 처리
      if (typeof processedData.task_schedule_type === 'boolean') {
        processedData.task_schedule_type = processedData.task_schedule_type
          ? 'scheduled'
          : 'ongoing';
      }

      const response = await apiService.post('/project-tasks', processedData);
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
   * taskScheduleType: true -> 'scheduled', false -> 'ongoing' 변환 처리
   *
   * @param {string|number} taskId - 태스크 ID
   * @param {Object} taskData - 수정할 태스크 데이터
   * @returns {Promise<Object>} 수정된 태스크 객체
   */
  updateTask: async (taskId, taskData) => {
    try {
      // taskScheduleType 변환 처리 (boolean -> string)
      let processedData = { ...taskData };

      // 문자열이 아닌 boolean 값이 들어온 경우 처리
      // if (typeof processedData.task_schedule_type === 'boolean') {
      //   processedData.task_schedule_type = processedData.task_schedule_type
      //     ? 'scheduled'
      //     : 'ongoing';
      // }

      const response = await apiService.put(
        `/project-tasks/${taskId}`,
        processedData,
      );
      return response.data;
    } catch (error) {
      console.error('Task update error:', error);
      throw new Error(
        '태스크 수정 실패: ' + (error.message || '알 수 없는 오류'),
      );
    }
  },
};

export default projectTaskService;
