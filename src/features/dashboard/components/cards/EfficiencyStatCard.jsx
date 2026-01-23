// src/features/dashboard/components/cards/EfficiencyStatCard.jsx
/**
 * 효율성 분석용 통계 카드 컴포넌트
 * - ProjectEfficiencyCard, 프로젝트 생성 등에서 공통 사용
 * - 아이콘 옵션 (showIcon prop으로 제어)
 * - 1x4 가로 레이아웃에 최적화
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';

const EfficiencyStatCard = memo(({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass = 'bg-gray-500',
  isWarn = false,
  showIcon = true,
}) => (
  <div
    className={`
      bg-white px-4 py-3 rounded-lg border
      ${isWarn ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}
      flex items-center gap-3
    `}
  >
    {/* 아이콘 (옵셔널) */}
    {showIcon && Icon && (
      <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
        <Icon size={14} className="text-white" />
      </div>
    )}

    {/* 텍스트 영역 */}
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <p
        className={`text-base font-bold truncate ${
          isWarn ? 'text-red-600' : 'text-gray-800'
        }`}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] text-gray-400 truncate">{subValue}</p>
      )}
    </div>
  </div>
));

EfficiencyStatCard.displayName = 'EfficiencyStatCard';

EfficiencyStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subValue: PropTypes.string,
  icon: PropTypes.elementType,
  colorClass: PropTypes.string,
  isWarn: PropTypes.bool,
  showIcon: PropTypes.bool,
};

export default EfficiencyStatCard;
