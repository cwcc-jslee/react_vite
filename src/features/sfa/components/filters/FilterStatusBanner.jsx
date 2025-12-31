// src/features/sfa/components/filters/FilterStatusBanner.jsx
import React from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * 필터 상태 표시 배너 컴포넌트
 * 현재 적용된 필터를 시각적으로 표시하고 개별/전체 해제 기능 제공
 *
 * @component
 */
const FilterStatusBanner = () => {
  const { filters, actions } = useSfaStore();

  // 활성화된 필터 확인 (dateRange 제외)
  const hasActiveFilters =
    filters.probability ||
    filters.customer ||
    filters.name ||
    filters.sfaSalesType ||
    filters.sfaClassification ||
    filters.salesItem ||
    filters.isProject ||
    filters.fy ||
    filters.team ||
    filters.billingType;

  // 개별 필터 제거 핸들러
  const handleRemoveFilter = (filterName) => {
    if (filterName === 'dateRange') {
      // 날짜 범위 초기화 (현재 월로)
      const initialDateRange = {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      };
      actions.filter.updateFields({ dateRange: initialDateRange });
    } else {
      actions.filter.updateField(filterName, null);
    }
    actions.data.fetchSfas();
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

          {/* 확률 */}
          {filters.probability && (
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              <span>확률: {filters.probability}</span>
              <button
                onClick={() => handleRemoveFilter('probability')}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 고객사 */}
          {filters.customer && (
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
              <span>고객사: {filters.customer.name || filters.customer}</span>
              <button
                onClick={() => handleRemoveFilter('customer')}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 건명 */}
          {filters.name && (
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              <span>건명: {filters.name}</span>
              <button
                onClick={() => handleRemoveFilter('name')}
                className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 매출유형 */}
          {filters.sfaSalesType && (
            <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
              <span>매출유형: {filters.sfaSalesType}</span>
              <button
                onClick={() => handleRemoveFilter('sfaSalesType')}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 매출구분 */}
          {filters.sfaClassification && (
            <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs">
              <span>매출구분: {filters.sfaClassification}</span>
              <button
                onClick={() => handleRemoveFilter('sfaClassification')}
                className="ml-1 hover:bg-pink-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 매출품목 */}
          {filters.salesItem && (
            <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
              <span>매출품목: {filters.salesItem}</span>
              <button
                onClick={() => handleRemoveFilter('salesItem')}
                className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 프로젝트 여부 */}
          {filters.isProject && (
            <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
              <span>
                {filters.isProject === 'true' ? '프로젝트' : '일반매출'}
              </span>
              <button
                onClick={() => handleRemoveFilter('isProject')}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* FY */}
          {filters.fy && (
            <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">
              <span>FY: {filters.fy}</span>
              <button
                onClick={() => handleRemoveFilter('fy')}
                className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 사업부 */}
          {filters.team && (
            <div className="inline-flex items-center gap-1 bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full text-xs">
              <span>사업부: {filters.team}</span>
              <button
                onClick={() => handleRemoveFilter('team')}
                className="ml-1 hover:bg-lime-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* 결제유형 */}
          {filters.billingType && (
            <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-xs">
              <span>결제유형: {filters.billingType}</span>
              <button
                onClick={() => handleRemoveFilter('billingType')}
                className="ml-1 hover:bg-rose-200 rounded-full p-0.5"
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
