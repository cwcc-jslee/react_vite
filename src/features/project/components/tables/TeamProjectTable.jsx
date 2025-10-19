// src/features/project/components/tables/TeamProjectTable.jsx
/**
 * 팀별 프로젝트 투입 현황 테이블
 */

import React from 'react';
import { TrendingUp, TrendingDown, Plus, XCircle, Minus } from 'lucide-react';

const TeamProjectTable = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        투입된 프로젝트가 없습니다.
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'new':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'end':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'new':
        return '신규';
      case 'end':
        return '종료';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return '정상';
      case 'warning':
        return '주의';
      case 'critical':
        return '위험';
      default:
        return '-';
    }
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">프로젝트명</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">전주</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">금주</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">증감</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">투입인원</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">평균h</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Task</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Work</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">상태</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.projectId}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* 프로젝트명 */}
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{project.projectName}</div>
              </td>

              {/* 전주 */}
              <td className="px-4 py-3 text-center text-gray-600">
                {project.hours.lastWeek}h
              </td>

              {/* 금주 */}
              <td className="px-4 py-3 text-center">
                <div className="font-semibold text-gray-800">{project.hours.thisWeek}h</div>
              </td>

              {/* 증감 */}
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(project.hours.trend)}
                    <span
                      className={`text-xs font-medium ${
                        project.hours.change > 0
                          ? 'text-red-600'
                          : project.hours.change < 0
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {project.hours.trend === 'new'
                        ? getTrendText(project.hours.trend)
                        : project.hours.trend === 'end'
                        ? getTrendText(project.hours.trend)
                        : `${project.hours.change > 0 ? '+' : ''}${project.hours.change}h`}
                    </span>
                  </div>
                  {project.hours.trend !== 'new' && project.hours.trend !== 'end' && (
                    <span
                      className={`text-xs ${
                        project.hours.changeRate > 0
                          ? 'text-red-500'
                          : project.hours.changeRate < 0
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {project.hours.changeRate > 0 ? '+' : ''}
                      {project.hours.changeRate}%
                    </span>
                  )}
                </div>
              </td>

              {/* 투입인원 */}
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="font-medium text-gray-800">
                    {project.users.lastWeek}→{project.users.thisWeek}명
                  </div>
                  {project.users.change !== 0 && (
                    <span
                      className={`text-xs ${
                        project.users.change > 0 ? 'text-red-500' : 'text-blue-500'
                      }`}
                    >
                      {project.users.change > 0 ? '+' : ''}{project.users.change}
                    </span>
                  )}
                </div>
              </td>

              {/* 평균h */}
              <td className="px-4 py-3 text-center">
                <div className="font-medium text-gray-800">
                  {project.averageHoursPerUser}h
                </div>
              </td>

              {/* Task 진행 */}
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-600">
                    {project.taskProgress.completed}/{project.taskProgress.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(project.taskProgress.rate)}`}
                      style={{ width: `${project.taskProgress.rate}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {project.taskProgress.rate}%
                  </div>
                </div>
              </td>

              {/* Work 완료 */}
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-600">
                    {project.workProgress.completed}/{project.workProgress.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(project.workProgress.rate)}`}
                      style={{ width: `${project.workProgress.rate}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {project.workProgress.rate}%
                  </div>
                </div>
              </td>

              {/* 상태 */}
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamProjectTable;