// src/features/customer/components/filters/FilterStatusBanner.jsx
import React from 'react';
import { useCustomerStore } from '../../hooks/useCustomerStore';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * 필터 상태 표시 배너 컴포넌트 (Customer용)
 * 현재 적용된 필터를 시각적으로 표시하고 개별/전체 해제 기능 제공
 *
 * @component
 */
const FilterStatusBanner = () => {
  const { filters, actions } = useCustomerStore();

  // 활성화된 필터 확인
  const hasActiveFilters =
    filters.name ||
    filters.coClassification ||
    filters.businessScale ||
    filters.funnel ||
    filters.businessType ||
    filters.employee ||
    filters.region ||
    filters.city ||
    filters.address ||
    filters.dateRange;

  // 개별 필터 제거 핸들러
  const handleRemoveFilter = (filterName) => {
    actions.filter.updateField(filterName, null);
    actions.data.fetchCustomers();
  };

  // 전체 필터 초기화
  const handleResetAll = () => {
    actions.filter.resetFilters();
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 h-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-blue-900">
            {hasActiveFilters ? '필터:' : '필터: 없음'}
          </span>

          {/* 날짜 범위 */}
          {filters.dateRange && (
            <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              <span>
                {filters.dateRange.startDate} ~ {filters.dateRange.endDate}
              </span>
              <button
                onClick={() => handleRemoveFilter('dateRange')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 고객명 */}
          {filters.name && (
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
              <span>고객명: {filters.name}</span>
              <button
                onClick={() => handleRemoveFilter('name')}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 기업분류 */}
          {filters.coClassification && (
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              <span>
                기업분류:{' '}
                {filters.coClassification.name || filters.coClassification}
              </span>
              <button
                onClick={() => handleRemoveFilter('coClassification')}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 기업규모 */}
          {filters.businessScale && (
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              <span>
                기업규모: {filters.businessScale.name || filters.businessScale}
              </span>
              <button
                onClick={() => handleRemoveFilter('businessScale')}
                className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 유입경로 */}
          {filters.funnel && (
            <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
              <span>유입경로: {filters.funnel.name || filters.funnel}</span>
              <button
                onClick={() => handleRemoveFilter('funnel')}
                className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 업태 */}
          {filters.businessType && (
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
              <span>업태: {filters.businessType}</span>
              <button
                onClick={() => handleRemoveFilter('businessType')}
                className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 직원 수 */}
          {filters.employee && (
            <div className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-xs">
              <span>직원 수: {filters.employee.name || filters.employee}</span>
              <button
                onClick={() => handleRemoveFilter('employee')}
                className="ml-1 hover:bg-violet-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 지역 */}
          {filters.region && (
            <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
              <span>지역: {filters.region.name || filters.region}</span>
              <button
                onClick={() => handleRemoveFilter('region')}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 시/군/구 */}
          {filters.city && (
            <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs">
              <span>시/군/구: {filters.city}</span>
              <button
                onClick={() => handleRemoveFilter('city')}
                className="ml-1 hover:bg-pink-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 주소 */}
          {filters.address && (
            <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
              <span>주소: {filters.address}</span>
              <button
                onClick={() => handleRemoveFilter('address')}
                className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* 전체 초기화 버튼 - 필터가 있을 때만 표시 */}
        {hasActiveFilters && (
          <button
            onClick={handleResetAll}
            className="ml-2 px-2 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors whitespace-nowrap"
          >
            모두 해제
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterStatusBanner;
