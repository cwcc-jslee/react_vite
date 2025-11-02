// src/features/sfa/components/cards/SummaryCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * 요약 카드 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 카드 제목
 * @param {string|number} props.value - 표시할 값
 * @param {string} props.subtitle - 부제목
 * @param {boolean} props.highlight - 강조 표시 여부
 */
const SummaryCard = ({ title, value, subtitle, highlight = false }) => {
  return (
    <div
      className={`bg-white border rounded-lg p-6 shadow-sm ${
        highlight ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  highlight: PropTypes.bool,
};

export default SummaryCard;
