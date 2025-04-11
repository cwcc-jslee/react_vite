// src/features/project/components/charts/ProjectProgressChart.jsx
import React from 'react';
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

/**
 * 프로젝트 진행 단계별 수량을 세로 막대 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @returns {JSX.Element} 프로젝트 진행 상태 차트 컴포넌트
 */
const ProjectProgressChart = ({ projectProgress }) => {
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
      name: '0%',
      value: projectProgress['0%'],
      color: '#D13438',
      isProgress: true,
    },
    {
      name: '10%',
      value: projectProgress['10%'],
      color: '#FF8C00',
      isProgress: true,
    },
    {
      name: '25%',
      value: projectProgress['25%'],
      color: '#FF8C00',
      isProgress: true,
    },
    {
      name: '50%',
      value: projectProgress['50%'],
      color: '#FFB900',
      isProgress: true,
    },
    {
      name: '75%',
      value: projectProgress['75%'],
      color: '#107C10',
      isProgress: true,
    },
    {
      name: '100%',
      value: projectProgress['100%'],
      color: '#0078D4',
      isProgress: true,
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
            <Bar dataKey="value" barSize={30}>
              {progressData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.isProgress ? '#0078D4' : 'transparent'}
                  strokeWidth={entry.isProgress ? 1 : 0}
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
