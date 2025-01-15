// src/shared/components/drawer/styles/formStyles.js
import styled from 'styled-components';

// 1. 전체 폼 컨테이너 - 좌우 패딩 조정
export const FormContainer = styled.form`
  width: 100%;
  max-width: calc(100% - 48px);
  padding: 25px 10px; // 상하 - 좌우 패딩 조정
  margin: 0 auto;
  box-sizing: border-box;
`;

// 2. 폼 섹션 - 그리드 레이아웃 조정
export const FormSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); // 2열 그리드
  gap: 24px; // 섹션 간격 조정
  margin-bottom: 24px;
  padding-right: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  &.full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-right: 16px;
  }
`;

// 3. 폼 행 - Label과 Input 영역의 비율 조정
export const FormRowInline = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr; // Label 너비를 80px로 조정
  gap: 16px; // Label과 Input 사이 간격
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 12px;
  }
`;

// 4. Label 스타일
export const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;

  &.required::after {
    content: '*';
    color: #ef4444;
    margin-left: 4px; // Input과 세로 정렬을 위한 상단 패딩
  }
`;

// 5. Input 컨테이너 - 입력 영역 전체 스타일
export const InputContainer = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

// 6. 기본 입력 필드 스타일 (Input, Select, TextArea 공통)
const baseInputStyles = `
  width: 100%;
  height: 36px;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  &:hover {
    border-color: #d1d5db;
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  &.error {
    border-color: #ef4444;
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
    }
  }
`;

// 7. Input 스타일
export const Input = styled.input`
  ${baseInputStyles}
`;

// 8. Select 스타일
export const Select = styled.select`
  ${baseInputStyles}
  padding-right: 32px; // 드롭다운 아이콘을 위한 여유 공간
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  appearance: none;
`;

// 9. TextArea 스타일
export const TextArea = styled.textarea`
  ${baseInputStyles}
  height: auto;
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  width: 100%;
`;

export const ActionButton = styled.button`
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background-color: #2563eb;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #1d4ed8;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  &.cancel {
    color: #374151;
    background-color: white;
    border: 1px solid #e5e7eb;

    &:hover {
      background-color: #f9fafb;
    }

    &:disabled {
      background-color: #f9fafb;
      border-color: #e5e7eb;
    }
  }
`;

export const SubmitButton = styled.button`
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #1d4ed8;
  }
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

export const HelpText = styled.div`
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: #4f46e5;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 3.5rem;
  height: 2rem;
  background: ${(props) => (props.checked ? '#4F46E5' : '#D1D5DB')};
  border-radius: 2rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    top: 0.25rem;
    left: ${(props) => (props.checked ? '1.75rem' : '0.25rem')};
    background: white;
    transition: all 0.3s ease;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const ReadOnlyText = styled.div`
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
`;
