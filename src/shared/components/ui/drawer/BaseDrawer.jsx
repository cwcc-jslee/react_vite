// src/shared/components/ui/drawer/BaseDrawer.jsx
import React from 'react';

const BaseDrawer = ({
  visible,
  title,
  width = '900px',
  onClose,
  menu,
  children,
  enableOverlayClick = false,
}) => {
  if (!visible) return null;

  return (
    <>
      {/* Portal Root를 사용하여 최상위에 렌더링 */}
      <div className="fixed inset-0 z-[9999] overflow-hidden">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={enableOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          className="fixed inset-y-0 right-0 flex flex-col w-full bg-white shadow-xl"
          style={{ maxWidth: width }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="drawer-title" className="text-lg font-medium text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Close panel</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu */}
          {menu && (
            <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-200 bg-gray-50">
              {menu}
            </div>
          )}

          {/* Content */}
          <div className="relative flex-1 h-0 overflow-y-auto">
            <div className="absolute inset-0 p-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseDrawer;
