/**
 * 매출 확률 Badge 컴포넌트
 * - 확률에 따라 색상 자동 변경
 * - 시각적 피드백 제공
 */

import React from 'react';
import PropTypes from 'prop-types';

const ProbabilityBadge = ({ probability }) => {
  const getColorClass = (prob) => {
    if (prob >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (prob >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (prob >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2.5 py-1 rounded-full text-xs font-semibold border
        ${getColorClass(probability)}
      `}
    >
      {probability}%
    </span>
  );
};

ProbabilityBadge.propTypes = {
  probability: PropTypes.number,
};

ProbabilityBadge.defaultProps = {
  probability: 0,
};

export default ProbabilityBadge;
