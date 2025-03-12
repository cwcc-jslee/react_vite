// src/shared/components/ui/drawer/Drawer.jsx
import React from 'react';

export const Drawer = ({
  children,
  width = 'md',
  hasMenu = false,
  className = '',
}) => {
  const widthClasses = {
    sm: 'w-96',
    md: 'w-[600px]',
    lg: 'w-[900px]',
    xl: 'w-[1200px]',
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen bg-white shadow-lg z-50 
      ${widthClasses[width]} ${className}`}
    >
      {children}
    </div>
  );
};

export const DrawerContent = ({
  children,
  hasMenu = false,
  className = '',
}) => {
  return (
    <div
      className={`p-6 h-[calc(100vh-${hasMenu ? '120px' : '72px'})] 
        overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
};
