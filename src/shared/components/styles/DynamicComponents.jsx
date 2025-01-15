// src/shared/components/styles/DynamicComponents.jsx
import React from 'react';
import styled from 'styled-components';

/**
 * props를 사용하는 동적 스타일 컴포넌트들
 */

// DrawerWrapper 컴포넌트
export const DrawerWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ $width }) => $width || '900px'};
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
`;

// DrawerContent 컴포넌트
export const DrawerContent = styled.div`
  padding: 0 24px 24px 24px;
  height: ${({ $hasMenu }) =>
    $hasMenu ? 'calc(100vh - 120px)' : 'calc(100vh - 72px)'};
  overflow-y: auto;
`;

// ActionButton 컴포넌트
export const ActionButton = styled.button`
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? 'white' : '#374151')};
  background-color: ${({ $active }) => ($active ? '#2563eb' : 'white')};
  border: ${({ $active }) => ($active ? 'none' : '1px solid #e5e7eb')};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#1d4ed8' : '#f9fafb')};
  }

  &:disabled {
    background-color: ${({ $active }) => ($active ? '#93c5fd' : '#f9fafb')};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// ToggleSwitch 컴포넌트
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
    background: ${({ $disabled }) => ($disabled ? '#9CA3AF' : '#4F46E5')};
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
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
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

export const ToggleSwitch = ({ checked, onChange, disabled, id, label }) => (
  <StyledToggleSwitch>
    <ToggleSwitchInput
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      $disabled={disabled}
    />
    <ToggleSwitchLabel htmlFor={id} aria-label={label} $disabled={disabled} />
  </StyledToggleSwitch>
);