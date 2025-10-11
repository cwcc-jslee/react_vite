// src/features/project/components/filters/UtilizationPeriodFilter.jsx

import React, { useState } from 'react';
import dayjs from 'dayjs';

/**
 * 투입률 기간 필터 컴포넌트 (프리셋 + 사용자 정의)
 */
const UtilizationPeriodFilter = ({ filters, teams = [], users = [], onChange, onRefresh }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customDates, setCustomDates] = useState({
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
  });

  // 기간 프리셋
  const periodPresets = [
    { value: '1month', label: '최근 1개월', months: 1 },
    { value: '3months', label: '최근 3개월', months: 3 },
    { value: '6months', label: '최근 6개월', months: 6 },
    { value: 'custom', label: '사용자 정의', months: null },
  ];

  const handlePresetChange = (preset) => {
    if (preset === 'custom') {
      setCustomMode(true);
      return;
    }

    setCustomMode(false);

    const presetInfo = periodPresets.find((p) => p.value === preset);
    if (!presetInfo || !presetInfo.months) return;

    const endDate = dayjs().format('YYYY-MM-DD');
    const startDate = dayjs().subtract(presetInfo.months, 'month').format('YYYY-MM-DD');

    onChange({
      periodPreset: preset,
      startDate,
      endDate,
    });
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDates({ ...customDates, [field]: value });
  };

  const applyCustomDates = () => {
    if (!customDates.startDate || !customDates.endDate) {
      alert('시작일과 종료일을 모두 입력해주세요.');
      return;
    }

    if (dayjs(customDates.startDate).isAfter(dayjs(customDates.endDate))) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }

    onChange({
      periodPreset: 'custom',
      startDate: customDates.startDate,
      endDate: customDates.endDate,
    });
  };

  const handleTeamChange = (e) => {
    const value = e.target.value;
    onChange({
      teamId: value ? parseInt(value) : null,
      userId: null // 팀 변경 시 사용자 선택 초기화
    });
  };

  const handleUserChange = (e) => {
    const value = e.target.value;
    onChange({ userId: value ? parseInt(value) : null });
  };

  const handleIncludeNonTrackedTeamsChange = (e) => {
    onChange({ includeNonTrackedTeams: e.target.checked });
  };

  // 선택된 팀에 속한 사용자 필터링
  const filteredUsers = filters.teamId
    ? users.filter((user) => user.team?.id === filters.teamId)
    : users;

  const currentPeriodPreset = filters.periodPreset || '3months';

  return (
    <div className="space-y-4">
      {/* 기간 프리셋 선택 */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">조회 기간:</label>
        <div className="flex gap-2">
          {periodPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPeriodPreset === preset.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 사용자 정의 날짜 입력 */}
      {customMode && (
        <div className="flex flex-wrap items-center gap-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
          <label className="text-sm font-semibold text-gray-700">기간 선택:</label>
          <input
            type="date"
            value={customDates.startDate}
            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={customDates.endDate}
            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyCustomDates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            적용
          </button>
          <button
            onClick={() => {
              setCustomMode(false);
              handlePresetChange('3months');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      )}

      {/* 팀 및 사용자 필터, 현재 기간 표시 */}
      <div className="flex flex-wrap items-center gap-4">
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

        {/* 사용자 필터 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">사용자:</label>
          <select
            value={filters.userId || ''}
            onChange={handleUserChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={filteredUsers.length === 0}
          >
            <option value="">전체 사용자</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} {user.team?.name && `(${user.team.name})`}
              </option>
            ))}
          </select>
        </div>

        {/* work 미추적 팀 포함 체크박스 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeNonTrackedTeams"
            checked={filters.includeNonTrackedTeams || false}
            onChange={handleIncludeNonTrackedTeamsChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="includeNonTrackedTeams" className="text-sm text-gray-700 cursor-pointer">
            work 미추적 팀 포함
          </label>
        </div>

        {/* 현재 선택된 기간 표시 */}
        {filters.startDate && filters.endDate && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">선택된 기간:</span>
            <span className="text-sm font-semibold text-gray-700">
              {filters.startDate} ~ {filters.endDate}
            </span>
            <span className="text-xs text-gray-500">
              ({dayjs(filters.endDate).diff(dayjs(filters.startDate), 'day') + 1}일)
            </span>
          </div>
        )}

        {/* 새로고침 버튼 */}
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          새로고침
        </button>
      </div>
    </div>
  );
};

export default UtilizationPeriodFilter;
