// src/features/project/components/elements/ProjectProgressChart.jsx
import React, { useEffect } from 'react';
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

/**
 * 프로젝트 진행 단계별 수량을 가로 막대 차트로 표시하는 컴포넌트
 * @returns {JSX.Element} 프로젝트 진행 상태 차트 컴포넌트
 */
const ProjectProgressChart = () => {
  // 각 단계별 프로젝트 수 (실제 구현 시 props 또는 API에서 가져올 수 있음)
  const progressData = [
    { name: '0%', value: 5, color: '#D13438', group: 'progress' },
    { name: '25%', value: 12, color: '#FF8C00', group: 'progress' },
    { name: '50%', value: 15, color: '#FFB900', group: 'progress' },
    { name: '75%', value: 10, color: '#107C10', group: 'progress' },
    { name: '100%', value: 6, color: '#0078D4', group: 'progress' },
  ];

  // 진행 단계 인덱스 찾기
  const progressStartIndex = progressData.findIndex((item) => item.isProgress);
  const progressEndIndex =
    progressData.findIndex(
      (item, index) => item.isProgress === false && index > progressStartIndex,
    ) - 1;

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="text-sm font-medium">{`${data.name}: ${data.value}개 프로젝트`}</p>
          {data.isProgress && <p className="text-xs text-blue-600">진행중</p>}
        </div>
      );
    }
    return null;
  };

  // 막대 위에 표시할 레이블 렌더링 함수
  const renderCustomizedLabel = (props) => {
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

  return (
    <div className="w-full border border-gray-200 rounded shadow-sm h-full">
      <div className="bg-zinc-100 rounded-tl rounded-tr basis-[2.88rem] font-semibold px-4 flex items-center">
        <div>진행</div>
      </div>

      <div className="p-4 bg-white h-[calc(100%_-_58px)]">
        {' '}
        {/* 헤더 높이(58px)를 제외한 높이 설정 */}
        <div className="w-full h-[calc(100%_-_48px)]">
          {' '}
          {/* 범례 영역(48px)을 제외한 높이 설정 */}
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
                  <LabelList dataKey="value" content={renderCustomizedLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* 범례 */}
        <div className="flex flex-wrap p-2 border-t mt-2 bg-gray-50">
          {progressData.map((item, index) => (
            <div key={index} className="flex items-center mr-3 mb-1">
              <div
                className="w-3 h-3 mr-1"
                style={{
                  backgroundColor: item.color,
                  border: item.isProgress ? '1px solid #0078D4' : 'none',
                }}
              />
              <span className="text-xs">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProjectProgressChart;
