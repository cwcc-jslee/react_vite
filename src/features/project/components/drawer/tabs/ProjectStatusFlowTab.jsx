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
import { useProjectUpdate } from '../../../hooks/useProjectUpdate';
import { useProjectStore } from '../../../hooks/useProjectStore';
import { useUiStore } from '../../../../../shared/hooks/useUiStore';
import { useCodebook } from '../../../../../shared/hooks/useCodebook';
import { notification } from '../../../../../shared/services/notification';
import { projectApiService } from '../../../services/projectApiService';
import dayjs from 'dayjs';

const ProjectStatusFlowTab = ({ data }) => {
  const { actions: projectActions } = useProjectStore();
  const { actions: uiActions } = useUiStore();
  const currentUser = useSelector((state) => state.auth.user);
  const { data: codebooks } = useCodebook(['pjtClosureType']);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [formData, setFormData] = useState({
    statusDetail: '',
    changeDescription: '',
    pjtClosureType: null,
    closureDate: null,
  });

  const currentStatus = data.pjtStatus?.name || '시작전';

  // 전환 가능한 상태 목록
  const availableTransitions = useMemo(() => {
    return PROJECT_STATUS_TRANSITIONS[currentStatus] || [];
  }, [currentStatus]);

  // 상태 클릭 핸들러
  const handleStatusClick = (status) => {
    if (status === currentStatus) return;

    const canTransition = availableTransitions.includes(status);
    if (!canTransition) return;

    setSelectedStatus(status);

    // 종료가 아닌 상태로 변경할 때는 종료 관련 필드 초기화
    if (status !== '종료') {
      setFormData({
        statusDetail: '',
        changeDescription: '',
        pjtClosureType: null,
        closureDate: null,
      });
    }
  };

  // 빠른 변경 저장
  const handleQuickChange = async () => {
    try {
      // 종료 상태 검증
      if (selectedStatus === '종료') {
        if (!formData.pjtClosureType) {
          notification.error({
            message: '입력 오류',
            description: '종료타입을 선택해주세요.',
          });
          return;
        }
        if (!formData.closureDate) {
          notification.error({
            message: '입력 오류',
            description: '종료일을 선택해주세요.',
          });
          return;
        }

        // 완료로 종료하는 경우 모든 태스크 완료 확인
        if (formData.pjtClosureType.name === '완료') {
          const projectTasks = data.projectTasks || [];
          const hasIncompleteTasks = projectTasks.some(
            (task) => task.isCompleted !== true,
          );

          if (hasIncompleteTasks) {
            notification.error({
              message: '태스크 미완료',
              description: '완료로 종료할 경우 모든 태스크가 완료되어야 합니다.',
            });
            return;
          }
        }
      }

      const fromStatusCode = getStatusCodeByLabel(currentStatus);
      const toStatusCode = getStatusCodeByLabel(selectedStatus);

      // 1. 프로젝트 상태 업데이트
      const updateData = {
        pjtStatus: toStatusCode,
      };

      // 종료 상태인 경우 isClosed 추가
      if (selectedStatus === '종료') {
        updateData.isClosed = true;
      }

      await projectApiService.updateProject(data.documentId, updateData);

      // 2. 상태 변경 이력 생성
      try {
        const statusChangeData = {
          project: data.id,
          fromStatus: fromStatusCode,
          toStatus: toStatusCode,
          statusDetail: formData.statusDetail || null,
          requestedBy: currentUser?.user?.id || null,
          requestedAt: dayjs().toISOString(),
          changeDescription: formData.changeDescription || null,
        };

        await projectApiService.createProjectStatusChange(statusChangeData);
        console.log('상태 변경 이력 생성 완료:', statusChangeData);
      } catch (statusChangeError) {
        // 상태 변경 이력 생성 실패는 로그만 남김
        console.error('상태 변경 이력 생성 실패:', statusChangeError);
      }

      // 3. 종료 상태인 경우 project-closures 생성
      if (selectedStatus === '종료') {
        try {
          const formattedClosureDate = formData.closureDate
            ? dayjs(formData.closureDate).format('YYYY-MM-DD')
            : null;

          const closureData = {
            project: data.id,
            closureType: formData.pjtClosureType.id,
            closureDate: formattedClosureDate,
          };

          await projectApiService.createProjectClosure(closureData);
        } catch (closureError) {
          console.error('프로젝트 종료 정보 생성 실패:', closureError);
          throw new Error('프로젝트 종료 정보 생성 중 오류가 발생했습니다.');
        }
      }

      notification.success({
        message: '상태 변경 완료',
        description: `${currentStatus} → ${selectedStatus}로 변경되었습니다.`,
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
                  disabled={!canTransition || isCurrent}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${getStatusClasses(status)}
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
          disabled={currentStatus === PROJECT_EXCEPTION_STATUS}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all
            ${currentStatus === PROJECT_EXCEPTION_STATUS
              ? 'border-red-500 bg-red-50 ring-2 ring-red-500 cursor-default'
              : availableTransitions.includes(PROJECT_EXCEPTION_STATUS)
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
            {/* 종료 상태인 경우 종료타입 및 종료일 입력 */}
            {selectedStatus === '종료' ? (
              <>
                {/* 종료타입 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료타입 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pjtClosureType?.id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedItem = codebooks?.pjtClosureType?.find(
                        (item) => item.id === selectedId || item.id === Number(selectedId),
                      );
                      setFormData({...formData, pjtClosureType: selectedItem});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    {codebooks?.pjtClosureType?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.closureDate || ''}
                    onChange={(e) => setFormData({...formData, closureDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedStatus(null);
                  setFormData({ statusDetail: '', changeDescription: '', pjtClosureType: null, closureDate: null });
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
