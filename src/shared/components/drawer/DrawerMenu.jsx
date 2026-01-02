/**
 * DrawerMenu 통합 컴포넌트
 * Toggle, Dropdown, Tabs 스타일의 메뉴를 하나의 컴포넌트로 통합
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EllipsisVertical } from 'lucide-react';
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
    // 구분선을 위한 아이템 필터링
    const menuItems = items.filter((item) => !item.separator);
    const separatorIndices = items
      .map((item, index) => (item.separator ? index : null))
      .filter((index) => index !== null);

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
    }),
  ).isRequired,
  activeKey: PropTypes.string,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
};

export default DrawerMenu;
