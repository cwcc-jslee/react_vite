import React from 'react';

/**
 * Tag 컴포넌트
 * 콘텐츠에 레이블을 지정하거나 카테고리화하는 작은 태그 요소
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {ReactNode} props.children - 태그 내용
 * @param {string} props.color - 태그 색상 ('blue', 'cyan', 'green', 'orange', 'red', 'gray')
 * @param {boolean} props.closable - 닫기 버튼 표시 여부
 * @param {Function} props.onClose - 닫기 버튼 클릭 시 호출할 콜백 함수
 * @param {string} props.className - 추가 CSS 클래스명
 * @returns {JSX.Element} 태그 컴포넌트
 */
const Tag = ({
  children,
  color = 'blue',
  closable = false,
  onClose,
  className = '',
  ...rest
}) => {
  // 색상에 따른 스타일 클래스 결정
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 닫기 버튼 클릭 핸들러
  const handleClose = (e) => {
    e.stopPropagation();
    onClose?.(e);
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${getColorClass()} ${className}`}
      {...rest}
    >
      {children}
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className="ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-opacity-20 hover:bg-gray-900 focus:outline-none"
        >
          <span className="sr-only">Remove</span>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
