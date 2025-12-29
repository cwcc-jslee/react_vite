// src/shared/components/ui/card/MetricCard.jsx
// 지표를 표시하는 카드 컴포넌트

import React from 'react';
import PropTypes from 'prop-types';

/**
 * 지표 카드 컴포넌트
 * 핵심 지표를 시각적으로 강조하여 표시
 *
 * @param {Object} props
 * @param {string} props.title - 카드 제목
 * @param {React.ReactNode} props.children - 카드 내용
 * @param {string} props.icon - 아이콘 (옵션)
 * @param {string} props.variant - 카드 스타일 ('default' | 'primary' | 'success' | 'warning' | 'danger')
 * @param {string} props.className - 추가 CSS 클래스
 */
const MetricCard = ({
  title,
  children,
  icon,
  variant = 'default',
  className = ''
}) => {
  // variant별 스타일
  const variantStyles = {
    default: 'border-gray-200 bg-white',
    primary: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    danger: 'border-red-200 bg-red-50',
  };

  const headerVariantStyles = {
    default: 'text-gray-700 bg-gray-50',
    primary: 'text-blue-700 bg-blue-100',
    success: 'text-green-700 bg-green-100',
    warning: 'text-amber-700 bg-amber-100',
    danger: 'text-red-700 bg-red-100',
  };

  return (
    <div
      className={`
        rounded-lg border-2 shadow-sm transition-all duration-200
        hover:shadow-md hover:border-opacity-80
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {/* 카드 헤더 */}
      <div
        className={`
          px-4 py-2 border-b-2 border-gray-200
          ${headerVariantStyles[variant]}
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-semibold">
            {title}
          </h3>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger']),
  className: PropTypes.string,
};

export default MetricCard;
