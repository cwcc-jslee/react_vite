/**
 * DrawerMenu 통합 컴포넌트
 * Toggle, Dropdown, Tabs 스타일의 메뉴를 하나의 컴포넌트로 통합
 * Submenu 기능 추가
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EllipsisVertical, ChevronRight } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui';

/**
 * @typedef {import('./types/drawer.types').DrawerMenuProps} DrawerMenuProps
 * @typedef {import('./types/drawer.types').DrawerMenuItem} DrawerMenuItem
 */

/**
 * SubmenuItem - 서브메뉴를 가진 드롭다운 아이템
 * 호버 시 서브메뉴를 우측에 표시
 */
const SubmenuItem = ({ item, onItemClick }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsSubmenuOpen(true)}
      onMouseLeave={() => setIsSubmenuOpen(false)}
    >
      <button
        type="button"
        className={`
          w-full px-4 py-2 text-left text-sm
          flex items-center justify-between gap-2
          hover:bg-gray-100 transition-colors
          ${item.className || ''}
        `}
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.label}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </button>

      {/* 서브메뉴 */}
      {isSubmenuOpen && (
        <div
          className="
            absolute left-full top-0 ml-1 z-50
            min-w-[160px] rounded-md border border-gray-200 bg-white shadow-lg
          "
        >
          <div className="py-1">
            {item.submenu.map((subitem) => (
              <button
                key={subitem.key}
                type="button"
                onClick={() => {
                  if (subitem.onClick) {
                    subitem.onClick();
                  } else if (onItemClick) {
                    onItemClick(subitem.key);
                  }
                }}
                disabled={subitem.disabled}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  flex items-center gap-2
                  hover:bg-gray-100 transition-colors
                  ${subitem.className || ''}
                `}
              >
                {subitem.icon && <subitem.icon className="h-4 w-4" />}
                {subitem.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SubmenuItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    className: PropTypes.string,
    submenu: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        icon: PropTypes.elementType,
        disabled: PropTypes.bool,
        className: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  onItemClick: PropTypes.func,
};

/**
 * DrawerMenu 컴포넌트
 *
 * @param {DrawerMenuProps} props
 * @returns {React.ReactElement}
 */
const DrawerMenu = ({
  type = 'toggle',
  items = [],
  activeKey,
  onItemClick,
  className = '',
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  // ==================== Toggle 스타일 (View/Edit 전환) ====================
  if (type === 'toggle') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {items.map((item) => {
          const isActive = item.active ?? (activeKey === item.key);

          return (
            <Button
              key={item.key}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (onItemClick) {
                  onItemClick(item.key);
                }
              }}
              disabled={item.disabled}
              className={`
                h-8 px-3
                ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.label}
            </Button>
          );
        })}
      </div>
    );
  }

  // ==================== Dropdown 스타일 (더보기 메뉴) ====================
  if (type === 'dropdown') {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100 rounded-md">
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {items.map((item, index) => {
              // 구분선
              if (item.separator) {
                return <DropdownMenuSeparator key={`separator-${index}`} />;
              }

              // 서브메뉴가 있는 경우
              if (item.submenu && item.submenu.length > 0) {
                return (
                  <SubmenuItem
                    key={item.key}
                    item={item}
                    onItemClick={onItemClick}
                  />
                );
              }

              // 일반 메뉴 아이템
              return (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (onItemClick) {
                      onItemClick(item.key);
                    }
                  }}
                  disabled={item.disabled}
                  className={item.className || ''}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // ==================== Tabs 스타일 (탭 메뉴) ====================
  if (type === 'tabs') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {items.map((item) => {
          const isActive = item.active ?? (activeKey === item.key);

          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (onItemClick) {
                  onItemClick(item.key);
                }
              }}
              disabled={item.disabled}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4 inline" />}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  // 알 수 없는 타입
  return null;
};

DrawerMenu.propTypes = {
  type: PropTypes.oneOf(['toggle', 'dropdown', 'tabs']),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      onClick: PropTypes.func,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool,
      active: PropTypes.bool,
      separator: PropTypes.bool, // dropdown에서만 사용
      className: PropTypes.string,
      submenu: PropTypes.arrayOf( // 서브메뉴 지원
        PropTypes.shape({
          key: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          onClick: PropTypes.func,
          icon: PropTypes.elementType,
          disabled: PropTypes.bool,
          className: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
  activeKey: PropTypes.string,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
};

export default DrawerMenu;
