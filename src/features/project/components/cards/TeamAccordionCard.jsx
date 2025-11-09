// src/features/project/components/cards/TeamAccordionCard.jsx
/**
 * 팀별 아코디언 카드 컴포넌트
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import TeamProjectTable from '../tables/TeamProjectTable';

const TeamAccordionCard = ({ team }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { teamName, totalMembers, availableMembers, weeklyStats, projects } = team;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* 팀 헤더 */}
      <div
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          {/* 좌측: 팀 정보 */}
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-800">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">{teamName}</h3>
                <span className="text-sm text-gray-600">
                  (소속: {totalMembers}명 | 가용: {availableMembers}명)
                </span>
              </div>

              {/* 투입률 바 */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">금주 투입률:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      weeklyStats.utilizationRate >= 80
                        ? 'bg-green-500'
                        : weeklyStats.utilizationRate >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(weeklyStats.utilizationRate, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${getUtilizationColor(weeklyStats.utilizationRate)}`}>
                  {weeklyStats.utilizationRate}%
                </span>
                <span className="text-xs text-gray-500">
                  ({weeklyStats.hours.thisWeek}h / {availableMembers * 40}h)
                </span>
              </div>
            </div>
          </div>

          {/* 우측: 요약 통계 */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">투입 프로젝트</div>
              <div className="text-lg font-bold text-gray-800">{weeklyStats.projectCount.thisWeek}개</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">전주 투입시간</div>
              <div className="text-lg font-semibold text-gray-600">{weeklyStats.hours.lastWeek}h</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">금주 투입시간</div>
              <div className="text-lg font-bold text-gray-800">{weeklyStats.hours.thisWeek}h</div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">증감</div>
              <div className="flex items-center gap-1">
                {weeklyStats.hours.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : weeklyStats.hours.change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-blue-500" />
                ) : null}
                <span
                  className={`text-sm font-semibold ${
                    weeklyStats.hours.change > 0
                      ? 'text-red-600'
                      : weeklyStats.hours.change < 0
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {weeklyStats.hours.change > 0 ? '+' : ''}
                  {weeklyStats.hours.change}h
                </span>
              </div>
              <div
                className={`text-xs ${
                  weeklyStats.hours.changeRate > 0
                    ? 'text-red-500'
                    : weeklyStats.hours.changeRate < 0
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                {weeklyStats.hours.changeRate > 0 ? '+' : ''}
                {weeklyStats.hours.changeRate}%
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">평균 투입/인</div>
              <div className="text-lg font-semibold text-gray-800">
                {weeklyStats.averageHoursPerUser}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 팀 주간 요약 카드 (펼쳐졌을 때) */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">팀 주간 요약</h4>
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">투입 프로젝트 수</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.projectCount.thisWeek}개</div>
                <div className="text-xs text-gray-500 mt-1">전주: {weeklyStats.projectCount.lastWeek}개</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">투입 인원</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.activeUsers}명</div>
                <div className="text-xs text-gray-500 mt-1">
                  전주: {team.weeklyStats.hours.lastWeek > 0 ? '?' : '0'}명
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">평균 투입/인</div>
                <div className="text-xl font-bold text-gray-800">{weeklyStats.averageHoursPerUser}h</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">투입률</div>
                <div className={`text-xl font-bold ${
                  weeklyStats.utilizationRate >= 80
                    ? 'text-green-600'
                    : weeklyStats.utilizationRate >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {weeklyStats.utilizationRate}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({weeklyStats.hours.thisWeek}h / {availableMembers * 40}h)
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">초과근무</div>
                <div className="text-xl font-bold text-red-600">
                  {weeklyStats.averageHoursPerUser > 40 ? (weeklyStats.averageHoursPerUser - 40).toFixed(1) : 0}h
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">유휴시간</div>
                <div className="text-xl font-bold text-blue-600">
                  {Math.max(0, (availableMembers * 40) - weeklyStats.hours.thisWeek).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({Math.round((Math.max(0, (availableMembers * 40) - weeklyStats.hours.thisWeek) / (availableMembers * 40)) * 100)}% 유휴)
                </div>
              </div>
            </div>
          </div>

          {/* 프로젝트별 투입 현황 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">프로젝트별 투입 현황</h4>
            </div>
            <TeamProjectTable projects={projects} />
          </div>

          {/* 팀 합계 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-blue-900">팀 합계:</span>
              <span className="text-blue-700">
                {weeklyStats.hours.lastWeek}h → {weeklyStats.hours.thisWeek}h
                <span className={`ml-2 font-semibold ${
                  weeklyStats.hours.change > 0 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  ({weeklyStats.hours.change > 0 ? '+' : ''}{weeklyStats.hours.change}h, {weeklyStats.hours.changeRate > 0 ? '+' : ''}{weeklyStats.hours.changeRate}%)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAccordionCard;