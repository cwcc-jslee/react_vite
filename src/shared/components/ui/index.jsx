// src/shared/components/ui/index.jsx
import React from 'react';

/**
 * Group: 여러 컴포넌트를 그룹화하는 컨테이너
 * - direction: 'horizontal' | 'vertical' (default: 'vertical')
 * - spacing: 'sm' | 'md' | 'lg' (default: 'md')
 */
export const Group = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  className = '',
}) => {
  const baseStyles = 'w-full';
  const spacingStyles = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };
  const directionStyles =
    direction === 'horizontal'
      ? 'flex items-center space-x-4 space-y-0'
      : spacingStyles[spacing];

  return (
    <div className={`${baseStyles} ${directionStyles} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Form: 전체 폼을 감싸는 컨테이너
 * - maxWidth: 폼의 최대 너비 (default: '2xl')
 */
export const Form = ({ children, maxWidth = '2xl', className = '' }) => {
  return (
    <form
      className={`w-full max-w-${maxWidth} mx-auto px-6 py-8 space-y-6 ${className}`}
    >
      {children}
    </form>
  );
};

/**
 * FormItem: 라벨과 입력 필드를 포함하는 개별 폼 아이템
 */
export const FormItem = ({ children, fullWidth, className = '' }) => {
  const widthClass = fullWidth ? 'col-span-2' : '';
  return (
    <div
      className={`grid grid-cols-[80px,1fr] gap-4 items-start ${widthClass} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Label: 입력 필드의 라벨
 * - required: 필수 입력 여부
 */
export const Label = ({ children, required, className = '' }) => {
  return (
    <label
      className={`text-sm font-medium text-gray-700 whitespace-nowrap ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

/**
 * Input: 텍스트 입력 필드
 * - type: input type (text, number, etc.)
 * - error: 에러 상태
 */
export const Input = React.forwardRef(
  ({ type = 'text', error, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full h-9 px-3 py-2 text-sm border rounded-md transition-colors';
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <input
        ref={ref}
        type={type}
        className={`${baseStyles} ${stateStyles} ${className}
        disabled:bg-gray-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        {...props}
      />
    );
  },
);

/**
 * Select: 드롭다운 선택 컴포넌트
 */
export const Select = React.forwardRef(
  ({ error, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full h-9 px-3 py-2 text-sm border rounded-md transition-colors appearance-none';
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${className}
          disabled:bg-gray-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  },
);

/**
 * TextArea: 여러 줄 텍스트 입력 필드
 */
export const TextArea = React.forwardRef(
  ({ error, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full min-h-[100px] px-3 py-2 text-sm border rounded-md transition-colors';
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
      <textarea
        ref={ref}
        className={`${baseStyles} ${stateStyles} ${className}
        disabled:bg-gray-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        {...props}
      />
    );
  },
);

/**
 * Button: 버튼 컴포넌트
 * - variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Switch: 토글 스위치 컴포넌트
 */
export const Switch = ({ checked, onChange, disabled, className = '' }) => {
  return (
    <button
      type="button"
      className={`${checked ? 'bg-blue-600' : 'bg-gray-200'}
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
        transition-colors duration-200 ease-in-out
        disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      onClick={onChange}
    >
      <span
        className={`${checked ? 'translate-x-6' : 'translate-x-1'}
          pointer-events-none inline-block h-4 w-4 transform rounded-full 
          bg-white shadow ring-0 transition duration-200 ease-in-out
          my-1`}
      />
    </button>
  );
};

/**
 * Message: 알림 메시지 컴포넌트
 * - type: 'error' | 'success' | 'info' | 'warning' (default: 'info')
 */
export const Message = ({ children, type = 'info', className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-500',
    success: 'bg-green-50 text-green-700 border-green-500',
    info: 'bg-blue-50 text-blue-700 border-blue-500',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-500',
  };

  return (
    <div
      className={`px-4 py-2 text-sm rounded-md border-l-4 ${styles[type]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Checkbox: 체크박스 컴포넌트
 */
export const Checkbox = React.forwardRef(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 
        focus:ring-blue-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  },
);
