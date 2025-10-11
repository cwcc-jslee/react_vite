// src/features/project/components/charts/TeamUtilizationChart.jsx

import React, { useState } from 'react';
import { Card } from '@shared/components/ui/card/Card';

/**
 * 팀별 투입률 차트
 */
const TeamUtilizationChart = ({ data }) => {
  const { byTeam } = data;
  const [expandedTeam, setExpandedTeam] = useState(null);

  const getStatusBadge = (status) => {
    const badges = {
      normal: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      missing_work: 'bg-red-100 text-red-800',
    };
    const labels = {
      normal: '정상',
      low: '저투입',
      missing_work: '미입력',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ${badges[status] || badges.normal}`}>
        {labels[status] || labels.normal}
      </span>
    );
  };

  const toggleTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">팀별 투입률</h2>

        <div className="space-y-3">
          {byTeam.map((team) => (
            <div key={team.teamId} className="border rounded-lg overflow-hidden">
              {/* 팀 헤더 */}
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleTeam(team.teamId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-gray-800">{team.teamName}</div>
                    <div className="text-sm text-gray-500">
                      {team.memberCount}명
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* 투입률 */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">투입률</div>
                      <div className={`text-lg font-bold ${
                        team.utilization >= 80 ? 'text-green-600' :
                        team.utilization >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {team.utilization}%
                      </div>
                    </div>

                    {/* 작업시간 */}
                    <div className="text-right">
                      <div className="text-sm text-gray-500">작업시간</div>
                      <div className="text-lg font-semibold text-gray-700">
                        {team.workHours}h / {team.baseHours}h
                      </div>
                    </div>

                    {/* 확장 아이콘 */}
                    <div className="text-gray-400">
                      {expandedTeam === team.teamId ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        team.utilization >= 80 ? 'bg-green-500' :
                        team.utilization >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${team.utilization}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 팀원 상세 (확장 시) */}
              {expandedTeam === team.teamId && (
                <div className="p-4 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">이름</th>
                        <th className="text-center py-2">소속일수</th>
                        <th className="text-right py-2">가용시간</th>
                        <th className="text-right py-2">작업시간</th>
                        <th className="text-right py-2">투입률</th>
                        <th className="text-center py-2">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((member) => (
                        <tr key={member.userId} className="border-b hover:bg-gray-50">
                          <td className="py-2">
                            <div>{member.userName}</div>
                            {member.note && (
                              <div className="text-xs text-gray-500">{member.note}</div>
                            )}
                          </td>
                          <td className="text-center py-2">{member.membershipDays}일</td>
                          <td className="text-right py-2">{member.baseHours}h</td>
                          <td className="text-right py-2">{member.workHours}h</td>
                          <td className="text-right py-2">
                            <span className={`font-semibold ${
                              member.utilization >= 80 ? 'text-green-600' :
                              member.utilization >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {member.utilization}%
                            </span>
                          </td>
                          <td className="text-center py-2">
                            {getStatusBadge(member.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TeamUtilizationChart;
