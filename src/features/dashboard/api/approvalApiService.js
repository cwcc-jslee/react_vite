// src/features/dashboard/api/approvalApiService.js
/**
 * 승인 관련 API 서비스
 * - apiClientV2 사용 (camelCase ↔ snake_case 자동 변환)
 */

import { apiClientV2 } from '../../../shared/api/apiClientV2';
import { CLOSURE_STATUS_ID } from '../hooks/useClosureForm';
import dayjs from 'dayjs';

/**
 * API 에러를 사용자 친화적 메시지로 변환
 * @param {Error} error - 원본 에러
 * @param {string} defaultMessage - 기본 메시지
 * @returns {Error} 변환된 에러
 */
const handleApiError = (error, defaultMessage) => {
  // HTTP 상태 코드별 메시지
  if (error.response?.status === 403) {
    return new Error('권한이 없습니다. 관리자에게 문의하세요.');
  }
  if (error.response?.status === 404) {
    return new Error('요청한 데이터를 찾을 수 없습니다.');
  }
  if (error.response?.status === 409) {
    return new Error('이미 처리된 요청입니다.');
  }
  if (error.response?.status >= 500) {
    return new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }

  // Strapi 에러 메시지
  const strapiMessage = error.response?.data?.error?.message;
  if (strapiMessage) {
    return new Error(strapiMessage);
  }

  return new Error(error.message || defaultMessage);
};

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
      throw handleApiError(error, '승인 대기 목록 조회에 실패했습니다.');
    }
  },

  /**
   * 승인 대기 건 상세 조회
   * @param {string} projectDocumentId - 프로젝트 documentId
   * @returns {Promise} 프로젝트 및 상태 변경 이력 상세
   */
  getApprovalDetail: async (projectDocumentId) => {
    try {
      // params는 snake_case로 작성 (Strapi API 필터)
      const response = await apiClientV2.get(`/projects/${projectDocumentId}`, {
        params: {
          populate: {
            pjt_status: true,
            project_status_changes: {
              populate: {
                from_status: true,
                to_status: true,
                requested_by: true,
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
      throw handleApiError(error, '승인 상세 조회에 실패했습니다.');
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
    closureData = null,
  ) => {
    let statusChangeUpdated = false;
    let projectUpdated = false;

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
      statusChangeUpdated = true;

      // 2. 프로젝트 상태 업데이트 (실제 상태 변경)
      const projectUpdateData = {
        pjtStatus: toStatusId,
        currentApprovalStatus: 'approved',
      };

      // 종료 상태로 전환 시 isClosed 플래그 설정
      const isClosingStatus = toStatusId === CLOSURE_STATUS_ID;
      if (isClosingStatus) {
        projectUpdateData.isClosed = true;
      }

      await apiClientV2.put(`/projects/${projectDocumentId}`, {
        data: projectUpdateData,
      });
      projectUpdated = true;

      // 3. 종료 상태일 때 project_closures 테이블에 종료 정보 생성
      if (isClosingStatus && closureData) {
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

      // 롤백 시도 (상태 변경 이력이 업데이트된 경우)
      if (statusChangeUpdated && !projectUpdated) {
        try {
          await apiClientV2.put(
            `/project-status-changes/${statusChangeDocumentId}`,
            {
              data: {
                approvalStatus: 'pending',
                approvedAt: null,
                approvedBy: null,
                approvalComment: null,
              },
            },
          );
          console.log('승인 처리 롤백 완료');
        } catch (rollbackError) {
          console.error('롤백 실패:', rollbackError);
        }
      }

      throw handleApiError(error, '승인 처리에 실패했습니다.');
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
    if (!approvalComment?.trim()) {
      throw new Error('반려 사유를 입력해주세요.');
    }

    let statusChangeUpdated = false;

    try {
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
      statusChangeUpdated = true;

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

      // 롤백 시도
      if (statusChangeUpdated) {
        try {
          await apiClientV2.put(
            `/project-status-changes/${statusChangeDocumentId}`,
            {
              data: {
                approvalStatus: 'pending',
                approvedAt: null,
                approvedBy: null,
                approvalComment: null,
              },
            },
          );
          console.log('반려 처리 롤백 완료');
        } catch (rollbackError) {
          console.error('롤백 실패:', rollbackError);
        }
      }

      throw handleApiError(error, '반려 처리에 실패했습니다.');
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
      throw handleApiError(error, '대시보드 통계 조회에 실패했습니다.');
    }
  },
};
