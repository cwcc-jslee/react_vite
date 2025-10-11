// src/features/project/components/filters/UtilizationFilters.jsx

import React from 'react';

/**
 * 투입률 필터 컴포넌트
 */
const UtilizationFilters = ({ filters, teams = [], dateRange, onChange, onRefresh }) => {
  const handlePeriodChange = (period) => {
    onChange({ period });
  };

  const handleTeamChange = (e) => {
    const value = e.target.value;
    onChange({ teamId: value ? parseInt(value) : null });
  };

  const periods = [
    { value: 'daily', label: '일별' },
    { value: 'weekly', label: '주별' },
    { value: 'monthly', label: '월별' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">조회 기간:</label>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.period === period.value
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 팀 필터 */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">팀:</label>
        <select
          value={filters.teamId || ''}
          onChange={handleTeamChange}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 팀</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 범위 */}
      {dateRange && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">기간:</label>
          <div className="text-sm text-gray-600">
            {dateRange.startDate} ~ {dateRange.endDate}
          </div>
        </div>
      )}

      {/* 새로고침 버튼 */}
      <button
        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={onRefresh}
      >
        새로고침
      </button>
    </div>
  );
};

export default UtilizationFilters;
