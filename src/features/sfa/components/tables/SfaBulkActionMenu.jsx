import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu } from 'lucide-react';

const SfaBulkActionMenu = ({ onEditDate, onEditProbability }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuContentRef = useRef(null);

  useEffect(() => {
    const handleScrollOrResize = (e) => {
      if (isOpen) {
        if (
          menuContentRef.current &&
          e.target &&
          menuContentRef.current.contains(e.target)
        ) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 12rem = 192px
      const viewportHeight = window.innerHeight;
      const margin = 10;
      const defaultMaxHeight = 200;

      let left = rect.right - menuWidth;
      if (left < margin) left = margin;

      const spaceBelow = viewportHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;

      let style = {
        left: `${left}px`,
        display: 'flex',
        flexDirection: 'column',
      };

      if (spaceBelow >= Math.min(spaceAbove, 150)) {
        style.top = `${rect.bottom + 5}px`;
        style.maxHeight = `${Math.min(defaultMaxHeight, spaceBelow)}px`;
      } else {
        style.bottom = `${viewportHeight - rect.top + 5}px`;
        style.maxHeight = `${Math.min(defaultMaxHeight, spaceAbove)}px`;
        style.top = 'auto';
      }

      setMenuPosition(style);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative group inline-block">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
        </svg>
      </button>
      
      {/* 툴팁 */}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
        일괄수정
      </div>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] isolate">
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div
            ref={menuContentRef}
            className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={menuPosition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1 overflow-y-auto min-h-0 flex-1">
              <button
                onClick={() => handleAction(onEditDate)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                매출일 일괄수정
              </button>
              <button
                onClick={() => handleAction(onEditProbability)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                확률 일괄수정
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SfaBulkActionMenu;
