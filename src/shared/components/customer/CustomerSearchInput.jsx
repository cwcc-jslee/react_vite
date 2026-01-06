// src/shared/components/customer/CustomerSearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { Message, Input } from '../ui';

/**
 * 고객사 검색 입력 컴포넌트
 * 포탈(Portal)을 사용하여 드롭다운이 부모 컨테이너에 의해 잘리지 않도록 구현됨
 */
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
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 });
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // 드롭다운 위치 계산 함수
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        // 포탈 드롭다운 내부 클릭도 체크해야 함
        const dropdownElement = document.getElementById('customer-search-portal');
        if (dropdownElement && dropdownElement.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      setSearchTerm(value);
      setIsOpen(true);
      updateDropdownPosition();
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

  // 드롭다운 내용물
  const dropdownContent = (
    <div 
      id="customer-search-portal"
      className="fixed z-[9999] bg-white border border-gray-200 rounded-b-md shadow-xl overflow-hidden"
      style={{
        top: `${dropdownRect.top}px`,
        left: `${dropdownRect.left}px`,
        width: `${dropdownRect.width}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
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
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-700">{customer.name}</div>
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
  );

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div ref={inputRef}>
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
          onFocus={() => {
            if (inputValue) {
              setIsOpen(true);
              updateDropdownPosition();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          error={error}
          className={`w-full ${sizeClasses[size] || sizeClasses.default} 
            ${isOpen ? 'rounded-b-none' : ''}`}
        />
      </div>

      {error && <Message type="error">{error}</Message>}

      {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default CustomerSearchInput;