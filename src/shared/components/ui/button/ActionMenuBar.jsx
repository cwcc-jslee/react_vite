/**
 * 컨트롤 메뉴(View/Edit)와 기능 메뉴를 결합한 통합 메뉴바 컴포넌트입니다.
 * 메뉴 타입에 따라 시각적으로 구분되며, 상태에 따라 동적으로 기능 메뉴를 표시합니다.
 */

// src/shared/components/ui/button/ActionMenuBar.jsx
import React from 'react';
import { Button } from '../index';

/**
 * @typedef {Object} ControlMenuItem
 * @property {string} key - 메뉴 아이템의 고유 키
 * @property {string} label - 표시될 라벨
 * @property {Function} onClick - 클릭 이벤트 핸들러
 * @property {boolean} [active] - 활성화 상태 여부
 */

/**
 * @typedef {Object} FunctionMenuItem
 * @property {string} key - 메뉴 아이템의 고유 키
 * @property {string} label - 표시될 라벨
 * @property {Function} onClick - 클릭 이벤트 핸들러
 */

/**
 * ButtonGroup - 컨트롤 메뉴와 기능 메뉴를 통합적으로 표시하는 컴포넌트
 *
 * @param {Object} props
 * @param {ControlMenuItem[]} props.controlMenus - 컨트롤 메뉴 항목들 (view, edit)
 * @param {FunctionMenuItem[]} props.functionMenus - 기능 메뉴 항목들 (기본정보수정 등)
 * @param {string} [props.className] - 추가 스타일 클래스
 */
const ActionMenuBar = ({ controlMenus, functionMenus, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* 컨트롤 메뉴 */}
      <div className="inline-flex rounded-md shadow-sm">
        {controlMenus.map((item, index) => (
          <Button
            key={item.key}
            variant={item.active ? 'primary' : 'outline'}
            size="sm"
            className={`
              ${index === 0 ? 'rounded-l-md rounded-r-none' : ''}
              ${
                index === controlMenus.length - 1
                  ? 'rounded-r-md rounded-l-none'
                  : ''
              }
              ${
                index !== 0 && index !== controlMenus.length - 1
                  ? 'rounded-none'
                  : ''
              }
              ${item.active ? 'z-10' : ''}
              -ml-px first:ml-0
              min-w-[80px]
              font-medium
            `}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* 구분선 */}
      {functionMenus.length > 0 && (
        <div className="h-6 w-px bg-gray-300 mx-2" />
      )}

      {/* 기능 메뉴 */}
      <div className="inline-flex gap-2">
        {functionMenus.map((item) => (
          <Button
            key={item.key}
            variant="outline"
            size="sm"
            className={`
              min-w-[120px]
              font-medium
              ${
                item.active
                  ? 'bg-blue-100 text-gray-900 border-gray-400'
                  : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionMenuBar;
