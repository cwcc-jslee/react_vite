// src/features/project/components/charts/ProjectProgressChart.jsx
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import ChartContainer from '../../../../shared/components/charts/ChartContainer';
import { useProjectSearch } from '../../hooks/useProjectSearch';

// 진행률 범위 정의 (progressDistribution 구간과 매칭)
const PROGRESS_RANGES = {
  ZERO_TO_25: { min: 0, max: 25, label: '0-25%', key: '0-25' },
  TWENTY_SIX_TO_50: { min: 26, max: 50, label: '26-50%', key: '26-50' },
  FIFTY_ONE_TO_75: { min: 51, max: 75, label: '51-75%', key: '51-75' },
  SEVENTY_SIX_TO_90: { min: 76, max: 90, label: '76-90%', key: '76-90' },
  NINETY_ONE_TO_100: { min: 91, max: 100, label: '91-100%', key: '91-100' },
};

/**
 * 프로젝트 진행 단계별 수량을 세로 막대 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @param {Object} progressDistribution - 계산된 프로젝트 진행률 분포 데이터
 * @param {Array} filteredProjects - 서비스별 필터링된 진행중 프로젝트 배열
 * @param {boolean} isFiltered - 필터가 활성화되어 있는지 여부
 * @param {Object} activeFilters - 현재 활성화된 필터들
 * @returns {JSX.Element} 프로젝트 진행 상태 차트 컴포넌트
 */
