// src/features/dashboard/components/approval/ApprovalDetailDrawer.jsx
/**
 * 승인 상세 Drawer
 * - 프로젝트 정보, 상태 변경 내역, 승인/반려 버튼
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';
import StatusChangeSummary from './StatusChangeSummary';
import ReviewForm from './ReviewForm';
import ApprovalActionButtons from './ApprovalActionButtons';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { notification } from '../../../../shared/services/notification';

const ApprovalDetailDrawer = ({ approval, onClose }) => {
  const { isProcessing, handleApprove, handleReject } = useApprovalActions();
  const { data: codebooks } = useCodebook(['pjtClosureType']);
  const [approvalComment, setApprovalComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // 종료 상태 관련 state
  const [closureDate, setClosureDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [pjtClosureType, setPjtClosureType] = useState('');

  if (!approval || !approval.pendingStatusChange) {
    return null;
  }

  const { id, name, documentId, pendingStatusChange } = approval;
  const { fromStatus, toStatus, requestedBy, requestedAt, statusDetail, changeDescription } =
    pendingStatusChange;

  // 종료 상태 여부 확인 (toStatus.id === 90)
  const isClosingStatus = useMemo(() => toStatus?.id === 90, [toStatus]);

  const handleApproveClick = async () => {
    // 종료 상태인데 종료 유형이 없으면 경고
    if (isClosingStatus && !pjtClosureType) {
      notification.warning({
        message: '종료 유형 선택 필요',
        description: '프로젝트 종료 유형을 선택해주세요.',
      });
      return;
    }

    // 종료 정보 준비
    const closureData = isClosingStatus
      ? {
          projectId: id, // 프로젝트 ID
          closureDate,
          closureType: pjtClosureType ? parseInt(pjtClosureType) : null,
        }
      : null;

    const result = await handleApprove(
      documentId,
      pendingStatusChange.documentId,
      toStatus.id,
      approvalComment || null,
      closureData
    );

    if (result.success) {
      onClose();
    }
  };

  const handleRejectClick = async () => {
    if (!showRejectForm) {
      setShowRejectForm(true);
      return;
    }

    const result = await handleReject(
      documentId,
      pendingStatusChange.documentId,
      approvalComment
    );

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">승인 요청 상세</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 내용 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 프로젝트 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">프로젝트 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    프로젝트명
                  </label>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                </div>
              </div>
            </div>

            {/* 상태 변경 요약 */}
            <StatusChangeSummary
              fromStatus={fromStatus}
              toStatus={toStatus}
              statusDetail={statusDetail}
              changeDescription={changeDescription}
            />

            {/* 요청 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">요청 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>요청자: {requestedBy?.username || '알 수 없음'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>요청일: {dayjs(requestedAt).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* 종료 정보 입력 (종료 상태로 전환 시에만 표시) */}
            {isClosingStatus && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">종료 정보</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                  {/* 종료 유형 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pjtClosureType}
                      onChange={(e) => setPjtClosureType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">선택하세요</option>
                      {codebooks?.pjtClosureType?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 종료 일자 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 일자
                    </label>
                    <input
                      type="date"
                      value={closureDate}
                      onChange={(e) => setClosureDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-start gap-2 text-xs text-red-700">
                    <span className="font-semibold">⚠</span>
                    <p>프로젝트를 종료하면 더 이상 상태를 변경할 수 없습니다.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 승인 의견 폼 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">승인 의견</h3>
              <ReviewForm
                onCommentChange={setApprovalComment}
                isReject={showRejectForm}
              />
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="border-t border-gray-200 px-6 py-4">
            {showRejectForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleRejectClick}
                  disabled={isProcessing || !approvalComment.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '처리중...' : '반려 확정'}
                </button>
              </div>
            ) : (
              <ApprovalActionButtons
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ApprovalDetailDrawer.propTypes = {
  approval: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    documentId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    pendingStatusChange: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fromStatus: PropTypes.object,
      toStatus: PropTypes.object,
      requestedBy: PropTypes.object,
      requestedAt: PropTypes.string,
      statusDetail: PropTypes.string,
      changeDescription: PropTypes.string,
    }).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ApprovalDetailDrawer;
