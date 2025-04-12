// src/shared/components/ui/progress/Progress.jsx

import React from 'react';

/**
 * 진행률 표시 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {number} props.percent - 진행률 (0-100)
 * @param {string} props.size - 크기 ('sm', 'md', 'lg')
 * @param {boolean} props.showInfo - 퍼센트 텍스트 표시 여부
 * @param {string} props.className - 추가 클래스명
 * @returns {JSX.Element} 진행률 컴포넌트
 */
const Progress = ({
  percent = 0,
  size = 'md',
  showInfo = false,
  className = '',
  ...rest
}) => {
  // 퍼센트 값 검증 및 보정
  const normalizedPercent = Math.max(0, Math.min(100, Number(percent) || 0));

  // 진행률에 따른 색상 결정
  const getColorClass = () => {
    if (normalizedPercent < 25) return 'bg-red-500';
    if (normalizedPercent < 50) return 'bg-amber-500';
    if (normalizedPercent < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // 크기에 따른 높이 클래스 결정
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-3';
      case 'md':
      default:
        return 'h-2';
    }
  };

  return (
    <div className={`w-full ${className}`} {...rest}>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${getColorClass()} ${getSizeClass()} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${normalizedPercent}%` }}
            role="progressbar"
            aria-valuenow={normalizedPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {showInfo && (
          <span className="ml-2 text-xs font-medium text-gray-700">
            {normalizedPercent.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Progress;
