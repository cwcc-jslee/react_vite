// src/features/dashboard/components/approval/ApprovalDetailDrawer.jsx
/**
 * 승인 상세 Drawer
 * - 프로젝트 정보, 상태 변경 내역, 승인/반려 버튼
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, User, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import ReviewForm from './ReviewForm';
import ApprovalActionButtons from './ApprovalActionButtons';
import ProjectEfficiencyCard from './ProjectEfficiencyCard';
import RejectConfirmModal from './RejectConfirmModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useClosureForm } from '../../hooks/useClosureForm';
import { notification } from '../../../../shared/services/notification';
import { buildApprovalDetailQuery } from '../../api/queries';
import { APPROVAL_COLORS, TRANSITION_CLASSES, getApprovalTypeStyle } from '../../constants/approvalStyleConstants';
import { getProjectTypeInfo, getWorkTypeInfo } from '@features/project/constants/projectTypeConstants';
import { getStatusColorByKey, PROJECT_STATUS_LABEL_TO_KEY } from '@features/project/constants/projectStatusConstants';

const ApprovalDetailDrawer = ({ approval, onClose }) => {
  const { isProcessing, handleApprove, handleReject } = useApprovalActions();
  const [approvalComment, setApprovalComment] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 승인 대기 상세 정보 조회 (추가 데이터: 매출이익, 상세 태스크 등)
  const { data: projectDetail, isLoading: isDetailLoading } = useQuery(
    buildApprovalDetailQuery(approval?.documentId)
  );

  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isRejectModalOpen) {
        onClose();
      }
    },
    [onClose, isRejectModalOpen]
  );

  // 애니메이션 및 키보드 이벤트 처리
  useEffect(() => {
    setIsVisible(true);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!approval || !approval.pendingStatusChange) {
    return null;
  }

  const { id, name, documentId, pendingStatusChange } = approval;
  const { fromStatus, toStatus, requestedBy, requestedAt, statusDetail, changeDescription } =
    pendingStatusChange;

  // 종료 폼 관리 (useClosureForm 훅 사용)
  const closure = useClosureForm(toStatus?.id);

  const handleApproveClick = async () => {
    // 종료 상태인데 종료 유형이 없으면 경고
    if (closure.isClosingStatus && !closure.isValid) {
      notification.warning({
        message: '종료 유형 선택 필요',
        description: '프로젝트 종료 유형을 선택해주세요.',
      });
      return;
    }

    const result = await handleApprove(
      documentId,
      pendingStatusChange.documentId,
      toStatus.id,
      approvalComment || null,
      closure.getClosureData(id)
    );

    if (result.success) {
      onClose();
    }
  };

  const handleRejectClick = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (rejectReason) => {
    const result = await handleReject(
      documentId,
      pendingStatusChange.documentId,
      rejectReason
    );

    if (result.success) {
      setIsRejectModalOpen(false);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* 배경 오버레이 */}
        <div
          className={`absolute inset-0 ${APPROVAL_COLORS.background.overlay} ${TRANSITION_CLASSES.slow} ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={`
            absolute right-0 top-0 h-full w-full max-w-xl lg:max-w-2xl
            bg-white shadow-2xl
            transform ${TRANSITION_CLASSES.slow} ease-out
            ${isVisible ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
                승인 요청 상세
              </h2>
              <button
                onClick={onClose}
                className={`
                  p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100
                  ${TRANSITION_CLASSES.fast}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                `}
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 내용 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 프로젝트 정보 */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800">프로젝트 정보</h3>
                  {/* 배지 영역 */}
                  <div className="flex items-center gap-2">
                    {/* 승인 유형 배지 */}
                    {pendingStatusChange?.name && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getApprovalTypeStyle(pendingStatusChange.name).color}`}>
                        {getApprovalTypeStyle(pendingStatusChange.name).label}
                      </span>
                    )}
                    {/* 프로젝트/작업 유형 배지 (로딩 완료 시) */}
                    {projectDetail?.data && (
                      <>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getProjectTypeInfo(projectDetail.data.projectType).colorClass}`}>
                          {getProjectTypeInfo(projectDetail.data.projectType).label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getWorkTypeInfo(projectDetail.data.workType).colorClass}`}>
                          {getWorkTypeInfo(projectDetail.data.workType).label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`${APPROVAL_COLORS.background.section} rounded-xl p-5 space-y-3`}>
                  {/* 프로젝트명 */}
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-500">프로젝트명 : </span>
                    <span className="font-medium">'{name}'</span>
                  </p>
                  {/* 상태 변경 (1줄) */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">상태변경 : </span>
                    {fromStatus && (
                      <>
                        <span
                          className="px-2 py-0.5 text-xs font-medium rounded"
                          style={{
                            backgroundColor: getStatusColorByKey(PROJECT_STATUS_LABEL_TO_KEY[fromStatus.name])?.bgColor,
                            color: getStatusColorByKey(PROJECT_STATUS_LABEL_TO_KEY[fromStatus.name])?.color,
                          }}
                        >
                          {fromStatus.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </>
                    )}
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded"
                      style={{
                        backgroundColor: getStatusColorByKey(PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name])?.bgColor,
                        color: getStatusColorByKey(PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name])?.color,
                      }}
                    >
                      {toStatus?.name}
                    </span>
                  </div>
                  {/* 상태 세부 내용 (있을 경우) */}
                  {statusDetail && (
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">상세내용 : </span>
                      <span className="text-blue-700 font-medium">{statusDetail}</span>
                    </p>
                  )}
                  {/* 변경 사유 (있을 경우) */}
                  {changeDescription && (
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">변경사유 : </span>
                      {changeDescription}
                    </p>
                  )}
                </div>
              </section>

              {/* 효율성 분석 카드 (데이터 로딩 완료 시 표시) */}
              {isDetailLoading ? (
                <div className={`h-24 flex items-center justify-center ${APPROVAL_COLORS.background.section} rounded-xl`}>
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : projectDetail ? (
                <ProjectEfficiencyCard
                  project={projectDetail.data}
                  changeTypeName={approval.pendingStatusChange?.name}
                />
              ) : null}

              {/* 요청 정보 */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-3">요청 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">요청자:</span>
                    <span className="font-medium text-gray-900">{requestedBy?.username || '알 수 없음'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">요청일:</span>
                    <span className="font-medium text-gray-900">{dayjs(requestedAt).format('YYYY-MM-DD HH:mm')}</span>
                  </div>
                </div>
              </section>

              {/* 종료 정보 입력 (종료 상태로 전환 시에만 표시) */}
              {closure.isClosingStatus && (
                <section>
                  <h3 className="text-base font-semibold text-gray-800 mb-3">종료 정보</h3>
                  <div className={`${APPROVAL_COLORS.background.warning} rounded-xl p-5 space-y-5`}>
                    {/* 종료 유형 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료 유형 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={closure.closureTypeId}
                        onChange={(e) => closure.setClosureTypeId(e.target.value)}
                        className={`
                          w-full px-4 py-2.5 border border-gray-300 rounded-lg
                          text-sm
                          focus:ring-2 focus:ring-red-500 focus:border-transparent
                          ${TRANSITION_CLASSES.fast}
                        `}
                      >
                        <option value="">선택하세요</option>
                        {closure.closureTypes.map((type) => (
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
                        value={closure.closureDate}
                        onChange={(e) => closure.setClosureDate(e.target.value)}
                        className={`
                          w-full px-4 py-2.5 border border-gray-300 rounded-lg
                          text-sm
                          focus:ring-2 focus:ring-red-500 focus:border-transparent
                          ${TRANSITION_CLASSES.fast}
                        `}
                      />
                    </div>

                    <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-100 rounded-lg p-3">
                      <span className="font-bold text-red-600">!</span>
                      <p>프로젝트를 종료하면 더 이상 상태를 변경할 수 없습니다.</p>
                    </div>
                  </div>
                </section>
              )}

              {/* 승인 의견 폼 */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-3">승인 의견</h3>
                <ReviewForm onCommentChange={setApprovalComment} isReject={false} />
              </section>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
              <ApprovalActionButtons
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                isProcessing={isProcessing}
                disabled={closure.isClosingStatus && !closure.isValid}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 반려 확인 모달 */}
      <RejectConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />
    </>
  );
};

ApprovalDetailDrawer.propTypes = {
  approval: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    documentId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    pendingStatusChange: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      documentId: PropTypes.string,
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
