// src/shared/components/ui/badge/Badge.jsx

import React from 'react';

/**
 * 배지 컴포넌트
 * 레이블이나 상태를 시각적으로 표시하는 작은 UI 요소
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.label - 배지에 표시할 텍스트
 * @param {string} props.variant - 배지 스타일 ('default', 'outlined', 'dot')
 * @param {string} props.color - 사전 정의된 색상 ('primary', 'success', 'warning', 'error', 'info')
 * @param {string} props.className - 추가 클래스명
 * @param {ReactNode} props.children - 자식 컴포넌트 (label 대신 사용 가능)
 * @returns {JSX.Element} 배지 컴포넌트
 */
const Badge = ({
  label,
  variant = 'default',
  color = 'primary',
  className = '',
  children,
  ...rest
}) => {
  // 색상에 따른 기본 스타일 클래스
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return variant === 'outlined'
          ? 'bg-transparent text-indigo-600 border border-indigo-600'
          : 'bg-indigo-100 text-indigo-800';
      case 'success':
        return variant === 'outlined'
          ? 'bg-transparent text-green-600 border border-green-600'
          : 'bg-green-100 text-green-800';
      case 'warning':
        return variant === 'outlined'
          ? 'bg-transparent text-amber-600 border border-amber-600'
          : 'bg-amber-100 text-amber-800';
      case 'error':
        return variant === 'outlined'
          ? 'bg-transparent text-red-600 border border-red-600'
          : 'bg-red-100 text-red-800';
      case 'info':
        return variant === 'outlined'
          ? 'bg-transparent text-blue-600 border border-blue-600'
          : 'bg-blue-100 text-blue-800';
      default:
        return variant === 'outlined'
          ? 'bg-transparent text-gray-600 border border-gray-600'
          : 'bg-gray-100 text-gray-800';
    }
  };

  // dot 변형일 경우 표시할 점의 색상 클래스
  const getDotClass = () => {
    switch (color) {
      case 'primary':
        return 'bg-indigo-600';
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-amber-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
        ${variant !== 'dot' ? getColorClass() : 'bg-transparent text-gray-700'}
        ${className}
      `}
      {...rest}
    >
      {variant === 'dot' && (
        <span className={`w-1.5 h-1.5 rounded-full ${getDotClass()} mr-1.5`} />
      )}
      {label || children}
    </span>
  );
};

export default Badge;
