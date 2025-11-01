// src/features/project/components/tables/WeeklyUtilizationTable.jsx

import React, { useState } from 'react';
import { Card } from '@shared/components/ui/card/Card';

/**
 * 주별 투입률 상세 데이터 테이블 (페이지네이션 포함)
 */
const WeeklyUtilizationTable = ({ weeklyData = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const itemsPerPage = 5;

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500">
          주별 데이터가 없습니다.
        </div>
      </Card>
    );
  }

  // 최신 주차가 앞으로 오도록 역순 정렬
  const sortedWeeklyData = [...weeklyData].reverse();

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedWeeklyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedWeeklyData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedWeek(null);
  };

  const toggleWeekExpand = (weekNumber) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  // 투입률 색상 클래스
  const getUtilizationClass = (utilization) => {
    if (utilization >= 80) return 'text-green-600 font-semibold';
    if (utilization >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // 추세 아이콘
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <Card>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">주별 상세 데이터</h3>
          <div className="text-sm text-gray-600">
            총 {weeklyData.length}주
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주차
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기간
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  근무일
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  투입률
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  추세
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  인원
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업시간
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기준시간
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((week) => (
                <React.Fragment key={week.weekNumber}>
                  {/* 주 요약 행 */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      W{week.weekNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {week.startDate} ~ {week.endDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                      {week.workingDays}일
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={getUtilizationClass(week.summary.totalUtilization)}>
                        {week.summary.totalUtilization.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(week.trend)}
                        {week.weekNumber > 1 && (
                          <span className={`text-xs ${
                            week.changeFromPrevious > 0 ? 'text-green-600' :
                            week.changeFromPrevious < 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {week.changeFromPrevious > 0 ? '+' : ''}
                            {week.changeFromPrevious.toFixed(1)}%p
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                      {week.summary.totalUsers}명
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {week.summary.totalWorkHours.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {week.summary.totalBaseHours.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => toggleWeekExpand(week.weekNumber)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {expandedWeek === week.weekNumber ? '접기' : '펼치기'}
                      </button>
                    </td>
                  </tr>

                  {/* 팀별 상세 정보 (확장 시) */}
                  {expandedWeek === week.weekNumber && (
                    <tr>
                      <td colSpan="9" className="px-4 py-3 bg-gray-50">
                        <div className="ml-8">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">팀별 투입률</h4>
                          <div className="space-y-2">
                            {week.byTeam.map((team) => (
                              <div
                                key={team.teamId}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium text-gray-800 min-w-[120px]">
                                    {team.teamName}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {team.memberCount}명
                                  </span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className={`text-sm ${getUtilizationClass(team.utilization)}`}>
                                    {team.utilization.toFixed(1)}%
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {team.workHours.toFixed(1)}h / {team.baseHours.toFixed(1)}h
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, sortedWeeklyData.length)} / {sortedWeeklyData.length}주
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeeklyUtilizationTable;
