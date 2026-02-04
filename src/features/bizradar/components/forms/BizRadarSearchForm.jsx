/**
 * BizRadar 고급 검색 폼
 * 상세한 검색 조건을 설정할 수 있는 폼
 *
 * API 파라미터:
 *   - type: 지원유형 (A,B,C,D,F - 쉼표 구분)
 *   - region: 지역 (부분 일치)
 *   - min_date: 마감일 최소값
 */
import React, { useState } from 'react';
import { FaSearch, FaRedo, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { SUPPORT_TYPES, CONFIDENCE_LEVELS } from '../../constants/initialState';

const BizRadarSearchForm = () => {
  const { filters, applyFilters, clearFilters, isLoading } = useBizRadarStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState({
    keyword: filters.keyword || '',
    region: filters.region || '',
    type: filters.type || '',
    min_date: filters.min_date || '',
  });

  // 다중 선택을 위한 유형 체크박스 상태
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (filters.type) {
      return filters.type.split(',').map((t) => t.trim());
    }
    return [];
  });

  // 로컬 필터 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 유형 체크박스 변경
  const handleTypeChange = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // 검색 적용
  const handleSearch = (e) => {
    e.preventDefault();
    const typeString = selectedTypes.length > 0 ? selectedTypes.join(',') : '';
    applyFilters({ ...localFilters, type: typeString });
  };

  // 필터 초기화
  const handleReset = () => {
    setLocalFilters({
      keyword: '',
      region: '',
      type: '',
      min_date: '',
    });
    setSelectedTypes([]);
    clearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900">고급 검색</h3>
        {isExpanded ? (
          <FaChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <FaChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {/* 폼 본문 */}
      {isExpanded && (
        <form onSubmit={handleSearch} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 키워드 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키워드
              </label>
              <input
                type="text"
                name="keyword"
                value={localFilters.keyword}
                onChange={handleChange}
                placeholder="공고명, 내용 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지역
              </label>
              <select
                name="region"
                value={localFilters.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="전국">전국</option>
                <option value="경남">경남</option>
                <option value="김해">김해</option>
                <option value="서울">서울</option>
                <option value="부산">부산</option>
                <option value="경기">경기</option>
                <option value="대구">대구</option>
                <option value="인천">인천</option>
                <option value="광주">광주</option>
                <option value="대전">대전</option>
                <option value="울산">울산</option>
              </select>
            </div>

            {/* 마감일 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마감일 (이후)
              </label>
              <input
                type="date"
                name="min_date"
                value={localFilters.min_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 지원유형 체크박스 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리드 유형 (복수 선택 가능)
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(SUPPORT_TYPES).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedTypes.includes(key)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  title={value.detail}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(key)}
                    onChange={() => handleTypeChange(key)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${value.color}`}>
                    {key}
                  </span>
                  <span className="text-sm">{value.description}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              선택하지 않으면 유효 리드(A, B, C)만 조회됩니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaRedo className="h-4 w-4" />
              초기화
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSearch className="h-4 w-4" />
              검색
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BizRadarSearchForm;
