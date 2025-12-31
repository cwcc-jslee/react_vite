// src/features/customer/components/filters/AdvancedSearchForm.jsx
import React, { useState } from 'react';
import { useCustomerStore } from '../../hooks/useCustomerStore';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 상세 검색 폼 컴포넌트 (Customer용)
 * 현황 페이지에서 접기/펼치기 가능한 고급 필터 제공
 *
 * @component
 */
const AdvancedSearchForm = () => {
  const { filters, actions } = useCustomerStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: codebooks } = useCodebook([
    'coClassification',
    'businessScale',
    'coFunnel',
    'region',
    'employee',
  ]);

  const handleFieldChange = (field) => (e) => {
    actions.filter.updateField(field, e.target.value || null);
  };

  const handleDateChange = (field) => (e) => {
    const value = e.target.value;
    const currentDateRange = filters.dateRange || {};
    const newDateRange = {
      ...currentDateRange,
      [field === 'startDate' ? 'startDate' : 'endDate']: value,
    };
    actions.filter.updateField('dateRange', newDateRange);
  };

  const handleSearch = () => {
    actions.data.fetchCustomers();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 주요 필터 섹션 */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-4 py-3">
        <div className="space-y-2.5">
          {/* 주요 필터: 반응형 그리드 (1열 → 2열 → 5열) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-x-4 gap-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                고객명
              </label>
              <input
                type="text"
                value={filters.name || ''}
                onChange={handleFieldChange('name')}
                placeholder="고객명 입력"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                기업분류
              </label>
              <select
                value={filters.coClassification || ''}
                onChange={handleFieldChange('coClassification')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {codebooks?.coClassification?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                기업규모
              </label>
              <select
                value={filters.businessScale || ''}
                onChange={handleFieldChange('businessScale')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">전체</option>
                {codebooks?.businessScale?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                유입경로
              </label>
              <select
                value={filters.funnel || ''}
                onChange={handleFieldChange('funnel')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">전체</option>
                {codebooks?.coFunnel?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                등록일 범위
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.startDate || ''}
                  onChange={handleDateChange('startDate')}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500 text-xs">~</span>
                <input
                  type="date"
                  value={filters.dateRange?.endDate || ''}
                  onChange={handleDateChange('endDate')}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 검색 버튼 & 추가 필터 토글 */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-white rounded border border-gray-300 hover:border-blue-400 transition-colors"
            >
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>추가 필터 {showAdvancedFilters ? '접기' : '펼치기'}</span>
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm hover:shadow transition-all"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 추가 필터 섹션 (접기/펼치기 가능) */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 px-4 py-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gray-300"></div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                상세 조건
              </span>
              <div className="h-px flex-1 bg-gray-300"></div>
            </div>

            {/* 추가 필터: 반응형 그리드 (1열 → 2열 → 5열) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-x-4 gap-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  업태
                </label>
                <input
                  type="text"
                  value={filters.businessType || ''}
                  onChange={handleFieldChange('businessType')}
                  placeholder="업태 입력"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  직원 수
                </label>
                <select
                  value={filters.employee || ''}
                  onChange={handleFieldChange('employee')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {codebooks?.employee?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  지역
                </label>
                <select
                  value={filters.region || ''}
                  onChange={handleFieldChange('region')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {codebooks?.region?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  시/군/구
                </label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={handleFieldChange('city')}
                  placeholder="시/군/구 입력"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  주소
                </label>
                <input
                  type="text"
                  value={filters.address || ''}
                  onChange={handleFieldChange('address')}
                  placeholder="주소 입력"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchForm;
