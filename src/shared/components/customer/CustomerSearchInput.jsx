// shared/components/customer/CustomerSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { Message } from '../ui/index';

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

// 에러 메시지
export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

// 사이즈 변형을 위한 CSS
const inputSizeVariants = {
  default: css`
    height: 40px;
    font-size: 14px;
  `,
  small: css`
    height: 36px;
    font-size: 13px;
  `,
  large: css`
    height: 44px;
    font-size: 15px;
  `,
};

// 기본 입력 필드는 formStyles의 Input을 확장
const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  /* 사이즈 변형 적용 */
  ${(props) => inputSizeVariants[props.size || 'default']}

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
  }

  &.has-dropdown {
    border-bottom-left-radius: ${(props) => (props.isOpen ? '0' : '4px')};
    border-bottom-right-radius: ${(props) => (props.isOpen ? '0' : '4px')};
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  z-index: 50;
  width: 100%;
  max-width: 100%; // 드롭다운이 입력 필드 너비를 초과하지 않도록 함
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: -1px;
`;

const DropdownList = styled.ul`
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f9fafb;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }

  .item-name {
    font-size: 13px;
    color: #374151;
  }

  .item-code {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

const MessageContainer = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
`;

const AlertMessage = styled.div`
  margin: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;

  ${(props) => {
    switch (props.type) {
      case 'error':
        return `
          background-color: #fee2e2;
          color: #991b1b;
        `;
      case 'loading':
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

export const CustomerSearchInput = ({
  onSelect,
  placeholder = '고객사를 입력하세요',
  initialValue = '',
  disabled = false,
  required = false,
  error = null,
  className = '',
  size = 'default', // 새로운 size prop 추가
  style, // 커스텀 스타일을 위한 prop 추가
  ...props
}) => {
  const {
    setSearchTerm,
    isComposing,
    setIsComposing,
    results,
    isLoading,
    error: searchError,
  } = useCustomerSearch(initialValue);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setSearchTerm(value);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (customer) => {
    setInputValue(customer.name);
    onSelect(customer);
    setIsOpen(false);
  };

  return (
    <InputWrapper ref={wrapperRef} className={className} style={style}>
      <SearchInput
        {...props}
        value={inputValue}
        onChange={handleChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);
          setSearchTerm(e.target.value);
        }}
        onFocus={() => inputValue && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${isOpen ? 'has-dropdown' : ''} ${error ? 'error' : ''}`}
        isOpen={isOpen}
        size={size}
      />

      {/* {error && <ErrorMessage>{error}</ErrorMessage>} */}
      {error && <Message type="error">{error}</Message>}

      {isOpen && (
        <DropdownContainer>
          {isLoading && <AlertMessage type="loading">검색중...</AlertMessage>}

          {!isLoading && searchError && (
            <AlertMessage type="error">
              검색 중 오류가 발생했습니다. 다시 시도해 주세요.
            </AlertMessage>
          )}

          {!isLoading && !searchError && results.length > 0 && (
            <DropdownList>
              {results.map((customer) => (
                <DropdownItem
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                >
                  <div className="item-name">{customer.name}</div>
                  {customer.code && (
                    <div className="item-code">코드: {customer.code}</div>
                  )}
                </DropdownItem>
              ))}
            </DropdownList>
          )}

          {!isLoading && !searchError && results.length === 0 && inputValue && (
            <MessageContainer>검색 결과가 없습니다.</MessageContainer>
          )}
        </DropdownContainer>
      )}
    </InputWrapper>
  );
};

export default CustomerSearchInput;
