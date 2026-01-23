// src/features/dashboard/components/approval/ApprovalCard.jsx
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
import { getApprovalTypeStyle, TRANSITION_CLASSES } from '../../constants/approvalStyleConstants';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const ApprovalCard = ({ approval, onClick }) => {
  const { name, customer, pendingStatusChange } = approval;

  if (!pendingStatusChange) {
    return null;
  }

  const { name: changeTypeName, fromStatus, toStatus, requestedBy, requestedAt, statusDetail } = pendingStatusChange;

  const fromStatusKey = PROJECT_STATUS_LABEL_TO_KEY[fromStatus?.name];
  const toStatusKey = PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name];
  const fromColor = getStatusColorByKey(fromStatusKey);
  const toColor = getStatusColorByKey(toStatusKey);

  // 승인 유형 스타일 (공통 상수 사용)
  const approvalType = getApprovalTypeStyle(changeTypeName);

  return (
    <div
      className={`
        border border-gray-200 rounded-lg p-4 sm:p-5
        hover:bg-gray-50 hover:shadow-sm hover:border-gray-300
        cursor-pointer ${TRANSITION_CLASSES.default}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* 왼쪽: 프로젝트 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 text-sm font-medium rounded flex-shrink-0 ${approvalType.color}`}>
              {approvalType.label}
            </span>
            <h4 className="text-base font-medium text-gray-900 truncate">{name}</h4>
            {customer?.name && (
              <>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-sm text-gray-500 truncate hidden sm:inline">{customer.name}</span>
              </>
            )}
          </div>
          {/* 모바일에서 고객명 표시 */}
          {customer?.name && (
            <p className="text-sm text-gray-500 mb-1.5 sm:hidden">{customer.name}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{dayjs(requestedAt).fromNow()}</span>
            {requestedBy?.username && (
              <>
                <span className="text-gray-300">•</span>
                <span>{requestedBy.username}</span>
              </>
            )}
          </div>
        </div>

        {/* 오른쪽: 상태 변경 표시 */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          {fromStatus && (
            <>
              <span
                className="px-2 py-1 text-sm font-medium rounded whitespace-nowrap"
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
            className="px-2 py-1 text-sm font-medium rounded whitespace-nowrap"
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
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
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
      name: PropTypes.string, // 상태 변경 유형 코드 (CREATE, STATUS_CHANGE 등)
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
