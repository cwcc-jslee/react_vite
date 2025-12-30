// src/features/dashboard/components/approval/ApprovalActionButtons.jsx
/**
 * 승인/반려 버튼 그룹
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Check, X } from 'lucide-react';

const ApprovalActionButtons = ({ onApprove, onReject, isProcessing, disabled }) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onReject}
        disabled={isProcessing || disabled}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <X className="w-4 h-4" />
        <span>{isProcessing ? '처리중...' : '반려'}</span>
      </button>
      <button
        onClick={onApprove}
        disabled={isProcessing || disabled}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <Check className="w-4 h-4" />
        <span>{isProcessing ? '처리중...' : '승인'}</span>
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
