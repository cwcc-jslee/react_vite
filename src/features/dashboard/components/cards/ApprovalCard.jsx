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
  const { name, pendingStatusChange } = approval;

  if (!pendingStatusChange) {
    return null;
  }

  const { fromStatus, toStatus, requestedBy, requestedAt, statusDetail } = pendingStatusChange;

  const fromStatusKey = PROJECT_STATUS_LABEL_TO_KEY[fromStatus?.name];
  const toStatusKey = PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name];
  const fromColor = getStatusColorByKey(fromStatusKey);
  const toColor = getStatusColorByKey(toStatusKey);

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{dayjs(requestedAt).fromNow()}</span>
            {requestedBy?.username && (
              <>
                <span>•</span>
                <span>{requestedBy.username}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 상태 변경 표시 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            backgroundColor: fromColor?.bgColor,
            color: fromColor?.color,
          }}
        >
          {fromStatus?.name}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            backgroundColor: toColor?.bgColor,
            color: toColor?.color,
          }}
        >
          {toStatus?.name}
        </span>
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
