// src/features/dashboard/hooks/useApprovalActions.js
/**
 * 승인/반려 액션 처리 훅
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { approvalApiService } from '../api/approvalApiService';
import { notification } from '../../../shared/services/notification';

export const useApprovalActions = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 승인 처리
   * @param {string} projectDocumentId - 프로젝트 documentId
   * @param {string} statusChangeDocumentId - 상태 변경 이력 documentId
   * @param {number} toStatusId - 변경할 상태 ID
   * @param {string} approvalComment - 승인 의견
   * @param {object} closureData - 종료 정보 (종료 상태일 때)
   */
  const handleApprove = async (projectDocumentId, statusChangeDocumentId, toStatusId, approvalComment = null, closureData = null) => {
    try {
      setIsProcessing(true);

      await approvalApiService.approveStatusChange(
        projectDocumentId,
        statusChangeDocumentId,
        toStatusId,
        currentUser?.user?.id,
        approvalComment,
        closureData
      );

      notification.success({
        message: '승인 완료',
        description: '상태 변경이 승인되어 프로젝트 상태가 업데이트되었습니다.',
      });

      // 캐시 무효화 (대시보드 통계, 승인 목록)
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      return { success: true };
    } catch (error) {
      notification.error({
        message: '승인 실패',
        description: error.message || '승인 처리 중 오류가 발생했습니다.',
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 반려 처리
   * @param {string} projectDocumentId - 프로젝트 documentId
   * @param {string} statusChangeDocumentId - 상태 변경 이력 documentId
   * @param {string} approvalComment - 반려 사유
   */
  const handleReject = async (projectDocumentId, statusChangeDocumentId, approvalComment) => {
    try {
      if (!approvalComment?.trim()) {
        notification.warning({
          message: '반려 사유 입력 필요',
          description: '반려 사유를 입력해주세요.',
        });
        return { success: false };
      }

      setIsProcessing(true);

      await approvalApiService.rejectStatusChange(
        projectDocumentId,
        statusChangeDocumentId,
        currentUser?.user?.id,
        approvalComment
      );

      notification.success({
        message: '반려 완료',
        description: '상태 변경이 반려되었습니다.',
      });

      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      return { success: true };
    } catch (error) {
      notification.error({
        message: '반려 실패',
        description: error.message || '반려 처리 중 오류가 발생했습니다.',
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleApprove,
    handleReject,
  };
};
