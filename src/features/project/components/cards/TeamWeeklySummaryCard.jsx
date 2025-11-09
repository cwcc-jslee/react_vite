// src/features/project/components/cards/TeamWeeklySummaryCard.jsx
/**
 * 팀별 주간 실적 전체 요약 카드
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Briefcase, Clock } from 'lucide-react';

const TeamWeeklySummaryCard = ({ summary }) => {
  if (!summary) return null;

  const { totalTeams, totalProjects, totalHours, totalUsers, averageHoursPerUser } = summary;

  const getTrendIcon = () => {
    if (totalHours.changeRate > 0) {
      return <TrendingUp className="w-5 h-5 text-red-500" />;
    } else if (totalHours.changeRate < 0) {
      return <TrendingDown className="w-5 h-5 text-blue-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (totalHours.changeRate > 0) return 'text-red-600';
    if (totalHours.changeRate < 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">전체 요약</h3>

        <div className="grid grid-cols-4 gap-4">
          {/* 총 투입 팀 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div className="text-sm text-blue-700 font-medium">총 투입 팀</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalTeams}개 팀</div>
          </div>

          {/* 총 프로젝트 */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-green-600" />
              <div className="text-sm text-green-700 font-medium">총 프로젝트</div>
            </div>
            <div className="text-2xl font-bold text-green-900">{totalProjects.thisWeek}개</div>
            <div className="text-xs text-green-600 mt-1">전주: {totalProjects.lastWeek}개</div>
          </div>

          {/* 총 투입시간 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <div className="text-sm text-purple-700 font-medium">총 투입시간</div>
            </div>
            <div className="text-2xl font-bold text-purple-900">{totalHours.thisWeek}h</div>
            <div className="text-xs text-purple-600 mt-1">전주: {totalHours.lastWeek}h</div>
          </div>

          {/* 전주 대비 */}
          <div className={`bg-gradient-to-br ${
            totalHours.changeRate > 0
              ? 'from-red-50 to-red-100 border-red-200'
              : totalHours.changeRate < 0
              ? 'from-blue-50 to-blue-100 border-blue-200'
              : 'from-gray-50 to-gray-100 border-gray-200'
          } border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {getTrendIcon()}
              <div className={`text-sm font-medium ${
                totalHours.changeRate > 0
                  ? 'text-red-700'
                  : totalHours.changeRate < 0
                  ? 'text-blue-700'
                  : 'text-gray-700'
              }`}>
                전주 대비
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              totalHours.changeRate > 0
                ? 'text-red-900'
                : totalHours.changeRate < 0
                ? 'text-blue-900'
                : 'text-gray-900'
            }`}>
              {totalHours.change > 0 ? '+' : ''}{totalHours.change}h
            </div>
            <div className={`text-xs mt-1 ${getTrendColor()}`}>
              {totalHours.changeRate > 0 ? '+' : ''}{totalHours.changeRate}%
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              총 투입 인원: <span className="font-semibold text-gray-800">{totalUsers}명</span>
            </div>
            <div className="text-gray-600">
              평균 투입시간/인: <span className="font-semibold text-gray-800">{averageHoursPerUser}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamWeeklySummaryCard;