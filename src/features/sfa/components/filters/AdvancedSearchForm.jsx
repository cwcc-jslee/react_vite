// src/features/sfa/components/filters/AdvancedSearchForm.jsx
import React, { useEffect, useState } from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { useTeam } from '../../../../shared/hooks/useTeam';
import { useSfaItem } from '../../../../shared/hooks/useSfaItem';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 상세 검색 폼 컴포넌트
 * 현황 페이지에서 접기/펼치기 가능한 고급 필터 제공
 *
 * @component
 */
const AdvancedSearchForm = () => {
  const { filters, actions } = useSfaStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: codebooks } = useCodebook([
    'rePaymentMethod',
    'sfaPercentage',
    'sfaSalesType',
    'sfaClassification',
    'fy',
  ]);

  const { data: teams } = useTeam();
  const { data: items, refetch } = useSfaItem();

  // 매출구분 변경 시 매출품목 자동 업데이트
  useEffect(() => {
    if (filters.sfaClassification && filters.sfaClassification !== '') {
      refetch(filters.sfaClassification);
    } else {
      refetch(null);
    }
  }, [filters.sfaClassification]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = (field) => (e) => {
    actions.filter.updateField(field, e.target.value || null);
  };

  const handleCustomerSelect = (customer) => {
    actions.filter.updateField('customer', customer);
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
    actions.data.fetchSfas();
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
                고객사
              </label>
              <CustomerSearchInput
                value={filters.customer}
                onSelect={handleCustomerSelect}
                size="small"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                건명
              </label>
              <input
                type="text"
                value={filters.name || ''}
                onChange={handleFieldChange('name')}
                placeholder="건명 입력"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                FY
              </label>
              <select
                value={filters.fy || ''}
                onChange={handleFieldChange('fy')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {codebooks?.fy?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                기준일 범위
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                확률
              </label>
              <select
                value={filters.probability || ''}
                onChange={handleFieldChange('probability')}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                <option value="confirmed">확정</option>
                {codebooks?.sfaPercentage?.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
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
                  매출유형
                </label>
                <select
                  value={filters.sfaSalesType || ''}
                  onChange={handleFieldChange('sfaSalesType')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {codebooks?.sfaSalesType?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  매출구분
                </label>
                <select
                  value={filters.sfaClassification || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    actions.filter.updateFields({
                      sfaClassification: value || null,
                      salesItem: null,
                    });
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {codebooks?.sfaClassification?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  매출품목
                </label>
                <select
                  value={filters.salesItem || ''}
                  onChange={handleFieldChange('salesItem')}
                  disabled={
                    !filters.sfaClassification ||
                    filters.sfaClassification === '' ||
                    !items?.data?.length
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!filters.sfaClassification || filters.sfaClassification === ''
                      ? '매출구분 먼저 선택'
                      : '전체'}
                  </option>
                  {items?.data?.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  사업부
                </label>
                <select
                  value={filters.team || ''}
                  onChange={handleFieldChange('team')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {teams?.data?.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  결제유형
                </label>
                <select
                  value={filters.billingType || ''}
                  onChange={handleFieldChange('billingType')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  {codebooks?.rePaymentMethod?.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  프로젝트 여부
                </label>
                <select
                  value={filters.isProject || ''}
                  onChange={handleFieldChange('isProject')}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">전체</option>
                  <option value="true">프로젝트</option>
                  <option value="false">일반매출</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchForm;
