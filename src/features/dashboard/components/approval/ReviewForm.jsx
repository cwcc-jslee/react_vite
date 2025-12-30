// src/features/dashboard/components/approval/ReviewForm.jsx
/**
 * 검토 의견 작성 폼
 * - 승인/반려 사유 입력
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ReviewForm = ({ onCommentChange, isReject = false }) => {
  const [comment, setComment] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setComment(value);
    onCommentChange?.(value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {isReject ? '반려 사유 (필수)' : '검토 의견 (선택)'}
      </label>
      <textarea
        value={comment}
        onChange={handleChange}
        placeholder={
          isReject
            ? '반려 사유를 입력해주세요'
            : '검토 의견을 입력해주세요 (선택사항)'
        }
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      {isReject && (
        <p className="text-xs text-red-600">* 반려 시 사유 입력은 필수입니다.</p>
      )}
    </div>
  );
};

ReviewForm.propTypes = {
  onCommentChange: PropTypes.func,
  isReject: PropTypes.bool,
};

export default ReviewForm;
