// src/shared/components/ui/modal/ModalRenderer.jsx
import React from 'react';
import Modal from './Modal';
import { Button } from '../index';

/**
 * 모달 렌더링 컴포넌트
 * useModal 훅과 함께 사용하여 모달 UI를 렌더링
 *
 * @param {Object} props
 * @param {Object} props.modalState - 모달 상태 객체 (useModal 훅에서 제공)
 * @param {Function} props.closeModal - 모달 닫기 함수
 * @param {Function} props.handleConfirm - 확인 버튼 클릭 핸들러
 */
const ModalRenderer = ({ modalState, closeModal, handleConfirm }) => {
  // 모달 내용 렌더링 (타입에 따라 다른 내용 표시)
  const renderModalContent = () => {
    const { type, message } = modalState;

    // message가 문자열이 아닌 React 요소인 경우 직접 렌더링
    if (React.isValidElement(message)) {
      return message;
    }

    // 모달 타입에 따라 다른 내용과 스타일 적용
    switch (type) {
      case 'delete':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-red-500">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'confirm':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-blue-500">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'info':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-blue-500">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-green-500">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-yellow-500">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-start">
            <div className="flex-shrink-0 text-red-500">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">{message}</p>
          </div>
        );
      case 'form':
        // 폼 타입의 모달 - modalState.formFields에서 폼 필드 정보를 받아와 렌더링
        return (
          <div className="space-y-4">
            {modalState.message && (
              <p className="text-gray-700 mb-4">{modalState.message}</p>
            )}
            {modalState.formFields &&
              modalState.formFields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      name={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={4}
                      disabled={field.disabled}
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      name={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={field.disabled}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      id={field.id}
                      name={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={field.disabled}
                      placeholder={field.placeholder || ''}
                    />
                  )}
                  {field.error && (
                    <p className="text-red-500 text-sm">{field.error}</p>
                  )}
                </div>
              ))}
          </div>
        );
      default:
        return <p className="text-gray-700">{message}</p>;
    }
  };

  // 모달 푸터 렌더링 (타입에 따라 다른 버튼 표시)
  const renderModalFooter = () => {
    const { type, customFooter } = modalState;

    // 커스텀 푸터가 있는 경우 해당 푸터 사용
    if (customFooter) {
      return customFooter;
    }

    // 모달 타입에 따라 다른 푸터 버튼 구성
    switch (type) {
      case 'delete':
        return (
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              className="px-4 py-2"
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              삭제
            </Button>
          </>
        );
      case 'confirm':
        return (
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              className="px-4 py-2"
            >
              아니오
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="px-4 py-2"
            >
              예
            </Button>
          </>
        );
      case 'form':
        return (
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              className="px-4 py-2"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="px-4 py-2"
            >
              확인
            </Button>
          </>
        );
      case 'warning':
        return (
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              className="px-4 py-2"
            >
              취소
            </Button>
            <Button
              variant="warning"
              onClick={handleConfirm}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              확인
            </Button>
          </>
        );
      case 'info':
      case 'success':
      case 'error':
        return (
          <Button
            variant={type === 'error' ? 'danger' : 'primary'}
            onClick={closeModal}
            className={`px-4 py-2 ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            확인
          </Button>
        );
      case 'custom':
        // custom 타입에서는 푸터를 렌더링하지 않음
        return null;
      default:
        return (
          <Button variant="primary" onClick={closeModal} className="px-4 py-2">
            확인
          </Button>
        );
    }
  };

  // 모달 크기 결정 (타입에 따라 다른 크기 적용)
  const getModalSize = () => {
    const { type, size } = modalState;

    // 명시적으로 크기가 지정된 경우 해당 크기 사용
    if (size) {
      return size;
    }

    // 타입별 기본 크기
    switch (type) {
      case 'delete':
      case 'info':
      case 'success':
      case 'error':
        return 'sm';
      case 'warning':
      case 'confirm':
        return 'md';
      case 'form':
        return 'lg';
      default:
        return 'md';
    }
  };

  return (
    <Modal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      title={modalState.title}
      size={getModalSize()}
      footer={renderModalFooter()}
      hideClose={modalState.hideClose}
      titleClassName={modalState.titleClassName}
      bodyClassName={modalState.bodyClassName}
      footerClassName={modalState.footerClassName}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default ModalRenderer;
