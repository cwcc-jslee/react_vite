/**
 * 텍스트 기반 탭 메뉴 컴포넌트
 * - 하단 라인 및 글씨 굵기 스타일 적용
 * - 수평 배치 레이아웃
 *
 * @date 25.03.24
 * @version 1.0.0
 * @filename src/shared/components/ui/layout/TabMenu.jsx
 */
import React from 'react';

/**
 * 텍스트 기반 탭 메뉴 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.items - 메뉴 항목 배열 [{id: string, label: string}]
 * @param {string} props.activeId - 현재 활성화된 탭의 ID
 * @param {Function} props.onChange - 탭 변경 핸들러 함수
 * @param {string} [props.className=''] - 추가 CSS 클래스
 * @returns {JSX.Element} 탭 메뉴 컴포넌트
 */
const TabMenu = ({ items = [], activeId, onChange, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="flex space-x-8">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              py-3 px-1 cursor-pointer relative transition-all
              ${
                activeId === item.id
                  ? 'font-bold text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }
            `}
            role="tab"
            aria-selected={activeId === item.id}
            tabIndex={0}
          >
            {item.label}
            {activeId === item.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabMenu;
