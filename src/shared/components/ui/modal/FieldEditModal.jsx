/**
 * 범용 필드 편집 모달 컴포넌트
 * - 다양한 타입의 필드 편집 지원 (input, select, customer, switch, radio 등)
 * - 재사용 가능한 범용 모달
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from '@shared/components/ui/modal/Modal';
import { Button, Input, Select, Switch } from '@shared/components/ui';
import CustomerSearchInput from '@shared/components/customer/CustomerSearchInput';

/**
 * @typedef {Object} FieldConfig
 * @property {string} fieldName - 필드 이름 (예: 'sfaSalesType')
 * @property {string} label - 필드 라벨 (예: '매출유형')
 * @property {'input'|'select'|'customer'|'switch'|'radio'} type - 입력 타입
 * @property {Array} [options] - select/radio 옵션 배열 [{id, name}]
 * @property {string} [placeholder] - placeholder 텍스트
 * @property {boolean} [required] - 필수 여부
 * @property {string} [description] - 필드 설명
 */

/**
 * 필드 편집 모달
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {FieldConfig} props.fieldConfig - 필드 설정
 * @param {any} props.initialValue - 초기값
 * @param {Function} props.onSave - 저장 핸들러 (newValue) => Promise<void>
 * @param {boolean} [props.isLoading] - 로딩 상태
 */
const FieldEditModal = ({
  isOpen,
  onClose,
  fieldConfig,
  initialValue,
  onSave,
  isLoading = false,
}) => {
  const [editValue, setEditValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // initialValue 변경 시 editValue 업데이트
  useEffect(() => {
    setEditValue(initialValue);
    setValidationError(''); // 에러 초기화
  }, [initialValue]);

  // 값 변경 감지
  const hasChanged = useMemo(() => {
    if (typeof editValue === 'object' && editValue !== null) {
      return JSON.stringify(editValue) !== JSON.stringify(initialValue);
    }
    return editValue !== initialValue;
  }, [editValue, initialValue]);

  // Validation 함수
  const validateField = () => {
    const { required, type } = fieldConfig;

    // Required 검증
    if (required) {
      if (type === 'customer') {
        if (!editValue || !editValue.id) {
          setValidationError('필수 항목입니다.');
          return false;
        }
      } else if (type === 'switch') {
        // Switch는 항상 유효 (true/false)
      } else if (!editValue || (typeof editValue === 'string' && editValue.trim() === '')) {
        setValidationError('필수 항목입니다.');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  // 저장 핸들러
  const handleSave = async () => {
    // Validation 체크
    if (!validateField()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue);
      onClose();
    } catch (error) {
      console.error('Failed to save field:', error);

      // 에러 메시지 설정
      if (error.response?.data?.message) {
        setValidationError(error.response.data.message);
      } else if (error.message) {
        setValidationError(error.message);
      } else {
        setValidationError('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setEditValue(initialValue); // 원래 값으로 복원
    setValidationError(''); // 에러 초기화
    onClose();
  };

  // Enter 키 저장
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && fieldConfig.type === 'input') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // 입력 필드 렌더링
  const renderField = () => {
    const { type, options, placeholder } = fieldConfig;

    switch (type) {
      case 'select':
        return (
          <Select
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setValidationError(''); // 값 변경 시 에러 초기화
            }}
            className={`w-full ${validationError ? 'border-red-500 focus:ring-red-500' : ''}`}
            autoFocus
          >
            <option value="">선택하세요</option>
            {options?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        );

      case 'customer':
        return (
          <CustomerSearchInput
            value={editValue}
            onSelect={(selected) => {
              setEditValue({
                id: selected.id,
                name: selected.name,
              });
              setValidationError(''); // 값 변경 시 에러 초기화
            }}
            placeholder={placeholder || '고객사를 검색하세요'}
          />
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-3 py-2">
            <Switch
              checked={editValue === true}
              onChange={() => setEditValue(!editValue)}
            />
            <span className={`text-sm font-medium transition-colors ${
              editValue ? 'text-green-600' : 'text-gray-500'
            }`}>
              {editValue ? '활성' : '비활성'}
            </span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="radio"
                  name={fieldConfig.fieldName}
                  value={option.id}
                  checked={editValue === option.id}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    setValidationError(''); // 값 변경 시 에러 초기화
                  }}
                  className={`h-4 w-4 transition-all ${
                    editValue === option.id
                      ? 'text-blue-600 ring-2 ring-blue-200'
                      : 'text-gray-400'
                  } focus:ring-blue-500`}
                />
                <span className="text-sm">{option.name}</span>
              </label>
            ))}
          </div>
        );

      case 'input':
      default:
        return (
          <Input
            type="text"
            value={editValue || ''}
            onChange={(e) => {
              setEditValue(e.target.value);
              setValidationError(''); // 값 변경 시 에러 초기화
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${validationError ? 'border-red-500 focus:ring-red-500' : ''}`}
            autoFocus
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`${fieldConfig.label} 수정`}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || isLoading || !hasChanged}
          >
            {isSaving ? '저장 중...' : '적용'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 필드 설명 (있는 경우) */}
        {fieldConfig.description && (
          <p className="text-sm text-gray-600">{fieldConfig.description}</p>
        )}

        {/* 필드 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {fieldConfig.label}
            {fieldConfig.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          {renderField()}

          {/* Validation 에러 메시지 */}
          {validationError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationError}
            </p>
          )}
        </div>

        {/* 키보드 단축키 안내 (input인 경우) */}
        {fieldConfig.type === 'input' && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Enter: 적용 | Esc: 취소
          </p>
        )}
      </div>
    </Modal>
  );
};

FieldEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fieldConfig: PropTypes.shape({
    fieldName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['input', 'select', 'customer', 'switch', 'radio']).isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    description: PropTypes.string,
  }).isRequired,
  initialValue: PropTypes.any,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default FieldEditModal;
