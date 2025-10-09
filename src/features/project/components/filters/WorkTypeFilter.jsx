// src/features/project/components/filters/WorkTypeFilter.jsx
// 작업 유형 필터 컴포넌트 (프로젝트, 단순작업, 유지보수)

import React from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';

/**
 * 작업 유형 필터 컴포넌트
 * 전체, 프로젝트, 단순작업, 유지보수 선택 가능
 */
const WorkTypeFilter = () => {
  const { actions, chartFilters } = useProjectStore();
  const selectedWorkType = chartFilters?.selectedWorkType;

  const workTypeOptions = [
    { value: null, label: '전체' },
    { value: 'project', label: '프로젝트' },
    { value: 'task', label: '단순작업' },
    { value: 'maintenance', label: '유지보수' },
  ];

  const handleWorkTypeChange = (value) => {
    actions.chartFilters.setFilter('selectedWorkType', value);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">작업 유형:</span>
      <div className="flex gap-2">
        {workTypeOptions.map((option) => (
          <button
            key={option.value || 'all'}
            onClick={() => handleWorkTypeChange(option.value)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedWorkType === option.value
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkTypeFilter;
