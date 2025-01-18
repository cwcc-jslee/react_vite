// src/shared/components/ui/modal/Modal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {string} [props.title] - 모달 제목
 * @param {React.ReactNode} props.children - 모달 내용
 * @param {string} [props.size='md'] - 모달 크기 (sm, md, lg, xl, full)
 * @param {boolean} [props.hideClose=false] - 닫기 버튼 숨김 여부
 * @param {React.ReactNode} [props.footer] - 모달 하단 영역
 * @param {string} [props.titleClassName] - 제목 영역 추가 스타일
 * @param {string} [props.bodyClassName] - 본문 영역 추가 스타일
 * @param {string} [props.footerClassName] - 하단 영역 추가 스타일
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
  footer,
  titleClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  if (!isOpen) return null;

  // 모달 크기별 스타일 정의
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    // Drawer (z-index: 9000-9002) , Modal (z-index: 9999-10000)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div
        className={`
        relative z-[10000] w-full ${sizeStyles[size]}
        bg-white rounded-lg shadow-xl
        transform transition-all
        max-h-[90vh] flex flex-col
      `}
      >
        {/* 헤더 영역 */}
        {(title || !hideClose) && (
          <div
            className={`
            flex items-center justify-between
            px-6 py-4 border-b
            ${titleClassName}
          `}
          >
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}

            {!hideClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
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
          </div>
        )}

        {/* 본문 영역 */}
        <div
          className={`
          flex-1 overflow-y-auto px-6 py-4
          ${bodyClassName}
        `}
        >
          {children}
        </div>

        {/* 푸터 영역 */}
        {footer && (
          <div
            className={`
            flex justify-end gap-2 px-6 py-4 border-t
            ${footerClassName}
          `}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal을 사용하여 모달을 body 직접 자식으로 렌더링
  return createPortal(modalContent, document.body);
};

export default Modal;
