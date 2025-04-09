// src/features/project/components/elements/ProjectChartRecharts.jsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

/**
 * Recharts를 사용한 프로젝트 상태 차트 컴포넌트
 * @returns {JSX.Element} 프로젝트 상태 차트 컴포넌트
 */
const ProjectChartRecharts = () => {
  // 상태별 작업 수 (실제 구현 시 props 또는 API에서 가져올 수 있음)
  const taskCounts = {
    waiting: 2, // 대기 상태 작업 수
    inProgress: 10, // 진행 중 작업 수
    review: 3, // 검수 상태 작업 수
    completed: 10, // 완료 상태 작업 수
  };

  // 남은 작업 수 계산 (완료 제외)
  const remainingTasks =
    taskCounts.waiting + taskCounts.inProgress + taskCounts.review;

  // 상태별 텍스트 정의
  const statusTexts = {
    waiting: '대기',
    inProgress: '진행 중',
    review: '검수',
    completed: '완료',
  };

  // 상태별 색상 정의
  const statusColors = {
    waiting: '#757775', // 대기 상태 색상
    inProgress: '#0078D4', // 진행 중 색상
    review: '#D19838', // 검수 상태 색상
    completed: '#107C10', // 완료 색상
  };

  // Recharts 데이터 형식으로 변환
  const chartData = Object.entries(taskCounts).map(([key, value]) => ({
    name: statusTexts[key],
    value: value,
    status: key,
  }));

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="text-sm font-medium">{`${data.name}: ${data.value}건`}</p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 범례 컴포넌트
  const renderCustomLegend = (props) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center mt-4">
        {payload.map((entry, index) => {
          const status = entry.payload.status;
          return (
            <div
              key={`item-${index}`}
              className="flex items-center mx-2 mb-2 cursor-pointer"
            >
              <div
                className="w-3 h-3 mr-1 border-2 border-solid"
                style={{
                  backgroundColor: entry.color,
                  borderColor: entry.color,
                }}
              />
              <span className="text-xs text-neutral-800">
                {entry.value} (
                {chartData.find((item) => item.name === entry.value).value}건)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 중앙 텍스트를 보여주는 커스텀 라벨
  const renderCustomLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-center font-medium"
      >
        <tspan x="50%" dy="-5" fontSize="14" fill="#000">
          {remainingTasks}개의 작업이
        </tspan>
        <tspan x="50%" dy="18" fontSize="14" fill="#000">
          남음
        </tspan>
      </text>
    );
  };

  return (
    <div
      className="text-neutral-800 basis-1 flex-col text-sm flex min-w-[35.00rem] rounded"
      style={{ flexGrow: '3' }}
    >
      {/* 헤더 부분 */}
      <div className="bg-zinc-100 rounded-tl rounded-tr basis-[2.88rem] font-semibold px-4 flex items-center">
        <div>상태</div>
      </div>

      {/* 차트 부분 */}
      <div className="rounded-bl rounded-br flex-grow flex min-h-[13.81rem] overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={1}
                dataKey="value"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusColors[entry.status]}
                    stroke="#ffffff"
                  />
                ))}
                {renderCustomLabel()}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={renderCustomLegend}
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectChartRecharts;
