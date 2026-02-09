/**
 * BizRadar 필터 바 (Enhanced)
 * 시각적 Type 선택기, 날짜 범위 선택기 포함
 */
import React, { useState, useEffect } from 'react';
import { FaSearch, FaRedo, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { DATA_SOURCES, SOURCE_LIST } from '../../constants/initialState';
import TypeSelector from './TypeSelector';
import DateRangePicker from './DateRangePicker';

const BizRadarFilterBar = () => {
  const { filters, applyFilters, clearFilters, isLoading, items } = useBizRadarStore();
  const [activeSource, setActiveSource] = useState(filters.source || 'all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    keyword: filters.keyword || '',
    region: filters.region || '',
    type: filters.type || '',
    min_date: filters.min_date || '',
    max_date: filters.max_date || '',
  });
  const [selectedTypes, setSelectedTypes] = useState([]);

  // 통계 계산 (TypeSelector에 전달)
  const stats = React.useMemo(() => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { byType: { A: 0, B: 0, C: 0, D: 0, F: 0 } };
    }
    const byType = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    items.forEach((item) => {
      const type = item.confirmedCategory || item.confirmed_category;
      if (type && byType.hasOwnProperty(type)) {
        byType[type]++;
      }
    });
    return { byType };
  }, [items]);

  // Redux 상태와 로컬 상태 동기화
  useEffect(() => {
    setActiveSource(filters.source || 'all');
    setLocalFilters({
      keyword: filters.keyword || '',
      region: filters.region || '',
      type: filters.type || '',
      min_date: filters.min_date || '',
      max_date: filters.max_date || '',
    });
    // Type 문자열을 배열로 변환
    if (filters.type) {
      setSelectedTypes(filters.type.split(',').filter(Boolean));
    } else {
      setSelectedTypes([]);
    }
  }, [filters]);

  // 출처 탭 클릭
  const handleSourceChange = (sourceKey) => {
    setActiveSource(sourceKey);
    const sourceValue = DATA_SOURCES[sourceKey]?.value || '';
    applyFilters({ ...localFilters, source: sourceValue || null });
  };

  // 로컬 필터 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Type 선택 변경
  const handleTypeChange = (types) => {
    setSelectedTypes(types);
    const typeString = types.join(',');
    setLocalFilters((prev) => ({ ...prev, type: typeString }));
  };

  // 날짜 범위 변경
  const handleDateRangeChange = ({ startDate, endDate }) => {
    setLocalFilters((prev) => ({
      ...prev,
      min_date: startDate || '',
      max_date: endDate || '',
    }));
  };

  // 검색 적용
  const handleSearch = () => {
    const sourceValue = DATA_SOURCES[activeSource]?.value || '';
    applyFilters({ ...localFilters, source: sourceValue || null });
  };

  // 필터 초기화
  const handleReset = () => {
    setActiveSource('all');
    setSelectedTypes([]);
    setLocalFilters({
      keyword: '',
      region: '',
      type: '',
      min_date: '',
      max_date: '',
    });
    clearFilters();
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 출처 탭 */}
      <div className="border-b">
        <div className="flex">
          {SOURCE_LIST.map((sourceKey) => {
            const source = DATA_SOURCES[sourceKey];
            const isActive = activeSource === sourceKey;
            return (
              <button
                key={sourceKey}
                onClick={() => handleSourceChange(sourceKey)}
                disabled={isLoading}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                title={source.description}
              >
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 기본 필터 */}
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 키워드 검색 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                name="keyword"
                value={localFilters.keyword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="공고명 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* 지역 필터 */}
          <div className="min-w-[120px]">
            <select
              name="region"
              value={localFilters.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">전체 지역</option>
              <option value="전국">전국</option>
              <option value="경남">경남</option>
              <option value="김해">김해</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="경기">경기</option>
            </select>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
              상세 필터
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSearch className="h-4 w-4" />
              검색
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaRedo className="h-4 w-4" />
              초기화
            </button>
          </div>
        </div>

        {/* 상세 필터 (접을 수 있음) */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Type 선택기 */}
            <TypeSelector
              selectedTypes={selectedTypes}
              onChange={handleTypeChange}
              stats={stats}
            />

            {/* 날짜 범위 선택기 */}
            <DateRangePicker
              startDate={localFilters.min_date}
              endDate={localFilters.max_date}
              onChange={handleDateRangeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BizRadarFilterBar;
