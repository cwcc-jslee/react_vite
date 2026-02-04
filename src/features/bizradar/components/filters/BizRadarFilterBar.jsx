/**
 * BizRadar 필터 바
 * 빠른 필터링을 위한 컨트롤
 *
 * API 파라미터:
 *   - source: 출처 (gntp, mss, gyeongnam, bizinfo)
 *   - type: 지원유형 (A,B,C,D,F - 쉼표 구분)
 *   - region: 지역 (부분 일치)
 *   - min_date: 마감일 최소값
 */
import React, { useState, useEffect } from 'react';
import { FaSearch, FaRedo } from 'react-icons/fa';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { DATA_SOURCES, SOURCE_LIST } from '../../constants/initialState';

const BizRadarFilterBar = () => {
  const { filters, applyFilters, clearFilters, isLoading } = useBizRadarStore();
  const [activeSource, setActiveSource] = useState(filters.source || 'all');
  const [localFilters, setLocalFilters] = useState({
    keyword: filters.keyword || '',
    region: filters.region || '',
    type: filters.type || '',
    min_date: filters.min_date || '',
  });

  // Redux 상태와 로컬 상태 동기화
  useEffect(() => {
    // console.log('Filters changed:', filters);
    setActiveSource(filters.source || 'all');
    setLocalFilters((prev) => ({
      ...prev,
      keyword: filters.keyword || '',
      region: filters.region || '',
      type: filters.type || '',
      min_date: filters.min_date || '',
    }));
  }, [filters]);

  // 출처 탭 클릭
  const handleSourceChange = (sourceKey) => {
    // console.log('Source clicked:', sourceKey);
    if (!DATA_SOURCES[sourceKey]) {
      console.error('Invalid source key:', sourceKey);
      return;
    }
    
    setActiveSource(sourceKey);
    const sourceValue = DATA_SOURCES[sourceKey]?.value || '';
    
    // console.log('Applying source filter:', sourceValue);
    applyFilters({ ...localFilters, source: sourceValue || null });
  };

  // 로컬 필터 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 검색 적용
  const handleSearch = () => {
    const sourceValue = DATA_SOURCES[activeSource]?.value || '';
    applyFilters({ ...localFilters, source: sourceValue || null });
  };

  // 필터 초기화
  const handleReset = () => {
    setActiveSource('all');
    setLocalFilters({
      keyword: '',
      region: '',
      type: '',
      min_date: '',
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
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
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

      {/* 필터 컨트롤 */}
      <div className="p-4">
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

          {/* 지원유형 필터 */}
          <div className="min-w-[160px]">
            <select
              name="type"
              value={localFilters.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">유효리드(A,B,C)</option>
              <option value="A">A - 영업기회</option>
              <option value="B">B - 프로젝트</option>
              <option value="C">C - 성장지원</option>
              <option value="A,B">A,B (영업+프로젝트)</option>
              <option value="D">D - 검토필요</option>
              <option value="F">F - 해당없음</option>
            </select>
          </div>

          {/* 마감일 필터 */}
          <div className="min-w-[150px]">
            <input
              type="date"
              name="min_date"
              value={localFilters.min_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="마감일 이후"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default BizRadarFilterBar;
