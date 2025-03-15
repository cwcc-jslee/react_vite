// src/shared/components/ui/ConfirmDialog.jsx
// 사용자 동작을 확인하기 위한 모달 다이얼로그 컴포넌트
// 제목, 메시지, 확인/취소 버튼 및 아이콘을 통한 시각적 피드백을 제공합니다

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// 확인 다이얼로그 컴포넌트
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  icon = null,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);

  // 다이얼로그가 마운트될 때 포커스 설정
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // ESC 키 이벤트 리스너 설정
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  // 다이얼로그 외부 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onCancel();
    }
  };

  // createPortal을 사용하여 DOM의 최상위에 렌더링
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start mb-4">
            {icon && <div className="mr-3">{icon}</div>}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
