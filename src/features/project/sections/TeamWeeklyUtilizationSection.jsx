// src/features/project/sections/TeamWeeklyUtilizationSection.jsx
/**
 * 팀별 주간 실적 메인 섹션
 */

import React, { useState } from 'react';
import { teamWeeklyUtilizationService } from '../services/teamWeeklyUtilizationService';
import { useTeamWeeklyUtilization } from '../hooks/useTeamWeeklyUtilization';
import WeekNavigator from '../components/filters/WeekNavigator';
import TeamWeeklySummaryCard from '../components/cards/TeamWeeklySummaryCard';
import TeamAccordionCard from '../components/cards/TeamAccordionCard';

const TeamWeeklyUtilizationSection = () => {
  // 현재 주차로 초기화
  const [currentWeek, setCurrentWeek] = useState(
    teamWeeklyUtilizationService.getCurrentWeek()
  );
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // 데이터 조회
  const { data, summary, teams, period, isLoading, isError, error, refetch } =
    useTeamWeeklyUtilization(currentWeek, selectedTeamId);

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">팀별 주간 실적 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">데이터 로드 실패</div>
          <div className="text-gray-600 text-sm mb-4">
            {error?.message || '오류가 발생했습니다.'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!teams || teams.length === 0) {
    return (
      <div className="space-y-4">
        <WeekNavigator currentWeek={currentWeek} period={period} onWeekChange={handleWeekChange} />

        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">선택한 주에 투입 데이터가 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 주간 네비게이션 */}
      <WeekNavigator currentWeek={currentWeek} period={period} onWeekChange={handleWeekChange} />

      {/* 전체 요약 카드 */}
      <TeamWeeklySummaryCard summary={summary} />

      {/* 팀별 아코디언 */}
      <div className="space-y-4">
        {teams.map((team) => (
          <TeamAccordionCard key={team.teamId} team={team} />
        ))}
      </div>

      {/* 데이터 갱신 정보 */}
      <div className="text-center text-xs text-gray-500 py-4">
        마지막 업데이트: {new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  );
};

export default TeamWeeklyUtilizationSection;