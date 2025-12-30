// src/features/dashboard/components/cards/ApprovalCard.jsx
/**
 * 승인 카드 컴포넌트 (컴팩트)
 * - 승인 대기 건을 간략하게 표시
 * - 클릭 시 상세 Drawer 열림
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { getStatusColorByKey, PROJECT_STATUS_LABEL_TO_KEY } from '../../../project/constants/projectStatusConstants';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const ApprovalCard = ({ approval, onClick }) => {
  const { name, customer, pendingStatusChange } = approval;

  if (!pendingStatusChange) {
    return null;
  }

  const { fromStatus, toStatus, requestedBy, requestedAt, statusDetail } = pendingStatusChange;

  const fromStatusKey = PROJECT_STATUS_LABEL_TO_KEY[fromStatus?.name];
  const toStatusKey = PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name];
  const fromColor = getStatusColorByKey(fromStatusKey);
  const toColor = getStatusColorByKey(toStatusKey);

  // 승인 유형 결정
  const getApprovalType = () => {
    if (!fromStatus) {
      return { label: '신규', color: 'bg-green-100 text-green-800' };
    }
    if (toStatus?.name === '종료') {
      return { label: '종료', color: 'bg-gray-100 text-gray-800' };
    }
    if (toStatus?.name === '중간검수' || toStatus?.name === '고객검수') {
      return { label: '검수', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: '변경', color: 'bg-yellow-100 text-yellow-800' };
  };

  const approvalType = getApprovalType();

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        {/* 왼쪽: 프로젝트 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${approvalType.color}`}>
              {approvalType.label}
            </span>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
            {customer?.name && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-600 truncate">{customer.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{dayjs(requestedAt).fromNow()}</span>
            {requestedBy?.username && (
              <>
                <span>•</span>
                <span>{requestedBy.username}</span>
              </>
            )}
          </div>
        </div>

        {/* 오른쪽: 상태 변경 표시 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {fromStatus && (
            <>
              <span
                className="px-2 py-1 text-xs font-medium rounded whitespace-nowrap"
                style={{
                  backgroundColor: fromColor?.bgColor,
                  color: fromColor?.color,
                }}
              >
                {fromStatus.name}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span
            className="px-2 py-1 text-xs font-medium rounded whitespace-nowrap"
            style={{
              backgroundColor: toColor?.bgColor,
              color: toColor?.color,
            }}
          >
            {toStatus?.name}
          </span>
        </div>
      </div>

      {/* 상태 세부 내용 */}
      {statusDetail && (
        <p className="text-xs text-gray-600 mt-2">
          {statusDetail}
        </p>
      )}
    </div>
  );
};

ApprovalCard.propTypes = {
  approval: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    documentId: PropTypes.string,
    name: PropTypes.string.isRequired,
    customer: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
    pendingStatusChange: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fromStatus: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
      toStatus: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
      requestedBy: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string,
      }),
      requestedAt: PropTypes.string,
      statusDetail: PropTypes.string,
      changeDescription: PropTypes.string,
    }),
  }).isRequired,
  onClick: PropTypes.func,
};

export default ApprovalCard;
