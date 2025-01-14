// src/shared/components/common/styles/formStyles.js
import styled from 'styled-components';

// 기본 입력 스타일 (Input, Select, TextArea 공통)
const baseInputStyles = `
  width: 100%;
  height: 36px;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease-in-out;

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

// 입력 필드
export const Input = styled.input`
  ${baseInputStyles}
`;

// 선택 필드
export const Select = styled.select`
  ${baseInputStyles}
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  appearance: none;
`;

// 텍스트 영역
export const TextArea = styled.textarea`
  ${baseInputStyles}
  height: auto;
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
`;

// 라벨
export const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;

  &.required::after {
    content: '*';
    color: #ef4444;
    margin-left: 4px;
  }
`;

// 에러 메시지
export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

// 도움말 텍스트
export const HelpText = styled.div`
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
`;

// 기본 버튼
export const Button = styled.button`
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  // 버튼 variants
  &.primary {
    color: white;
    background-color: #2563eb;
    border: none;

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }

  &.secondary {
    color: #374151;
    background-color: white;
    border: 1px solid #e5e7eb;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
    }
  }

  &.danger {
    color: white;
    background-color: #ef4444;
    border: none;

    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  }
`;

// 기본 폼 레이아웃
export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormRowInline = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

// 버튼 그룹
export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: ${(props) => props.align || 'flex-start'};
  margin-top: ${(props) => props.marginTop || '0'};
`;

// 읽기 전용 텍스트 필드
export const ReadOnlyField = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: #374151;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-height: 36px;
  display: flex;
  align-items: center;
`;
