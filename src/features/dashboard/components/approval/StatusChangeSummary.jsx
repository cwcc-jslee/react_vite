// src/features/dashboard/components/approval/StatusChangeSummary.jsx
/**
 * 상태 변경 요약 표시 컴포넌트
 * - 이전 상태 → 다음 상태 표시
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight } from 'lucide-react';
import { getStatusColorByKey, PROJECT_STATUS_LABEL_TO_KEY } from '../../../project/constants/projectStatusConstants';

const StatusChangeSummary = ({ fromStatus, toStatus, statusDetail, changeDescription }) => {
  const fromStatusKey = PROJECT_STATUS_LABEL_TO_KEY[fromStatus?.name];
  const toStatusKey = PROJECT_STATUS_LABEL_TO_KEY[toStatus?.name];
  const fromColor = getStatusColorByKey(fromStatusKey);
  const toColor = getStatusColorByKey(toStatusKey);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-900 mb-3">상태 변경 내역</h4>

      {/* 상태 변경 표시 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: fromColor?.color }}
          />
          <span className="text-sm font-medium text-gray-900">{fromStatus?.name}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-blue-600" />
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: toColor?.color }}
          />
          <span className="text-sm font-medium text-blue-900">{toStatus?.name}</span>
        </div>
      </div>

      {/* 상태 세부 내용 */}
      {statusDetail && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-blue-800 mb-1">
            상태 세부 내용
          </label>
          <p className="text-sm text-blue-900">{statusDetail}</p>
        </div>
      )}

      {/* 변경 사유 */}
      {changeDescription && (
        <div>
          <label className="block text-xs font-medium text-blue-800 mb-1">
            변경 사유
          </label>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{changeDescription}</p>
        </div>
      )}
    </div>
  );
};

StatusChangeSummary.propTypes = {
  fromStatus: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  toStatus: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  statusDetail: PropTypes.string,
  changeDescription: PropTypes.string,
};

export default StatusChangeSummary;
