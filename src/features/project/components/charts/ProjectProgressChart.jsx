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

// 진행률 범위 정의
const PROGRESS_RANGES = {
  ZERO: { min: 0, max: 9, label: '0%' },
  TEN_PERCENT: { min: 10, max: 24, label: '10%' },
  QUARTER: { min: 25, max: 49, label: '25%' },
  HALF: { min: 50, max: 74, label: '50%' },
  THREE_QUARTERS: { min: 75, max: 99, label: '75%' },
  COMPLETED: { min: 100, max: 100, label: '100%' },
};

/**
 * 프로젝트 진행 단계별 수량을 세로 막대 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @returns {JSX.Element} 프로젝트 진행 상태 차트 컴포넌트
 */
const ProjectProgressChart = ({ projectProgress = [] }) => {
  const { handleProgressFilter } = useProjectSearch();
  const [activeIndex, setActiveIndex] = useState(null);

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

  // 각 단계별 프로젝트 수 (실제 구현 시 props 또는 API에서 가져올 수 있음)
  const progressData = [
    {
      name: PROGRESS_RANGES.ZERO.label,
      value: projectProgress['0%'],
      color: '#D13438',
      isProgress: true,
      range: PROGRESS_RANGES.ZERO,
    },
    {
      name: PROGRESS_RANGES.TEN_PERCENT.label,
      value: projectProgress['10%'],
      color: '#FF8C00',
      isProgress: true,
      range: PROGRESS_RANGES.TEN_PERCENT,
    },
    {
      name: PROGRESS_RANGES.QUARTER.label,
      value: projectProgress['25%'],
      color: '#FF8C00',
      isProgress: true,
      range: PROGRESS_RANGES.QUARTER,
    },
    {
      name: PROGRESS_RANGES.HALF.label,
      value: projectProgress['50%'],
      color: '#FFB900',
      isProgress: true,
      range: PROGRESS_RANGES.HALF,
    },
    {
      name: PROGRESS_RANGES.THREE_QUARTERS.label,
      value: projectProgress['75%'],
      color: '#107C10',
      isProgress: true,
      range: PROGRESS_RANGES.THREE_QUARTERS,
    },
    {
      name: PROGRESS_RANGES.COMPLETED.label,
      value: projectProgress['100%'],
      color: '#0078D4',
      isProgress: true,
      range: PROGRESS_RANGES.COMPLETED,
    },
    // {
    //   name: '검수',
    //   value: projectProgress['25%'],
    //   color: '#5C2D91',
    //   isProgress: false,
    // },
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

  return (
    <ChartContainer title="프로젝트 진행 상태" legends={legendItems}>
      <div className="relative w-full h-full">
        {/* 진행 중 영역 표시 */}

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
      </div>
    </ChartContainer>
  );
};

export default ProjectProgressChart;
