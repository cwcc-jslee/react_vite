// src/features/dashboard/components/approval/ApprovalActionButtons.jsx
/**
 * 승인/반려 버튼 그룹
 * - 승인: 주요 액션 (파란색, 우측)
 * - 반려: 보조 액션 (빨간색 아웃라인, 좌측)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Check, X } from 'lucide-react';
import { TRANSITION_CLASSES } from '../../constants/approvalStyleConstants';

const ApprovalActionButtons = ({ onApprove, onReject, isProcessing, disabled }) => {
  return (
    <div className="flex gap-4">
      {/* 반려 버튼 (보조 액션) */}
      <button
        onClick={onReject}
        disabled={isProcessing || disabled}
        className={`
          flex-1 flex items-center justify-center gap-2
          px-6 py-3 text-sm font-semibold
          text-red-600 bg-white
          border-2 border-red-200 rounded-xl
          hover:bg-red-50 hover:border-red-300
          active:scale-[0.98]
          disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
          ${TRANSITION_CLASSES.default}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
        `}
      >
        {isProcessing ? (
          <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
        <span>반려</span>
      </button>

      {/* 승인 버튼 (주요 액션) */}
      <button
        onClick={onApprove}
        disabled={isProcessing || disabled}
        className={`
          flex-1 flex items-center justify-center gap-2
          px-6 py-3 text-sm font-semibold
          text-white bg-blue-600
          border-2 border-blue-600 rounded-xl
          shadow-sm shadow-blue-200
          hover:bg-blue-700 hover:border-blue-700 hover:shadow-md hover:shadow-blue-200
          active:scale-[0.98]
          disabled:bg-gray-300 disabled:border-gray-300 disabled:shadow-none disabled:cursor-not-allowed
          ${TRANSITION_CLASSES.default}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        `}
      >
        {isProcessing ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        <span>승인</span>
      </button>
    </div>
  );
};

ApprovalActionButtons.propTypes = {
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ApprovalActionButtons;
