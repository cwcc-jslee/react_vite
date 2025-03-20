// src/shared/hooks/useModal.js
import { useState } from 'react';

/**
 * 모달 상태 및 동작을 관리하는 커스텀 훅
 * @returns {Object} 모달 관련 상태와 함수들
 */
const useModal = () => {
  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '', // 'delete', 'info', 'warning', 'success', 'error', 'confirm', 'form' 등
    title: '',
    message: '',
    data: null,
    confirmAction: null,
    cancelAction: null,
    formFields: null,
    customFooter: null,
    size: null,
    hideClose: false,
    titleClassName: '',
    bodyClassName: '',
    footerClassName: '',
  });

  /**
   * 모달 열기
   * @param {string} type - 모달 유형 ('delete', 'info', 'warning', 'confirm', 'form' 등)
   * @param {string} title - 모달 제목
   * @param {string|React.ReactNode} message - 모달 내용 메시지
   * @param {any} data - 모달에서 사용할 데이터
   * @param {Function} confirmAction - 확인 버튼 클릭 시 실행할 함수
   * @param {Function} cancelAction - 취소 버튼 클릭 시 실행할 함수
   * @param {Object} options - 추가 옵션 객체 (formFields, customFooter, size, hideClose 등)
   */
  const openModal = (
    type,
    title,
    message,
    data = null,
    confirmAction = null,
    cancelAction = null,
    options = {},
  ) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      data,
      confirmAction,
      cancelAction,
      formFields: options.formFields || null,
      customFooter: options.customFooter || null,
      size: options.size || null,
      hideClose: options.hideClose || false,
      titleClassName: options.titleClassName || '',
      bodyClassName: options.bodyClassName || '',
      footerClassName: options.footerClassName || '',
    });
  };

  /**
   * 모달 닫기
   */
  const closeModal = () => {
    // 모달 닫기 시 취소 액션이 있으면 실행
    if (modalState.cancelAction) {
      modalState.cancelAction();
    }

    setModalState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  /**
   * 확인 버튼 클릭 핸들러
   */
  const handleConfirm = () => {
    if (modalState.confirmAction) {
      modalState.confirmAction(modalState.data);
    }
    // 일부 모달 타입은 확인 후 자동으로 닫히지 않을 수 있음
    // 예: 폼 제출 실패 시 계속 열려있어야 하는 경우
    if (modalState.type !== 'formError') {
      setModalState((prevState) => ({
        ...prevState,
        isOpen: false,
      }));
    }
  };

  /**
   * 특정 유형의 모달을 여는 단축 함수들
   */

  // 삭제 확인 모달
  const openDeleteModal = (
    title,
    message,
    data,
    confirmAction,
    options = {},
  ) => {
    openModal('delete', title, message, data, confirmAction, null, options);
  };

  // 정보 모달
  const openInfoModal = (
    title,
    message,
    data = null,
    onClose = null,
    options = {},
  ) => {
    openModal('info', title, message, data, onClose, null, options);
  };

  // 성공 모달
  const openSuccessModal = (
    title,
    message,
    data = null,
    onClose = null,
    options = {},
  ) => {
    openModal('success', title, message, data, onClose, null, options);
  };

  // 경고 모달
  const openWarningModal = (
    title,
    message,
    data = null,
    confirmAction = null,
    options = {},
  ) => {
    openModal('warning', title, message, data, confirmAction, null, options);
  };

  // 오류 모달
  const openErrorModal = (
    title,
    message,
    data = null,
    onClose = null,
    options = {},
  ) => {
    openModal('error', title, message, data, onClose, null, options);
  };

  // 확인 모달 (예/아니오)
  const openConfirmModal = (
    title,
    message,
    data = null,
    confirmAction = null,
    cancelAction = null,
    options = {},
  ) => {
    openModal(
      'confirm',
      title,
      message,
      data,
      confirmAction,
      cancelAction,
      options,
    );
  };

  // 폼 모달
  const openFormModal = (
    title,
    message,
    formFields,
    onSubmit,
    onCancel = null,
    options = {},
  ) => {
    openModal('form', title, message, null, onSubmit, onCancel, {
      ...options,
      formFields,
    });
  };

  // 커스텀 폼 모달 하단 버튼 제거
  const openCustomModal = (title, message, data = null, options = {}) => {
    openModal('custom', title, message, data, null, null, options);
  };

  // 모달 업데이트 (이미 열린 모달의 내용 변경 시)
  const updateModalData = (newData) => {
    setModalState((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        ...newData,
      },
    }));
  };

  // 모달 폼 필드 업데이트
  const updateFormField = (fieldId, value) => {
    setModalState((prevState) => {
      if (!prevState.formFields) return prevState;

      const updatedFields = prevState.formFields.map((field) =>
        field.id === fieldId ? { ...field, value } : field,
      );

      return {
        ...prevState,
        formFields: updatedFields,
      };
    });
  };

  // 폼 필드 오류 설정
  const setFormFieldError = (fieldId, error) => {
    setModalState((prevState) => {
      if (!prevState.formFields) return prevState;

      const updatedFields = prevState.formFields.map((field) =>
        field.id === fieldId ? { ...field, error } : field,
      );

      return {
        ...prevState,
        formFields: updatedFields,
      };
    });
  };

  return {
    modalState,
    openModal,
    closeModal,
    handleConfirm,
    openDeleteModal,
    openInfoModal,
    openSuccessModal,
    openWarningModal,
    openErrorModal,
    openConfirmModal,
    openFormModal,
    openCustomModal,
    updateModalData,
    updateFormField,
    setFormFieldError,
  };
};

export default useModal;
