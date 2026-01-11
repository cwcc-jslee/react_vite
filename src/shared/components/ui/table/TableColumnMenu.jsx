import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Check } from 'lucide-react';

/**
 * 테이블 컬럼 토글 메뉴 공통 컴포넌트
 * 사용자가 원하는 컬럼만 표시/숨김 가능
 * Portal을 사용하여 테이블 내 스크롤 문제 해결
 *
 * @param {Object} props
 * @param {Array} props.columns - 전체 컬럼 정의 배열 (key, title 포함)
 * @param {Array} props.visibleColumns - 현재 표시중인 컬럼 키 배열
 * @param {Function} props.onToggleColumn - 컬럼 토글 핸들러 (단일 컬럼)
 * @param {Function} [props.onReset] - 초기값으로 리셋 핸들러 (Optional)
 * @param {Function} [props.onShowAll] - 전체 표시 핸들러 (Optional)
 * @param {Array} props.essentialColumns - 필수 컬럼 키 배열 (숨길 수 없음)
 * @param {Array} props.defaultVisibleColumns - 기본 표시 컬럼 키 배열 (Reset시 사용)
 */
export const TableColumnMenu = ({
  columns,
  visibleColumns,
  onToggleColumn,
  onReset,
  onShowAll,
  essentialColumns = [],
  defaultVisibleColumns = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuContentRef = useRef(null);

  // 스크롤이나 리사이즈 시 메뉴 닫기 (위치 어긋남 방지)
  // 단, 메뉴 내부 스크롤은 제외
  useEffect(() => {
    const handleScrollOrResize = (e) => {
      if (isOpen) {
        // 메뉴 내부에서의 스크롤 이벤트인 경우 닫지 않음
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

  const handleShowAll = () => {
    if (onShowAll) {
      onShowAll(columns.map((col) => col.key));
    } else {
      columns.forEach((col) => {
        if (!essentialColumns.includes(col.key) && !isVisible(col.key)) {
          onToggleColumn(col.key);
        }
      });
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      columns.forEach((col) => {
        if (essentialColumns.includes(col.key)) return;
        const shouldBeVisible = defaultVisibleColumns.includes(col.key);
        if (shouldBeVisible !== isVisible(col.key)) {
          onToggleColumn(col.key);
        }
      });
    }
  };

  const handleButtonClick = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 256; // w-64
      const viewportHeight = window.innerHeight;
      const margin = 10; // 여백
      const defaultMaxHeight = 350; // 기본 최대 높이

      // 좌우 위치 계산
      let left = rect.right - menuWidth;
      if (left < margin) left = margin;

      // 상하 공간 계산
      const spaceBelow = viewportHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;

      let style = {
        left: `${left}px`,
        display: 'flex',
        flexDirection: 'column',
      };

      // 방향 및 높이 결정 로직
      // 1. 아래 공간이 충분하면 아래로
      // 2. 아니면 위/아래 중 더 넓은 쪽으로
      if (spaceBelow >= Math.min(spaceAbove, 200)) {
        // 아래로 열기 (단, 공간 부족시 높이 제한)
        style.top = `${rect.bottom + 5}px`;
        style.maxHeight = `${Math.min(defaultMaxHeight, spaceBelow)}px`;
      } else {
        // 위로 열기
        style.bottom = `${viewportHeight - rect.top + 5}px`;
        style.maxHeight = `${Math.min(defaultMaxHeight, spaceAbove)}px`;
        style.top = 'auto'; // top 초기화
      }

      setMenuPosition(style);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative group inline-block">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
      >
        <Settings size={16} />
      </button>
      {/* 툴팁 - 버튼 위에 마우스 오버 시 표시 (기존 유지) */}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
        컬럼 설정
      </div>

      {/* Portal을 사용하여 document.body에 렌더링 */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] isolate">
          {/* Backdrop - 클릭 시 닫기 */}
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu Content */}
          <div
            ref={menuContentRef}
            className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={menuPosition}
            onClick={(e) => e.stopPropagation()} // 메뉴 클릭 시 닫히지 않도록
          >
            <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">
                표시할 컬럼 선택
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {visibleColumns.length} / {columns.length} 컬럼 표시 중
              </p>
            </div>

            <div className="overflow-y-auto p-1 flex-1 min-h-0">
              {/* 필수 컬럼 */}
              {columnGroups.essential.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    필수 컬럼
                  </p>
                  {columnGroups.essential.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center gap-2 px-2 py-1.5 mx-1 bg-gray-50 rounded text-gray-400 cursor-not-allowed"
                    >
                      <Check size={14} className="opacity-50" />
                      <span className="text-sm font-medium">{column.title}</span>
                      <span className="ml-auto text-[10px] border border-gray-200 px-1 rounded bg-white">필수</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 선택 가능한 컬럼 */}
              <div>
                <p className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  선택 컬럼
                </p>
                {columnGroups.optional.map((column) => (
                  <label
                    key={column.key}
                    className="flex items-center gap-2 px-2 py-1.5 mx-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible(column.key)}
                      onChange={() => handleToggle(column.key)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{column.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="p-2 border-t border-gray-200 flex gap-2 bg-gray-50/50 flex-shrink-0">
              <button
                onClick={handleShowAll}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm transition-colors"
              >
                모두 선택
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TableColumnMenu;
