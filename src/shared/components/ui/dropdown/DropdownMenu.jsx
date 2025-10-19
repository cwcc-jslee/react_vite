/**
 * DropdownMenu 컴포넌트
 * 더보기 메뉴 및 컨텍스트 메뉴를 위한 드롭다운 컴포넌트
 */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * DropdownMenuTrigger - 드롭다운을 여는 트리거 버튼
 */
export const DropdownMenuTrigger = ({ children, asChild }) => {
  return <>{children}</>;
};

DropdownMenuTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool,
};

/**
 * DropdownMenuContent - 드롭다운 메뉴 컨텐츠
 */
export const DropdownMenuContent = ({ children, align = 'start' }) => {
  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`
        absolute top-full mt-2 z-50
        min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg
        ${alignClasses[align]}
      `}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

DropdownMenuContent.propTypes = {
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['start', 'end', 'center']),
};

/**
 * DropdownMenuItem - 드롭다운 메뉴 아이템
 */
export const DropdownMenuItem = ({ children, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-4 py-2 text-left text-sm
        flex items-center gap-2
        hover:bg-gray-100 transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
};

DropdownMenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

/**
 * DropdownMenuSeparator - 드롭다운 메뉴 구분선
 */
export const DropdownMenuSeparator = () => {
  return <div className="my-1 h-px bg-gray-200" />;
};

/**
 * DropdownMenu - 메인 드롭다운 컴포넌트
 */
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 키 감지
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // children을 순회하며 Trigger와 Content에 props 전달
  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    if (child.type === DropdownMenuTrigger) {
      return React.cloneElement(child, {
        children: (
          <div onClick={() => setIsOpen(!isOpen)}>
            {child.props.children}
          </div>
        ),
      });
    }

    if (child.type === DropdownMenuContent) {
      return isOpen ? child : null;
    }

    return child;
  });

  return (
    <div ref={menuRef} className="relative inline-block">
      {childrenWithProps}
    </div>
  );
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DropdownMenu;
