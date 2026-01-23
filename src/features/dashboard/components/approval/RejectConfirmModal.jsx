// src/features/dashboard/components/approval/RejectConfirmModal.jsx
/**
 * 반려 확인 모달
 * - 반려 사유 입력
 * - 확인/취소 버튼
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle } from 'lucide-react';
import { APPROVAL_COLORS, TRANSITION_CLASSES } from '../../constants/approvalStyleConstants';

const RejectConfirmModal = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef(null);

  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleClose();
      }
    },
    [isProcessing]
  );

  // 모달 열릴 때 애니메이션 및 포커스 처리
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.addEventListener('keydown', handleKeyDown);
      // 약간의 딜레이 후 textarea에 포커스
      setTimeout(() => textareaRef.current?.focus(), 100);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setIsVisible(false);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!rejectReason.trim()) return;
    onConfirm(rejectReason);
  };

  const handleClose = () => {
    setRejectReason('');
    onClose();
  };

  // 글자 수 카운트
  const charCount = rejectReason.length;
  const maxChars = 500;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className={`
          absolute inset-0 ${APPROVAL_COLORS.background.overlay}
          ${TRANSITION_CLASSES.default}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 모달 */}
      <div
        className={`
          relative bg-white rounded-xl shadow-2xl w-full max-w-lg
          transform ${TRANSITION_CLASSES.default}
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 id="reject-modal-title" className="text-lg font-semibold text-gray-900">
              반려 확인
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className={`
              p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100
              ${TRANSITION_CLASSES.fast}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            상태 변경 요청을 반려하시겠습니까?
            <br />
            <span className="text-gray-500">반려 사유를 입력해 주세요.</span>
          </p>

          <div>
            <label
              htmlFor="reject-reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              반려 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value.slice(0, maxChars))}
              placeholder="반려 사유를 입력해 주세요"
              rows={5}
              disabled={isProcessing}
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg
                text-sm placeholder:text-gray-400
                focus:ring-2 focus:ring-red-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                resize-none ${TRANSITION_CLASSES.fast}
              `}
            />
            <div className="flex justify-end mt-1.5">
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium text-gray-700
              bg-white border border-gray-300 rounded-lg
              hover:bg-gray-50 active:scale-[0.98]
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${TRANSITION_CLASSES.button}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2
            `}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || !rejectReason.trim()}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium text-white
              bg-red-600 rounded-lg
              hover:bg-red-700 active:scale-[0.98]
              disabled:bg-gray-300 disabled:cursor-not-allowed
              ${TRANSITION_CLASSES.button}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                처리중...
              </span>
            ) : (
              '반려'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

RejectConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
};

export default RejectConfirmModal;
