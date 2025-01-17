// src/shared/components/ui/state/StateDisplay.jsx
import React from 'react';

export const StateDisplay = ({ type = 'empty', message, className = '' }) => {
  const styles = {
    empty: 'text-gray-500 bg-white',
    loading: 'text-gray-500 bg-white',
    error: 'text-red-600 bg-red-50',
  };

  return (
    <div className={`p-12 text-center ${styles[type]} ${className}`}>
      {message || getDefaultMessage(type)}
    </div>
  );
};

const getDefaultMessage = (type) => {
  const messages = {
    empty: '데이터가 없습니다.',
    loading: '데이터를 불러오는 중...',
    error: '오류가 발생했습니다.',
  };
  return messages[type];
};
