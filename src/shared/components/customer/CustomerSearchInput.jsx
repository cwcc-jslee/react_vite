// src/shared/components/customer/CustomerSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { Message, Input } from '../ui';

export const CustomerSearchInput = ({
  onSelect,
  placeholder = '고객사를 입력하세요',
  initialValue = '',
  disabled = false,
  required = false,
  error = null,
  className = '',
  size = 'default',
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

  // 사이즈별 Input 클래스 설정
  const sizeClasses = {
    small: 'h-9 text-sm',
    default: 'h-10 text-base',
    large: 'h-11 text-lg',
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <Input
        {...props}
        type="text"
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
        error={error}
        className={`w-full ${sizeClasses[size] || sizeClasses.default} 
          ${isOpen ? 'rounded-b-none border-b-0' : ''}`}
      />

      {error && <Message type="error">{error}</Message>}

      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 border-t-0 rounded-b-md shadow-lg">
          {isLoading && (
            <div className="p-3 text-sm text-gray-600 bg-gray-50">
              검색중...
            </div>
          )}

          {!isLoading && searchError && (
            <div className="p-3 text-sm text-red-700 bg-red-50">
              검색 중 오류가 발생했습니다. 다시 시도해 주세요.
            </div>
          )}

          {!isLoading && !searchError && results.length > 0 && (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((customer) => (
                <li
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="text-sm text-gray-700">{customer.name}</div>
                  {customer.code && (
                    <div className="text-xs text-gray-500">
                      코드: {customer.code}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !searchError && results.length === 0 && inputValue && (
            <div className="p-3 text-center text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearchInput;
