// src/features/project/components/elements/ProjectStatusDonutCharts.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartContainer from '../../../../shared/components/charts/ChartContainer';

/**
 * 프로젝트 상태별 수량을 도넛 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @returns {JSX.Element} 프로젝트 상태 차트 컴포넌트
 */
const ProjectStatusDonutCharts = ({ projectStatus }) => {
  // 선택된 섹션 상태 추가
  const [activeIndex, setActiveIndex] = useState(null);

  const createCustomTooltip = (renderContent) => {
    return ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-2 shadow rounded border border-gray-200">
            {renderContent(payload[0].payload)}
          </div>
        );
      }
      return null;
    };
  };

  // 상태별 텍스트 정의
  const statusTexts = {
    notStarted: '시작전',
    pending: '보류',
    waiting: '대기',
    inProgress: '진행중',
    review: '검수',
    completed: '완료',
  };

  // 상태별 색상 정의
  const statusColors = {
    notStarted: '#94a3b8', // 슬레이트 그레이 - 시작되지 않은 상태
    pending: '#f59e0b', // 앰버 옐로우 - 보류 상태
    waiting: '#3b82f6', // 블루 - 대기 상태
    inProgress: '#10b981', // 에메랄드 그린 - 진행 중
    review: '#8b5cf6', // 바이올렛 - 검수 상태
    completed: '#14b8a6', // 틸 그린 - 완료 상태
  };

  // Recharts 데이터 형식으로 변환
  const chartData = Object.entries(projectStatus)
    .filter(([key]) => key !== 'total') // total 제외
    .map(([key, value]) => ({
      name: statusTexts[key] || key,
      value: value,
      status: key,
    }));

  // 범례 데이터 생성
  const legendItems = chartData.map((item) => ({
    name: item.name,
    value: item.value,
    color: statusColors[item.status],
  }));

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = createCustomTooltip((data) => (
    <p className="text-sm font-medium">{`${data.name}: ${data.value}건`}</p>
  ));

  // 섹션 클릭 핸들러
  const onPieClick = (_, index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // 마우스 떠남 핸들러
  const onMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <ChartContainer title="프로젝트 상태" legends={legendItems}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart onMouseLeave={onMouseLeave}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={1}
            dataKey="value"
            labelLine={false}
            onClick={onPieClick}
            activeIndex={activeIndex}
            activeShape={(props) => {
              const RADIAN = Math.PI / 180;
              const {
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                value,
                name,
              } = props;
              const sin = Math.sin(-RADIAN * midAngle);
              const cos = Math.cos(-RADIAN * midAngle);
              const mx = cx + (outerRadius + 15) * cos;
              const my = cy + (outerRadius + 15) * sin;

              return (
                <g>
                  {/* 확대된 원호 */}
                  <path
                    d={`M ${cx},${cy} L ${
                      cx + outerRadius * Math.cos(-startAngle * RADIAN)
                    },${
                      cy + outerRadius * Math.sin(-startAngle * RADIAN)
                    } A ${outerRadius},${outerRadius} 0 ${
                      endAngle - startAngle > 180 ? 1 : 0
                    },0 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)},${
                      cy + outerRadius * Math.sin(-endAngle * RADIAN)
                    } Z`}
                    fill={fill}
                    stroke={fill}
                    strokeWidth={2}
                    opacity={0.9}
                  />
                  {/* 내부 원 */}
                  <circle cx={cx} cy={cy} r={innerRadius} fill="#fff" />

                  {/* 라벨 선 */}
                  <path
                    d={`M${cx + (outerRadius + 5) * cos},${
                      cy + (outerRadius + 5) * sin
                    }L${mx},${my}`}
                    stroke={fill}
                    fill="none"
                  />

                  {/* 라벨 텍스트 */}
                  <text
                    x={mx + (cos >= 0 ? 10 : -10)}
                    y={my}
                    textAnchor={cos >= 0 ? 'start' : 'end'}
                    fill="#333"
                    fontSize={12}
                    fontWeight="bold"
                  >{`${name}: ${value}건`}</text>
                </g>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.status]}
                stroke="#ffffff"
                strokeWidth={1}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.3
                }
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ProjectStatusDonutCharts;