const ProjectProgressChart = ({ 
  projectProgress = [], 
  progressDistribution = null, 
  filteredProjects = [],
  isFiltered = false,
  activeFilters = {}
}) => {
  const { handleProgressFilter } = useProjectSearch();
  const [activeIndex, setActiveIndex] = useState(null);

  // filteredProjects에서 진행률 분포 계산
  const calculateProgressDistributionFromProjects = (projects) => {
    const distribution = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-90': 0,
      '91-100': 0,
    };

    projects.forEach((project) => {
      // 진행률 필드 확인 (calculatedProgress가 메인)
      const progress = project.calculatedProgress || 
                      project.progress || 
                      project.progressRate || 
                      project.progress_rate ||
                      project.pjtProgress ||
                      project.pjt_progress ||
                      project.progressPercent ||
                      project.progressPercentage ||
                      0;
      
      if (progress >= 0 && progress <= 25) {
        distribution['0-25']++;
      } else if (progress >= 26 && progress <= 50) {
        distribution['26-50']++;
      } else if (progress >= 51 && progress <= 75) {
        distribution['51-75']++;
      } else if (progress >= 76 && progress <= 90) {
        distribution['76-90']++;
      } else if (progress >= 91 && progress <= 100) {
        distribution['91-100']++;
      }
    });

    return distribution;
  };

  const renderBarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#333"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const createCustomTooltip = (renderFn) => {
    return ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-2 shadow rounded border border-gray-200">
            {renderFn(payload[0].payload)}
          </div>
        );
      }
      return null;
    };
  };

  // 필터 상태에 따른 진행률 분포 결정
  const getDynamicProgressDistribution = () => {
    // 필터가 활성화된 상태라면
    if (isFiltered) {
      // filteredProjects가 있으면 동적 계산
      if (filteredProjects.length > 0) {
        return calculateProgressDistributionFromProjects(filteredProjects);
      } else {
        // 필터가 활성화되어 있지만 데이터가 없으면 빈 분포 반환
        return {
          '0-25': 0,
          '26-50': 0,
          '51-75': 0,
          '76-90': 0,
          '91-100': 0,
        };
      }
    } else {
      // 필터가 비활성화 상태면 기존 데이터 사용
      return progressDistribution;
    }
  };

  const dynamicProgressDistribution = getDynamicProgressDistribution();

  // progressDistribution 데이터를 사용하여 차트 데이터 생성
  const progressData = dynamicProgressDistribution ? [
    {
      name: PROGRESS_RANGES.ZERO_TO_25.label,
      value: dynamicProgressDistribution['0-25'] || 0,
      color: '#D13438',
      isProgress: true,
      range: PROGRESS_RANGES.ZERO_TO_25,
    },
    {
      name: PROGRESS_RANGES.TWENTY_SIX_TO_50.label,
      value: dynamicProgressDistribution['26-50'] || 0,
      color: '#FF8C00',
      isProgress: true,
      range: PROGRESS_RANGES.TWENTY_SIX_TO_50,
    },
    {
      name: PROGRESS_RANGES.FIFTY_ONE_TO_75.label,
      value: dynamicProgressDistribution['51-75'] || 0,
      color: '#FFB900',
      isProgress: true,
      range: PROGRESS_RANGES.FIFTY_ONE_TO_75,
    },
    {
      name: PROGRESS_RANGES.SEVENTY_SIX_TO_90.label,
      value: dynamicProgressDistribution['76-90'] || 0,
      color: '#107C10',
      isProgress: true,
      range: PROGRESS_RANGES.SEVENTY_SIX_TO_90,
    },
    {
      name: PROGRESS_RANGES.NINETY_ONE_TO_100.label,
      value: dynamicProgressDistribution['91-100'] || 0,
      color: '#0078D4',
      isProgress: true,
      range: PROGRESS_RANGES.NINETY_ONE_TO_100,
    },
  ] : [
    // 기존 projectProgress 데이터 사용 (fallback)
    {
      name: '0%',
      value: (projectProgress && projectProgress['0%']) || 0,
      color: '#D13438',
      isProgress: true,
    },
    {
      name: '25%',
      value: (projectProgress && projectProgress['25%']) || 0,
      color: '#FF8C00',
      isProgress: true,
    },
    {
      name: '50%',
      value: (projectProgress && projectProgress['50%']) || 0,
      color: '#FFB900',
      isProgress: true,
    },
    {
      name: '75%',
      value: (projectProgress && projectProgress['75%']) || 0,
      color: '#107C10',
      isProgress: true,
    },
    {
      name: '100%',
      value: (projectProgress && projectProgress['100%']) || 0,
      color: '#0078D4',
      isProgress: true,
    },
  ];

  // 진행 단계 인덱스 찾기
  const progressStartIndex = progressData.findIndex((item) => item.isProgress);
  const progressEndIndex =
    progressData.findIndex(
      (item, index) => item.isProgress === false && index > progressStartIndex,
    ) - 1;

  // 범례 데이터 생성
  const legendItems = progressData.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
    highlight: item.isProgress,
  }));

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = createCustomTooltip((data) => (
    <>
      <p className="text-sm font-medium">{`${data.name}: ${data.value}개 프로젝트`}</p>
      {data.isProgress && <p className="text-xs text-blue-600">진행중</p>}
    </>
  ));

  // 막대 클릭 핸들러
  const onBarClick = (_, index) => {
    setActiveIndex(activeIndex === index ? null : index);

    // 필터링 처리
    if (activeIndex === index) {
      // 같은 막대 재클릭 시 필터 초기화
      handleProgressFilter('');
    } else {
      // 선택된 진행률로 필터링
      const selectedRange = progressData[index].range;
      handleProgressFilter({
        progress: selectedRange,
        status: 88, // 진행중인 프로젝트 상태 ID
      });
    }
  };

  // 모든 데이터가 0인지 확인
  const hasNoData = progressData.every(item => item.value === 0);

  return (
    <ChartContainer title="프로젝트 진행 상태" legends={legendItems}>
      <div className="relative w-full h-full">
        {hasNoData ? (
          // 데이터가 없을 때 표시할 메시지
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">데이터가 없습니다</p>
              {isFiltered && (
                <p className="text-gray-400 text-xs mt-1">
                  선택된 조건에 해당하는 진행중 프로젝트가 없습니다
                </p>
              )}
            </div>
          </div>
        ) : (
          // 데이터가 있을 때 차트 표시
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData}
              margin={{ top: 30, right: 10, left: 10, bottom: 10 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={true} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" barSize={30} onClick={onBarClick}>
                {progressData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.isProgress ? '#0078D4' : 'transparent'}
                    strokeWidth={entry.isProgress ? 1 : 0}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.3
                    }
                  />
                ))}
                <LabelList dataKey="value" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartContainer>
  );
};

export default ProjectProgressChart;
