// src/features/project/layouts/TeamWeeklyUtilizationLayout.jsx
/**
 * 팀별 주간 실적 레이아웃
 */

import React from 'react';
import TeamWeeklyUtilizationSection from '../sections/TeamWeeklyUtilizationSection';

const TeamWeeklyUtilizationLayout = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">팀별 주간 투입 현황</h1>
        <p className="text-sm text-gray-600 mt-1">
          각 팀의 주간 프로젝트 투입 시간, 인원 및 진행 현황을 확인할 수 있습니다.
        </p>
      </div>

      <TeamWeeklyUtilizationSection />
    </div>
  );
};

export default TeamWeeklyUtilizationLayout;