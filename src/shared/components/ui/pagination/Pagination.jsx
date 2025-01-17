// src/shared/components/ui/pagination/Pagination.jsx
import React from 'react';
import { Button } from '../index';

export const Pagination = ({
  current,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      className={`flex justify-between items-center p-4 border-t border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">페이지당 행:</span>
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
        >
          이전
        </Button>

        <span className="text-sm text-gray-600">
          {current} / {totalPages} 페이지 (총 {total}개)
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={current === totalPages}
          onClick={() => onPageChange(current + 1)}
        >
          다음
        </Button>
      </div>
    </div>
  );
};
