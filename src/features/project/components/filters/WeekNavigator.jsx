// src/features/project/components/filters/WeekNavigator.jsx
/**
 * 주간 네비게이션 컴포넌트
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { teamWeeklyUtilizationService } from '../../services/teamWeeklyUtilizationService';

const WeekNavigator = ({ currentWeek, period, onWeekChange }) => {
  const handlePrevious = () => {
    const previousWeek = teamWeeklyUtilizationService.getPreviousWeek(currentWeek);
    onWeekChange(previousWeek);
  };

  const handleNext = () => {
    const nextWeek = teamWeeklyUtilizationService.getNextWeek(currentWeek);
    onWeekChange(nextWeek);
  };

  const handleToday = () => {
    const today = teamWeeklyUtilizationService.getCurrentWeek();
    onWeekChange(today);
  };

  const isCurrentWeek = currentWeek === teamWeeklyUtilizationService.getCurrentWeek();

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* 좌측: 주간 네비게이션 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="이전 주"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center min-w-[280px]">
          <div className="text-lg font-semibold text-gray-800">
            {currentWeek}
          </div>
          {period && (
            <div className="text-sm text-gray-600">
              {period.label}
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="다음 주"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 우측: 현재 주로 이동 */}
      <button
        onClick={handleToday}
        disabled={isCurrentWeek}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isCurrentWeek
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}
        title="현재 주로 이동"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">현재 주</span>
      </button>
    </div>
  );
};

export default WeekNavigator;