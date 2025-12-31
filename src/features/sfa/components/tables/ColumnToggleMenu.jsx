// src/features/sfa/components/tables/ColumnToggleMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';

/**
 * 테이블 컬럼 토글 메뉴 컴포넌트
 * 사용자가 원하는 컬럼만 표시/숨김 가능
 *
 * @param {Object} props
 * @param {Array} props.columns - 전체 컬럼 정의 배열
 * @param {Array} props.visibleColumns - 현재 표시중인 컬럼 키 배열
 * @param {Function} props.onToggleColumn - 컬럼 토글 핸들러
 * @param {Array} props.essentialColumns - 필수 컬럼 (숨길 수 없음)
 * @param {Array} props.defaultVisibleColumns - 기본 표시 컬럼 배열
 */
const ColumnToggleMenu = ({
  columns,
  visibleColumns,
  onToggleColumn,
  essentialColumns = ['no', 'name', 'action'],
  defaultVisibleColumns = [],
}) => {
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

  // 컬럼 그룹 분류
  const columnGroups = {
    essential: columns.filter((col) => essentialColumns.includes(col.key)),
    optional: columns.filter((col) => !essentialColumns.includes(col.key)),
  };

  const handleToggle = (columnKey) => {
    if (essentialColumns.includes(columnKey)) {
      return; // 필수 컬럼은 토글 불가
    }
    onToggleColumn(columnKey);
  };

  const isVisible = (columnKey) => visibleColumns.includes(columnKey);

  return (
    <div className="relative group" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
      >
        <Settings size={16} />
      </button>
      {/* 툴팁 */}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
        컬럼 설정
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              표시할 컬럼 선택
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {visibleColumns.length} / {columns.length} 컬럼 표시 중
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* 필수 컬럼 */}
            <div className="p-2 border-b border-gray-100">
              <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                필수 컬럼
              </p>
              {columnGroups.essential.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-not-allowed opacity-75"
                >
                  <div className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded">
                    <Check size={14} className="text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">{column.title}</span>
                  <span className="ml-auto text-xs text-gray-400">필수</span>
                </label>
              ))}
            </div>

            {/* 선택 가능한 컬럼 */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                선택 컬럼
              </p>
              {columnGroups.optional.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isVisible(column.key)}
                    onChange={() => handleToggle(column.key)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{column.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="p-2 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => {
                // 모두 선택
                columns.forEach((col) => {
                  if (
                    !essentialColumns.includes(col.key) &&
                    !isVisible(col.key)
                  ) {
                    onToggleColumn(col.key);
                  }
                });
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              모두 선택
            </button>
            <button
              onClick={() => {
                // 기본값으로 설정
                columns.forEach((col) => {
                  if (essentialColumns.includes(col.key)) {
                    return; // 필수 컬럼은 건너뛰기
                  }

                  const shouldBeVisible = defaultVisibleColumns.includes(col.key);
                  const isCurrentlyVisible = isVisible(col.key);

                  // 현재 상태와 기본값 상태가 다르면 토글
                  if (shouldBeVisible !== isCurrentlyVisible) {
                    onToggleColumn(col.key);
                  }
                });
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              기본값
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnToggleMenu;
