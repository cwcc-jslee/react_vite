// src/features/customer/components/filters/ViewModeToggle.jsx
import React from 'react';
import { useCustomerStore } from '../../hooks/useCustomerStore';

/**
 * 뷰 모드 전환 컴포넌트 (Customer용)
 * 현황/상세검색 모드 전환 및 활성 필터 수 표시
 *
 * @component
 * @param {Object} props
 * @param {string} props.viewMode - 현재 뷰 모드 ('overview' | 'search')
 * @param {Function} props.onViewModeChange - 뷰 모드 변경 핸들러
 */
const ViewModeToggle = ({ viewMode = 'overview', onViewModeChange }) => {
  const { filters } = useCustomerStore();

  // 활성화된 필터 개수 계산
  const activeFilterCount = [
    filters.name,
    filters.businessNumber,
    filters.representativeName,
    filters.businessItem,
    filters.coClassification,
    filters.businessScale,
    filters.region,
    filters.city,
    filters.employee,
    filters.funnel,
    filters.dateRange,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 h-full">
      <div className="flex items-center justify-between gap-2 h-full">
        {/* 왼쪽: 활성 필터 정보 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            고객 검색
          </span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount}개 필터 활성
            </span>
          )}
        </div>

        {/* 오른쪽: 뷰 모드 전환 버튼 */}
        {onViewModeChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('overview')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === 'overview'
                  ? 'text-blue-700 bg-blue-50 border border-blue-300'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              현황
            </button>
            <button
              onClick={() => onViewModeChange('search')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === 'search'
                  ? 'text-blue-700 bg-blue-50 border border-blue-300'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              상세검색
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewModeToggle;
