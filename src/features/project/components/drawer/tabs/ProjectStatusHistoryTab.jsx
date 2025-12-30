// src/features/project/components/drawer/tabs/ProjectStatusHistoryTab.jsx
// 변경 이력 탭 - 상태 변경 이력 타임라인

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {
  PROJECT_STATUS_LABEL_TO_KEY,
  getStatusColorByKey,
} from '../../../constants/projectStatusConstants';
import { projectApiService } from '../../../services/projectApiService';
import { Spinner } from '../../../../../shared/components/ui';

// dayjs 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

const ProjectStatusHistoryTab = ({ data }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상태 변경 이력 조회
  useEffect(() => {
    const fetchStatusChanges = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await projectApiService.getProjectStatusChanges(data.id);

        // API 응답 데이터를 UI용 형식으로 변환
        const formattedHistory = (response?.data || []).map((change) => ({
          id: change.id,
          fromStatus: change.fromStatus?.name || null,
          toStatus: change.toStatus?.name || '알 수 없음',
          statusDetail: change.statusDetail || null,
          approvalStatus: change.approvalStatus || null,
          changedAt: formatDateTime(change.requestedAt),
          changedBy: change.requestedBy?.username || '알 수 없음',
          changeDescription: change.changeDescription || null,
          approvedBy: change.approvedBy?.username || null,
          approvalComment: change.approvalComment || null,
        }));

        setStatusHistory(formattedHistory);
      } catch (err) {
        console.error('상태 변경 이력 조회 실패:', err);
        setError('상태 변경 이력을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (data?.id) {
      fetchStatusChanges();
    }
  }, [data?.id]);

  // 시간 포맷팅 함수
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';

    const now = dayjs();
    const changeTime = dayjs(dateTime);
    const diffInHours = now.diff(changeTime, 'hour');

    // 24시간 이내: 상대 시간
    if (diffInHours < 24) {
      return changeTime.fromNow();
    }

    // 24시간 이후: 절대 시간
    return changeTime.format('YYYY-MM-DD HH:mm');
  };

  // 승인 상태 배지
  const ApprovalStatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        icon: '⏳',
        label: '승인 대기',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      approved: {
        icon: '✅',
        label: '승인 완료',
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      rejected: {
        icon: '❌',
        label: '승인 거부',
        className: 'bg-red-100 text-red-800 border-red-300'
      }
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <span className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border
        ${config.className}
      `}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="large" />
          <p className="text-sm text-gray-500 mt-4">
            상태 변경 이력을 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (statusHistory.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500 mt-4">
            상태 변경 이력이 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          변경 이력
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          총 {statusHistory.length}건의 상태 변경 이력이 있습니다
        </p>
      </div>

      <div className="space-y-4">
        {statusHistory.map((history, index) => {
          const isFirst = index === 0;
          const statusKey = PROJECT_STATUS_LABEL_TO_KEY[history.toStatus];
          const colorInfo = getStatusColorByKey(statusKey);

          return (
            <div key={history.id || index} className="relative">
              {/* 타임라인 연결선 */}
              {!isFirst && (
                <div className="absolute left-4 -top-4 w-0.5 h-4 bg-gray-200" />
              )}

              {/* 변경 이력 카드 */}
              <div className={`
                relative pl-10 pr-4 py-4 rounded-lg border-2
                ${isFirst
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200'
                }
              `}>
                {/* 타임라인 아이콘 */}
                <div
                  className={`
                    absolute left-2 top-4 w-5 h-5 rounded-full border-2 bg-white
                    flex items-center justify-center
                    ${isFirst ? 'border-blue-500' : 'border-gray-300'}
                  `}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: colorInfo?.color,
                      opacity: isFirst ? 1 : 0.7
                    }}
                  />
                </div>

                {/* 변경 내용 */}
                <div className="space-y-2">
                  {/* 상태 전환 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {history.fromStatus && (
                      <>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {history.fromStatus}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${isFirst
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                      }
                    `}>
                      {history.toStatus}
                    </span>

                    {/* 상태 세부 내용 */}
                    {history.statusDetail && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                        {history.statusDetail}
                      </span>
                    )}

                    {/* 승인 상태 */}
                    {history.approvalStatus && (
                      <ApprovalStatusBadge status={history.approvalStatus} />
                    )}

                    {/* 최신 표시 */}
                    {isFirst && (
                      <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                        최신
                      </span>
                    )}
                  </div>

                  {/* 변경 시간 및 변경자 */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{history.changedAt}</span>

                    {history.changedBy && (
                      <>
                        <span>·</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{history.changedBy}</span>
                      </>
                    )}

                    {/* 승인자 */}
                    {history.approvedBy && (
                      <>
                        <span>·</span>
                        <span className="text-green-700">승인: {history.approvedBy}</span>
                      </>
                    )}
                  </div>

                  {/* 변경 사유 */}
                  {history.changeReason && (
                    <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-700">
                      <div className="font-medium text-gray-900 mb-1">변경 사유</div>
                      <div>{history.changeReason}</div>
                    </div>
                  )}

                  {/* 변경 상세 내용 */}
                  {history.changeDescription && (
                    <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-700">
                      <div className="font-medium text-gray-900 mb-1">상세 내용</div>
                      <div className="whitespace-pre-wrap">{history.changeDescription}</div>
                    </div>
                  )}

                  {/* 반려 사유 (반려된 경우) */}
                  {history.approvalStatus === 'rejected' && history.approvalComment && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-red-900 mb-1">
                            반려 사유
                          </div>
                          <div className="text-xs text-red-700">
                            {history.approvalComment}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 승인 의견 (승인 완료된 경우) */}
                  {history.approvalStatus === 'approved' && history.approvalComment && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      <span className="font-medium">승인 의견:</span> {history.approvalComment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProjectStatusHistoryTab.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ProjectStatusHistoryTab;
