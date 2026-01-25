// src/features/project/components/drawer/tabs/ProjectStatusFlowTab.jsx
// 진행 플로우 탭 - 상태 플로우 및 빠른 변경

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  PROJECT_STATUS_FLOW,
  PROJECT_EXCEPTION_STATUS,
  PROJECT_STATUS_LABEL_TO_KEY,
  PROJECT_STATUS_TRANSITIONS,
  getStatusColorByKey,
  PROJECT_STATUS_DESCRIPTIONS,
  getStatusCodeByLabel,
} from '../../../constants/projectStatusConstants';
import ApprovalStatusBadge from '../../ui/ApprovalStatusBadge';
import { determineStatusChangeType } from '../../../constants/statusChangeTypeConstants';
import { useProjectUpdate } from '../../../hooks/useProjectUpdate';
import { useProjectStore } from '../../../hooks/useProjectStore';
import { useUiStore } from '../../../../../shared/hooks/useUiStore';
import { notification } from '../../../../../shared/services/notification';
import { projectApiService } from '../../../services/projectApiService';
import dayjs from 'dayjs';

const ProjectStatusFlowTab = ({ data }) => {
  const { actions: projectActions } = useProjectStore();
  const { actions: uiActions } = useUiStore();
  const currentUser = useSelector((state) => state.auth.user);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [formData, setFormData] = useState({
    statusDetail: '',
    changeDescription: '',
  });

  const currentStatus = data.pjtStatus?.name || '시작전';
  const isPending = data.currentApprovalStatus === 'pending';

  // 전환 가능한 상태 목록
  const availableTransitions = useMemo(() => {
    return PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
  }, [currentStatus]);

  // 상태 클릭 핸들러
  const handleStatusClick = (status) => {
    if (isPending) return; // 승인 대기 중이면 변경 불가
    if (status === currentStatus) return;

    const canTransition = availableTransitions.includes(status);
    if (!canTransition) return;

    setSelectedStatus(status);
    setFormData({
      statusDetail: '',
      changeDescription: '',
    });
  };

  // 빠른 변경 저장
  const handleQuickChange = async () => {
    try {
      const fromStatusCode = getStatusCodeByLabel(currentStatus);
      const toStatusCode = getStatusCodeByLabel(selectedStatus);

      // 1. 상태 변경 이력 생성 (승인 대기)
      let createdStatusChange = null;
      try {
        const statusChangeData = {
          project: data.id,
          name: determineStatusChangeType(currentStatus, selectedStatus), // 상태 변경 유형
          fromStatus: fromStatusCode,
          toStatus: toStatusCode,
          statusDetail: formData.statusDetail || null,
          requestedBy: currentUser?.user?.id || null,
          requestedAt: dayjs().toISOString(),
          changeDescription: formData.changeDescription || null,
          approvalStatus: 'pending', // 승인 대기
        };

        createdStatusChange = await projectApiService.createProjectStatusChange(statusChangeData);
        console.log('상태 변경 이력 생성 완료:', createdStatusChange);
      } catch (statusChangeError) {
        console.error('상태 변경 이력 생성 실패:', statusChangeError);
        throw new Error('상태 변경 이력 생성 중 오류가 발생했습니다.');
      }

      // 2. 프로젝트에 승인 대기 상태만 설정 (실제 상태는 변경하지 않음)
      const approvalUpdateData = {
        currentApprovalStatus: 'pending',
      };

      await projectApiService.updateProject(data.documentId, approvalUpdateData);

      notification.success({
        message: '상태 변경 요청 완료',
        description: `${currentStatus} → ${selectedStatus} 상태 변경이 승인 대기 중입니다.`,
      });

      // 프로젝트 정보 새로고침
      await projectActions.detail.fetchDetail(data.id);

      // Drawer 닫기
      uiActions.drawer.close();
    } catch (error) {
      notification.error({
        message: '상태 변경 실패',
        description: error.message || '상태 변경 중 오류가 발생했습니다.',
      });
    }
  };

  // 상태별 스타일 클래스
  const getStatusClasses = (status) => {
    const isCurrent = status === currentStatus;
    const canTransition = availableTransitions.includes(status);
    const isSelected = status === selectedStatus;
    const statusKey = PROJECT_STATUS_LABEL_TO_KEY[status];

    if (isCurrent) {
      return 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 cursor-default';
    }
    if (isSelected) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-500';
    }
    if (canTransition) {
      return 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
    }
    return 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed';
  };

  return (
    <div className="p-6 space-y-6">
      {/* 승인 대기 중 알림 */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-800">승인 대기 중</h4>
            <p className="text-xs text-yellow-700 mt-1">
              현재 상태 변경 또는 작업 수정에 대한 승인이 대기 중입니다.<br />
              승인이 완료되거나 반려된 후에 다시 상태를 변경할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 현재 상태 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-blue-900">현재 상태</h3>
          <span className="text-xs text-blue-700">
            {data.lastStatusChangedAt || '정보 없음'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getStatusColorByKey(PROJECT_STATUS_LABEL_TO_KEY[currentStatus])?.color
            }}
          />
          <span className="text-lg font-semibold text-blue-900">{currentStatus}</span>
          <ApprovalStatusBadge status={data.currentApprovalStatus} />
          {data.statusDetail && (
            <span className="text-sm text-blue-700">({data.statusDetail})</span>
          )}
        </div>
        <p className="text-xs text-blue-700 mt-2">
          {PROJECT_STATUS_DESCRIPTIONS[PROJECT_STATUS_LABEL_TO_KEY[currentStatus]]}
        </p>
      </div>

      {/* 표준 진행 플로우 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">표준 진행 플로우</h3>
        <div className="space-y-3">
          {PROJECT_STATUS_FLOW.map((status, index) => {
            const isCurrent = status === currentStatus;
            const canTransition = availableTransitions.includes(status);
            const statusKey = PROJECT_STATUS_LABEL_TO_KEY[status];
            const colorInfo = getStatusColorByKey(statusKey);

            return (
              <div key={status}>
                <button
                  onClick={() => handleStatusClick(status)}
                  disabled={!canTransition || isCurrent || isPending}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${getStatusClasses(status)}
                    ${isPending && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorInfo?.color }}
                      />
                      <span className="font-medium text-gray-900">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                          현재
                        </span>
                      )}
                      {canTransition && !isCurrent && (
                        <span className="text-xs text-gray-500">
                          클릭하여 변경
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 ml-9">
                    {PROJECT_STATUS_DESCRIPTIONS[statusKey]}
                  </p>
                </button>

                {/* 연결선 (마지막 제외) */}
                {index < PROJECT_STATUS_FLOW.length - 1 && (
                  <div className="ml-6 w-0.5 h-4 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 예외 상태 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">예외 상태</h3>
        <button
          onClick={() => handleStatusClick(PROJECT_EXCEPTION_STATUS)}
          disabled={currentStatus === PROJECT_EXCEPTION_STATUS || isPending}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all
            ${currentStatus === PROJECT_EXCEPTION_STATUS
              ? 'border-red-500 bg-red-50 ring-2 ring-red-500 cursor-default'
              : availableTransitions.includes(PROJECT_EXCEPTION_STATUS) && !isPending
              ? 'border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getStatusColorByKey(
                    PROJECT_STATUS_LABEL_TO_KEY[PROJECT_EXCEPTION_STATUS]
                  )?.color
                }}
              />
              <span className="font-medium text-gray-900">{PROJECT_EXCEPTION_STATUS}</span>
            </div>
            {currentStatus === PROJECT_EXCEPTION_STATUS && (
              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                현재
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2 ml-6">
            프로젝트가 일시 중단되었거나 시작 대기 중인 상태
          </p>
        </button>
      </div>

      {/* 빠른 변경 폼 (선택된 상태가 있을 때) */}
      {selectedStatus && (
        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <div className={`border rounded-lg p-4 mb-4 ${
            selectedStatus === '종료'
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-1 ${
              selectedStatus === '종료' ? 'text-red-900' : 'text-green-900'
            }`}>
              상태 변경: {currentStatus} → {selectedStatus}
            </h4>
            <p className={`text-xs ${
              selectedStatus === '종료' ? 'text-red-700' : 'text-green-700'
            }`}>
              {selectedStatus === '종료'
                ? '프로젝트를 종료합니다. 종료 후에는 상태를 변경할 수 없습니다.'
                : '간단한 상태 변경을 빠르게 처리할 수 있습니다.'
              }
            </p>
          </div>

          <div className="space-y-4">
            {/* 상태 세부 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 세부 내용 (선택)
              </label>
              <input
                type="text"
                placeholder="예: 1차 수정반영, 2차 검수"
                maxLength={100}
                value={formData.statusDetail}
                onChange={(e) => setFormData({...formData, statusDetail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 변경 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변경 사유 (선택)
              </label>
              <textarea
                placeholder="상태 변경 사유를 입력하세요"
                rows={3}
                value={formData.changeDescription}
                onChange={(e) => setFormData({...formData, changeDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedStatus(null);
                  setFormData({ statusDetail: '', changeDescription: '' });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleQuickChange}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  selectedStatus === '종료'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {selectedStatus === '종료' ? '종료' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전환 가능한 상태 안내 */}
      {availableTransitions.length > 0 && !selectedStatus && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">
            전환 가능한 상태
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((status) => (
              <span
                key={status}
                className="px-3 py-1 text-xs font-medium bg-white text-amber-800 rounded-md border border-amber-300"
              >
                {status}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ProjectStatusFlowTab.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ProjectStatusFlowTab;
