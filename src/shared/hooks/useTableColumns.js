import { useState, useCallback } from 'react';

/**
 * 테이블 컬럼 표시/숨김 상태를 관리하는 Hook
 *
 * @param {Array} initialColumns - 초기 표시할 컬럼 키 배열
 * @returns {Object} - visibleColumns, toggleColumn, resetColumns, setVisibleColumns, showAllColumns
 */
export const useTableColumns = (initialColumns = []) => {
  const [visibleColumns, setVisibleColumns] = useState(initialColumns);

  // 컬럼 토글
  const toggleColumn = useCallback((columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  }, []);

  // 초기값으로 리셋
  const resetColumns = useCallback(() => {
    setVisibleColumns(initialColumns);
  }, [initialColumns]);

  // 모든 컬럼 표시 (제공된 전체 컬럼 목록이 필요함)
  const showAllColumns = useCallback((allColumnKeys) => {
    setVisibleColumns(allColumnKeys);
  }, []);

  return {
    visibleColumns,
    setVisibleColumns,
    toggleColumn,
    resetColumns,
    showAllColumns,
  };
};
