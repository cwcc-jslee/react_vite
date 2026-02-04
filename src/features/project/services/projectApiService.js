/**
 * 프로젝트 서비스 - API 통신 및 데이터 처리를 담당
 * 프로젝트 CRUD 작업과 관련된 모든 API 호출 및 데이터 변환을 처리합니다.
 *
 * @version 2.0.0
 * @filename src/features/project/services/projectService.js
 *
 * @changes v2.0.0
 * - apiClientV2 적용 (camelCase ↔ snake_case 자동 변환)
 */

import { apiClient } from '../../../shared/api/apiClient';
import { apiClientV2 } from '../../../shared/api/apiClientV2';
import { handleApiError } from '../../../shared/api/errorHandlers';
import {
  buildProjectListQuery,
  buildProjectListNameQuery,
  buildProjectDetailQuery,
  buildProjectTaskListQuery,
  buildProjectScheduleStatusQuery,
} from '../api/queries';
import { normalizeResponse } from '../../../shared/api/normalize';
import qs from 'qs';

export const projectApiService = {
  /**
   * 프로젝트트 목록 조회
   * @param {Object} params - 검색 파라미터
   */
  getProjectList: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectListQuery(params);
      const response = await apiClientV2.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트트 목록 조회
   * @param {Object} params - 검색 파라미터
   * 프로젝트 이름 조회
   */
  getProjectListName: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectListNameQuery(params);
      const response = await apiClientV2.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '프로젝트 이름을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 시간상태 조회
   */
  getProjectScheduleStatus: async (params) => {
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectScheduleStatusQuery(params);
      const response = await apiClientV2.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * SFA ID로 연계된 프로젝트 목록 조회
   * @param {number} sfaId - SFA ID
   */
  getProjectsBySfaId: async (sfaId) => {
    try {
      const query = buildProjectListQuery({
        filters: {
          sfa: { id: { $eq: sfaId } },
        },
        pagination: { current: 1, pageSize: 100 },
      });
      const response = await apiClientV2.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      handleApiError(error, '연계 프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 상세 조회
   * @param {Object} id - 검색 파라미터
   */
  getProjectDetail: async (projectId) => {
    console.log(`>>>> getProjectDetail : `, projectId);
    try {
      // 쿼리 생성 및 API 호출
      const query = buildProjectDetailQuery(projectId);
      const response = await apiClientV2.get(`/projects?${query}`);

      return normalizeResponse(response);
    } catch (error) {
      console.error(error);
      handleApiError(error, '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트트 Task 템플릿 조회
   */
  getTaskTemplate: async (templateId = null) => {
    try {
      let query;

      if (templateId === null) {
        // 템플릿 ID가 없을 때: 템플릿 목록 조회
        query = qs.stringify(
          {
            filters: {
              is_deleted: { $eq: false },
            },
            fields: ['name'],
            sort: ['sort:asc'],
          },
          { encodeValuesOnly: true },
        );
      } else {
        // 템플릿 ID가 있을 때: 특정 템플릿 상세 정보 조회
        query = qs.stringify(
          {
            filters: {
              id: { $eq: templateId },
              // is_deleted: { $eq: false },
            },
            fields: ['name', 'structure'],
          },
          { encodeValuesOnly: true },
        );
      }

      const response = await apiClient.get(`/codebook-project-tasks?${query}`);
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        '프로젝트 템플릿을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * 새 프로젝트 생성
   * @param {Object} projectData - 저장할 프로젝트 데이터
   * @returns {Promise} API 응답 Promise
   */
  createProject: async (projectData) => {
    try {
      const response = await apiClientV2.post('/projects', { data: projectData });
      return response.data;
    } catch (error) {
      handleApiError(error, '프로젝트 생성 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 수정
   * @param {Object} id - 수정할 프로젝트 ID
   * @param {Object} projectData - 수정할 프로젝트 데이터
   * @returns {Promise} API 응답 Promise
   */
  updateProject: async (id, formData) => {
    try {
      const response = await apiClientV2.put(`/projects/${id}`, { data: formData });
      return response.data;
    } catch (error) {
      handleApiError(error, '프로젝트 수정 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 종료 정보 생성
   * @param {Object} closureData - 종료 정보 데이터 (project, closureType)
   * @returns {Promise} API 응답 Promise
   */
  createProjectClosure: async (closureData) => {
    try {
      const response = await apiClientV2.post('/project-closures', { data: closureData });
      return response.data;
    } catch (error) {
      handleApiError(error, '프로젝트 종료 정보 생성 중 오류가 발생했습니다.');
    }
  },

  /**
   * 프로젝트 상태 변경 이력 생성
   * @param {Object} statusChangeData - 상태 변경 이력 데이터
   * @param {number} statusChangeData.project - 프로젝트 ID
   * @param {number} statusChangeData.fromStatus - 이전 상태 ID
   * @param {number} statusChangeData.toStatus - 변경 상태 ID
   * @param {string} statusChangeData.statusDetail - 상태 세부 내용 (선택)
   * @param {number} statusChangeData.requestedBy - 요청자 ID
   * @param {string} statusChangeData.requestedAt - 요청 시간 (ISO 8601)
   * @param {string} statusChangeData.changeDescription - 변경 사유 (선택)
   * @returns {Promise} API 응답 Promise
   *
   * @example
   * createProjectStatusChange({
   *   project: 123,
   *   fromStatus: 88,
   *   toStatus: 87,
   *   statusDetail: '1차 수정반영',
   *   requestedBy: 1,
   *   requestedAt: '2025-12-29T10:30:00Z',
   *   changeDescription: '고객 요청사항 반영'
   * })
   */
  createProjectStatusChange: async (statusChangeData) => {
    try {
      const response = await apiClientV2.post(
        '/project-status-changes',
        { data: statusChangeData },
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error,
        '프로젝트 상태 변경 이력 생성 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * 프로젝트 상태 변경 이력 조회
   * @param {number} projectId - 프로젝트 ID
   * @returns {Promise} API 응답 Promise
   */
  getProjectStatusChanges: async (projectId) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            project: { id: { $eq: projectId } },
          },
          fields: [
            'name',
            'status_detail',
            'approval_status',
            'requested_at',
            'approved_at',
            'change_description',
          ],
          populate: {
            from_status: {
              fields: ['name', 'code'],
            },
            to_status: {
              fields: ['name', 'code'],
            },
            requested_by: {
              fields: ['username', 'email'],
            },
            approved_by: {
              fields: ['username', 'email'],
            },
          },
          sort: ['id:desc'], // ID 기준 최신순 정렬
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClientV2.get(
        `/project-status-changes?${query}`,
      );
      return normalizeResponse(response);
    } catch (error) {
      handleApiError(
        error,
        '프로젝트 상태 변경 이력을 불러오는 중 오류가 발생했습니다.',
      );
    }
  },

  /**
   * 프로젝트 상태 변경 승인/거부 처리
   * @param {number} projectId - 프로젝트 ID
   * @param {number} statusChangeId - 상태 변경 이력 ID
   * @param {string} decision - 'approved' 또는 'rejected'
   * @param {number} approvedBy - 승인자 ID
   * @returns {Promise} API 응답 Promise
   */
  approveStatusChange: async (projectId, statusChangeId, decision, approvedBy) => {
    try {
      // 1. 상태 변경 이력의 승인 상태 업데이트
      const statusChangeUpdateData = {
        approvalStatus: decision,
        approvedAt: new Date().toISOString(),
        approvedBy: approvedBy,
      };

      await apiClientV2.put(
        `/project-status-changes/${statusChangeId}`,
        { data: statusChangeUpdateData }
      );

      // 2. 상태 변경 이력 조회 (toStatus 정보 필요)
      const statusChangeResponse = await apiClientV2.get(
        `/project-status-changes/${statusChangeId}?populate=toStatus`
      );
      const statusChange = statusChangeResponse.data.data;

      // 3. 프로젝트 업데이트
      if (decision === 'approved') {
        // 승인: 실제 상태 변경
        const projectUpdateData = {
          pjtStatus: statusChange.toStatus.id,
          currentApprovalStatus: 'approved',
        };

        // 종료 상태인 경우 isClosed 추가
        if (statusChange.toStatus.name === '종료') {
          projectUpdateData.isClosed = true;
        }

        await apiClientV2.put(`/projects/${projectId}`, { data: projectUpdateData });
      } else {
        // 거부: 승인 상태만 초기화
        const projectUpdateData = {
          currentApprovalStatus: 'rejected',
        };

        await apiClientV2.put(`/projects/${projectId}`, { data: projectUpdateData });
      }

      return { success: true, decision };
    } catch (error) {
      handleApiError(error, '승인 처리 중 오류가 발생했습니다.');
    }
  },
};
