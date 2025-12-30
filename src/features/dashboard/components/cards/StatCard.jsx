// src/features/dashboard/components/cards/StatCard.jsx
/**
 * 통계 카드 컴포넌트
 * - 아이콘, 숫자, 라벨을 표시하는 재사용 가능한 카드
 */

import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ icon: Icon, label, value, config, onClick }) => {
  const { bgColor, iconColor, textColor, borderColor } = config;

  return (
    <div
      className={`
        ${bgColor} ${borderColor}
        border rounded-lg p-6
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>
            {value?.toLocaleString() || 0}
          </p>
        </div>
        <div className={`${iconColor}`}>
          <Icon className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  config: PropTypes.shape({
    bgColor: PropTypes.string.isRequired,
    iconColor: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};

export default StatCard;
