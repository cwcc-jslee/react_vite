// src/features/sfa/components/forms/SalesInformationFilter.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, RefreshCw } from 'lucide-react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';

/**
 * 매출정보 검색 및 필터 컴포넌트
 */
const SalesInformationFilter = ({ onSearch, onReset }) => {
  // 코드북 데이터 가져오기 (FY, 매출유형)
  const { data: codebooks, isLoading: codebookLoading } = useCodebook([
    'fy',
    'sfaSalesType',
  ]);

  // 코드북 데이터 추출
  const fyList = codebooks?.fy || [];
  const salesTypes = codebooks?.sfaSalesType || [];
  const [filters, setFilters] = useState({
    fiscalYear: 114, // 기본값: 25년 (id: 114)
    keyword: '',
    salesTypeIds: [],
  });

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, id) => {
    setFilters((prev) => {
      const current = prev[field];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      fiscalYear: 114, // 기본값: 25년 (id: 114)
      keyword: '',
      salesTypeIds: [],
    };
    setFilters(defaultFilters);
    if (onReset) {
      onReset(defaultFilters);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-4">
      {/* FY 선택 */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium text-gray-700 min-w-[60px]">
          FY:
        </label>
        <select
          value={filters.fiscalYear}
          onChange={(e) => handleChange('fiscalYear', Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={codebookLoading}
        >
          <option value="">전체</option>
          {fyList.map((fy) => (
            <option key={fy.id} value={fy.id}>
              {fy.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          새로고침
        </button>
      </div>

      {/* 통합 검색 */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium text-gray-700 min-w-[60px]">
          검색:
        </label>
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => handleChange('keyword', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="고객명 또는 매출건명 입력..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="space-y-3">
        {/* 매출유형 */}
        <div className="flex items-start gap-4">
          <label className="text-sm font-medium text-gray-700 min-w-[60px] mt-1">
            매출유형:
          </label>
          <div className="flex flex-wrap gap-3">
            {codebookLoading ? (
              <span className="text-sm text-gray-500">로딩 중...</span>
            ) : salesTypes.length === 0 ? (
              <span className="text-sm text-gray-500">매출유형 데이터가 없습니다</span>
            ) : (
              salesTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.salesTypeIds.includes(type.id)}
                  onChange={() => handleCheckboxChange('salesTypeIds', type.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type.name}</span>
              </label>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <Search size={16} />
          검색
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

SalesInformationFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func,
};

export default SalesInformationFilter;
