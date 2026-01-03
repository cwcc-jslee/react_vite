/**
 * 확정여부 뱃지 컴포넌트
 * - 확정/미확정 상태를 시각적으로 표시
 */
import React from 'react';
import PropTypes from 'prop-types';

const ConfirmedBadge = ({ isConfirmed }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${
          isConfirmed
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }
      `}
    >
      {isConfirmed ? '✓ 확정' : '미확정'}
    </span>
  );
};

ConfirmedBadge.propTypes = {
  isConfirmed: PropTypes.bool,
};

ConfirmedBadge.defaultProps = {
  isConfirmed: false,
};

export default ConfirmedBadge;
