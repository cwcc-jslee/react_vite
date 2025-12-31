// src/features/dashboard/api/approvalApiService.js
/**
 * 승인 관련 API 서비스
 * - apiClientV2 사용 (camelCase ↔ snake_case 자동 변환)
 */

import { apiClientV2 } from '../../../shared/api/apiClientV2';
import dayjs from 'dayjs';

export const approvalApiService = {
  /**
   * 승인 대기 목록 조회
   * @returns {Promise} 승인 대기 중인 project_status_changes 목록
   */
  getApprovalPendingList: async () => {
    try {
      // projects 테이블에서 current_approval_status가 'pending'인 항목 조회
      // params는 snake_case로 작성 (Strapi API 필터)
      const response = await apiClientV2.get('/projects', {
        params: {
          filters: {
            current_approval_status: {
              $eq: 'pending',
            },
          },
          populate: {
            pjt_status: {
              fields: ['name', 'code'],
            },
            customer: {
              fields: ['name'],
            },
            project_status_changes: {
              sort: ['id:desc'],
              populate: {
                from_status: {
                  fields: ['name', 'code'],
                },
                to_status: {
                  fields: ['name', 'code'],
                },
                requested_by: true,
              },
            },
          },
          sort: ['id:desc'],
        },
      });

      // 각 프로젝트에서 pending 상태인 status change를 찾아 pendingStatusChange로 매핑
      const processedData =
        response.data?.data?.map((project) => ({
          ...project,
          pendingStatusChange: project.projectStatusChanges?.find(
            (change) => change.approvalStatus === 'pending',
          ),
        })) || [];

      return {
        ...response.data,
        data: processedData,
      };
    } catch (error) {
      console.error('승인 대기 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 승인 대기 건 상세 조회
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise} 프로젝트 및 상태 변경 이력 상세
   */
  getApprovalDetail: async (projectId) => {
    try {
      // params는 snake_case로 작성 (Strapi API 필터)
      const response = await apiClientV2.get(`/projects/${projectId}`, {
        params: {
          populate: {
            pjt_status: true,
            pending_status_change: {
              populate: {
                from_status: true,
                to_status: true,
                requested_by: {
                  populate: {
                    user: true,
                  },
                },
              },
            },
            users: {
              populate: {
                user: true,
              },
            },
            project_tasks: {
              populate: {
                project_task_bucket: true,
              },
            },
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error('승인 상세 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 상태 변경 승인 처리
   * @param {string} projectDocumentId - 프로젝트 documentId
   * @param {string} statusChangeDocumentId - 상태 변경 이력 documentId
   * @param {number} toStatusId - 변경할 상태 ID
   * @param {string} approvedBy - 승인자 ID
   * @param {string} approvalComment - 승인 의견 (선택)
   * @param {object} closureData - 종료 정보 (종료 상태일 때, 선택)
   * @param {number} closureData.projectId - 프로젝트 ID
   * @param {string} closureData.closureDate - 종료 일자
   * @param {number} closureData.closureType - 종료 유형 ID
   * @returns {Promise}
   */
  approveStatusChange: async (
    projectDocumentId,
    statusChangeDocumentId,
    toStatusId,
    approvedBy,
    approvalComment = null,
    closureData = null, // 종료 시 필요한 데이터 (projectId, closureDate, closureType)
  ) => {
    try {
      // 1. 상태 변경 이력 업데이트 (승인 완료)
      await apiClientV2.put(
        `/project-status-changes/${statusChangeDocumentId}`,
        {
          data: {
            approvalStatus: 'approved',
            approvedAt: dayjs().toISOString(),
            approvedBy: approvedBy,
            approvalComment: approvalComment,
          },
        },
      );

      // 2. 프로젝트 상태 업데이트 (실제 상태 변경)
      const projectUpdateData = {
        pjtStatus: toStatusId,
        currentApprovalStatus: 'approved',
      };

      // 종료 상태(90)로 전환 시 isClosed 플래그 설정
      if (toStatusId === 90) {
        projectUpdateData.isClosed = true;
      }

      await apiClientV2.put(`/projects/${projectDocumentId}`, {
        data: projectUpdateData,
      });

      // 3. 종료 상태일 때 project_closures 테이블에 종료 정보 생성
      if (toStatusId === 90 && closureData) {
        await apiClientV2.post('/project-closures', {
          data: {
            project: closureData.projectId,
            closureType: closureData.closureType,
            closureDate: closureData.closureDate,
            closureBy: approvedBy,
          },
        });
      }

      return {
        success: true,
        message: '상태 변경이 승인되었습니다.',
      };
    } catch (error) {
      console.error('승인 처리 실패:', error);
      throw error;
    }
  },

  /**
   * 상태 변경 반려 처리
   * @param {string} projectDocumentId - 프로젝트 documentId
   * @param {string} statusChangeDocumentId - 상태 변경 이력 documentId
   * @param {string} approvedBy - 승인자 ID (반려도 승인자가 처리)
   * @param {string} approvalComment - 반려 사유 (필수)
   * @returns {Promise}
   */
  rejectStatusChange: async (
    projectDocumentId,
    statusChangeDocumentId,
    approvedBy,
    approvalComment,
  ) => {
    try {
      if (!approvalComment) {
        throw new Error('반려 사유를 입력해주세요.');
      }

      // 1. 상태 변경 이력 업데이트 (반려)
      await apiClientV2.put(
        `/project-status-changes/${statusChangeDocumentId}`,
        {
          data: {
            approvalStatus: 'rejected',
            approvedAt: dayjs().toISOString(),
            approvedBy: approvedBy,
            approvalComment: approvalComment,
          },
        },
      );

      // 2. 프로젝트 승인 상태 초기화 (상태는 변경하지 않음)
      await apiClientV2.put(`/projects/${projectDocumentId}`, {
        data: {
          currentApprovalStatus: 'rejected',
        },
      });

      return {
        success: true,
        message: '상태 변경이 반려되었습니다.',
      };
    } catch (error) {
      console.error('반려 처리 실패:', error);
      throw error;
    }
  },

  /**
   * 대시보드 통계 조회 (진행 중, 완료 프로젝트 수)
   * 승인 대기 수는 getApprovalPendingList에서 조회하므로 중복 제거
   * @returns {Promise} 진행 중, 완료 프로젝트 수
   */
  getDashboardStats: async () => {
    try {
      // 병렬로 두 가지 통계 조회 (승인 대기는 제외)
      // params는 snake_case로 작성 (Strapi API 필터)
      const [inProgressResponse, completedResponse] = await Promise.all([
        // 진행 중
        apiClientV2.get('/projects', {
          params: {
            filters: {
              pjt_status: { name: { $eq: '진행중' } },
            },
            pagination: { pageSize: 1 },
          },
        }),
        // 완료
        apiClientV2.get('/projects', {
          params: {
            filters: {
              pjt_status: { name: { $eq: '종료' } },
            },
            pagination: { pageSize: 1 },
          },
        }),
      ]);

      return {
        inProgress: inProgressResponse.data?.meta?.pagination?.total || 0,
        completed: completedResponse.data?.meta?.pagination?.total || 0,
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      throw error;
    }
  },
};
