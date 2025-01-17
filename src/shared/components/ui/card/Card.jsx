import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
