// src/features/project/components/charts/UserUtilizationChart.jsx

import React, { useState } from 'react';
import { Card } from '@shared/components/ui/card/Card';

/**
 * 개인별 투입률 차트 (상위/하위)
 */
const UserUtilizationChart = ({ data }) => {
  const [activeTab, setActiveTab] = useState('top'); // 'top' or 'bottom'
  const { topUsers, bottomUsers } = data;

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badges = {
      low: 'bg-yellow-100 text-yellow-800',
      missing_work: 'bg-red-100 text-red-800',
    };
    const labels = {
      low: '저투입',
      missing_work: '미입력',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ml-2 ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderUserList = (users, isTop) => {
    return (
      <div className="space-y-2">
        {users.map((user, index) => (
          <div
            key={user.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* 순위 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                isTop
                  ? index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {index + 1}
              </div>

              {/* 사용자 정보 */}
              <div>
                <div className="font-semibold text-gray-800 flex items-center">
                  {user.userName}
                  {user.status && getStatusBadge(user.status)}
                </div>
                <div className="text-sm text-gray-500">{user.teamName}</div>
              </div>
            </div>

            {/* 투입률 및 작업시간 */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">작업시간</div>
                <div className="text-base font-semibold text-gray-700">
                  {user.workHours}h
                </div>
              </div>

              <div className="text-right min-w-[80px]">
                <div className={`text-2xl font-bold ${
                  user.utilization >= 80 ? 'text-green-600' :
                  user.utilization >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {user.utilization}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">개인별 투입률</h2>

        {/* 탭 */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setActiveTab('top')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'top'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            상위 10명
          </button>
          <button
            onClick={() => setActiveTab('bottom')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'bottom'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            하위 5명 (관리 필요)
          </button>
        </div>

        {/* 리스트 */}
        {activeTab === 'top' && renderUserList(topUsers, true)}
        {activeTab === 'bottom' && (
          <>
            {renderUserList(bottomUsers, false)}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                ⚠️ 작업 미입력 또는 저투입 사용자입니다. 휴가 또는 작업 입력 누락 여부를 확인해주세요.
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default UserUtilizationChart;
