// src/features/project/components/charts/ProjectStatusDonutCharts.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartContainer from '../../../../shared/components/charts/ChartContainer';
import { useProjectSearch } from '../../hooks/useProjectSearch';
import { useCodebook } from '@shared/hooks/useCodebook';

/**
 * 프로젝트 상태별 수량을 도넛 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @returns {JSX.Element} 프로젝트 상태 차트 컴포넌트
 */
const ProjectStatusDonutCharts = ({ projectStatus = [] }) => {
  const { handleStatusFilter } = useProjectSearch();
  const [activeIndex, setActiveIndex] = useState(null);
  const { data: codebooks } = useCodebook(['pjtStatus']);

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
    .map(([key, value]) => {
      // 코드북에서 상태 정보 찾기
      const statusInfo = codebooks?.pjtStatus?.find(
        (status) => status.code === key,
      );

      return {
        name: statusInfo?.name || key,
        value: value,
        status: key,
        id: statusInfo?.id,
        code: statusInfo?.code,
      };
    });

  // 범례 데이터 생성
  const legendItems = chartData.map((item) => ({
    name: item.name,
    value: item.value,
    color: statusColors[item.code] || statusColors[item.status],
  }));

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = createCustomTooltip((data) => (
    <p className="text-sm font-medium">{`${data.name}: ${data.value}건`}</p>
  ));

  // 섹션 클릭 핸들러
  const onPieClick = (_, index) => {
    setActiveIndex(activeIndex === index ? null : index);

    // 필터링 처리
    if (activeIndex === index) {
      // 같은 섹션 재클릭 시 필터 초기화
      handleStatusFilter('');
    } else {
      // 선택된 상태로 필터링 (id 값 사용)
      const selectedStatus = chartData[index].id;
      handleStatusFilter(selectedStatus);
    }
  };

  // 가운데 표시할 텍스트 계산
  const getCenterText = () => {
    if (activeIndex !== null && chartData[activeIndex]) {
      const data = chartData[activeIndex];
      return {
        status: data.name,
        count: data.value,
      };
    }
    // 초기 상태는 '진행중' 데이터 표시
    const inProgressData = chartData.find(
      (item) => item.status === 'inProgress',
    );
    if (inProgressData) {
      return {
        status: inProgressData.name,
        count: inProgressData.value,
      };
    }

    // 진행중 데이터가 없는 경우 첫 번째 데이터 표시
    return chartData.length > 0
      ? { status: chartData[0].name, count: chartData[0].value }
      : { status: '데이터 없음', count: 0 };
  };

  const centerText = getCenterText();

  return (
    <ChartContainer title="프로젝트 상태" legends={legendItems}>
      <ResponsiveContainer width="100%" height="100%">
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
            onClick={onPieClick}
            activeIndex={activeIndex}
            style={{ outline: 'none' }}
            activeShape={(props) => {
              const {
                cx,
                cy,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
              } = props;
              const RADIAN = Math.PI / 180;

              return (
                <g>
                  <path
                    d={`M ${cx},${cy} L ${
                      cx + outerRadius * Math.cos(-startAngle * RADIAN)
                    },${cy + outerRadius * Math.sin(-startAngle * RADIAN)} A ${
                      outerRadius + 5
                    },${outerRadius + 5} 0 ${
                      endAngle - startAngle > 180 ? 1 : 0
                    },0 ${
                      cx + (outerRadius + 5) * Math.cos(-endAngle * RADIAN)
                    },${
                      cy + (outerRadius + 5) * Math.sin(-endAngle * RADIAN)
                    } Z`}
                    fill={fill}
                    stroke={fill}
                    strokeWidth={1}
                  />
                  <circle cx={cx} cy={cy} r={innerRadius} fill="#fff" />
                </g>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.code] || statusColors[entry.status]}
                stroke="#ffffff"
                strokeWidth={1}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.3
                }
                style={{ outline: 'none' }}
                className="focus:outline-none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />

          {/* 중앙 텍스트 */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-medium"
            fill="#333"
          >
            {centerText.status}
          </text>
          <text
            x="50%"
            y="50%"
            dy="1.2em"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold"
            fill="#333"
          >
            {centerText.count}건
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ProjectStatusDonutCharts;
