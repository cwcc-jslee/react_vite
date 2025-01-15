// src/shared/components/form/FormComponents.jsx
import React from 'react';
import styled, { css } from 'styled-components';

/**
 * 기본 입력 필드 스타일 (Input, Select, TextArea 공통)
 */
const baseInputStyles = css`
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

/**
 * Toggle Switch 스타일 컴포넌트
 */
const StyledToggleSwitch = styled.div`
  position: relative;
  width: 3.5rem;
  height: 2rem;
`;

const ToggleSwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + label {
    background: #4F46E5;
  }

  &:checked + label:before {
    transform: translateX(1.5rem);
  }

  &:disabled + label {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ToggleSwitchLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 3.5rem;
  height: 2rem;
  background: #D1D5DB;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    top: 0.25rem;
    left: 0.25rem;
    background: white;
    transition: transform 0.3s ease;
  }
`;

/**
 * ToggleSwitch 컴포넌트
 */
export const ToggleSwitch = ({ checked, onChange, disabled, id, label }) => (
  <StyledToggleSwitch>
    <ToggleSwitchInput
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
    <ToggleSwitchLabel htmlFor={id} aria-label={label} />
  </StyledToggleSwitch>
);

/**
 * 입력 필드 컴포넌트들
 */
export const Input = styled.input`
  ${baseInputStyles}
`;

export const Select = styled.select`
  ${baseInputStyles}
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  appearance: none;
`;

export const TextArea = styled.textarea`
  ${baseInputStyles}
  height: auto;
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
`;

/**
 * 기타 컴포넌트들
 */
export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
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
  }
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