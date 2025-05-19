// src/features/project/components/charts/ProjectStatusDonutCharts.jsx
import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../../../../shared/components/charts/ChartContainer';
import { useProjectSearch } from '../../hooks/useProjectSearch';
import { useCodebook } from '@shared/hooks/useCodebook';

/**
 * 프로젝트 상태별 수량을 도넛 차트로 표시하는 컴포넌트 (리팩토링 버전)
 * @returns {JSX.Element} 프로젝트 상태 차트 컴포넌트
 */
const ProjectStatusDonutCharts = ({
  projectStatus = {},
  scheduleStatus = {},
}) => {
  const { handleStatusFilter, handleProgressFilter } = useProjectSearch();
  const [activeStatusIndex, setActiveStatusIndex] = useState(null);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(null);
  const { data: codebooks } = useCodebook(['pjtStatus']);

  console.log('>>> scheduleStatus', scheduleStatus);

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

  // 일정 상태별 색상 정의
  const scheduleColors = {
    normal: '#10b981', // 에메랄드 그린 - 정상
    delayed: '#ef4444', // 레드 - 지연
    imminent: '#f59e0b', // 앰버 옐로우 - 임박
  };

  // 일정 상태별 표시 이름
  const scheduleNames = {
    normal: '정상',
    delayed: '지연',
    imminent: '임박',
  };

  // Recharts 데이터 형식으로 변환 (상태)
  const statusChartData = codebooks?.pjtStatus
    ? codebooks.pjtStatus
        .filter((status) => status.id && status.code && status.name)
        .map((status) => {
          const value = projectStatus?.[status.code] || 0;
          return {
            name: status.name,
            value: value,
            status: status.code,
            id: status.id,
            code: status.code,
          };
        })
        .filter((item) => item.value > 0)
    : [];

  // Recharts 데이터 형식으로 변환 (일정 상태)
  const scheduleChartData = Object.entries(scheduleStatus || {})
    .filter(([key]) => key !== 'total')
    .map(([key, value]) => ({
      name: scheduleNames[key] || key,
      value: value,
      schedule: key,
      code: key,
    }))
    .filter((item) => item.value > 0);

  console.log('Codebooks:', codebooks);
  console.log('Status Chart Data:', statusChartData);
  console.log('Schedule Chart Data:', scheduleChartData);

  // 범례 데이터 생성
  const statusLegendItems = statusChartData.map((item) => ({
    name: item.name,
    value: item.value,
    color: statusColors[item.code] || statusColors[item.status],
  }));

  const scheduleLegendItems = scheduleChartData.map((item) => ({
    name: item.name,
    value: item.value,
    color: scheduleColors[item.code] || scheduleColors[item.schedule],
  }));

  // 커스텀 툴팁 컴포넌트
  const StatusTooltip = createCustomTooltip((data) => (
    <p className="text-sm font-medium">{`${data.name}: ${data.value}건`}</p>
  ));

  const ScheduleTooltip = createCustomTooltip((data) => (
    <p className="text-sm font-medium">{`${data.name}: ${data.value}건`}</p>
  ));

  // 섹션 클릭 핸들러 (상태)
  const onStatusPieClick = (_, index) => {
    setActiveStatusIndex(activeStatusIndex === index ? null : index);

    if (activeStatusIndex === index) {
      handleStatusFilter('');
    } else {
      const selectedStatus = statusChartData[index].id;
      handleStatusFilter(selectedStatus);
    }
  };

  // 섹션 클릭 핸들러 (일정)
  const onSchedulePieClick = (_, index) => {
    setActiveScheduleIndex(activeScheduleIndex === index ? null : index);

    if (activeScheduleIndex === index) {
      handleProgressFilter('');
    } else {
      const selectedSchedule = scheduleChartData[index].code;
      handleProgressFilter(selectedSchedule);
    }
  };

  // 가운데 표시할 텍스트 계산 (상태)
  const getStatusCenterText = () => {
    if (activeStatusIndex !== null && statusChartData[activeStatusIndex]) {
      const data = statusChartData[activeStatusIndex];
      return {
        status: data.name,
        count: data.value,
      };
    }
    const inProgressData = statusChartData.find(
      (item) => item.status === 'inProgress',
    );
    if (inProgressData) {
      return {
        status: inProgressData.name,
        count: inProgressData.value,
      };
    }
    return statusChartData.length > 0
      ? { status: statusChartData[0].name, count: statusChartData[0].value }
      : { status: '데이터 없음', count: 0 };
  };

  // 가운데 표시할 텍스트 계산 (일정)
  const getScheduleCenterText = () => {
    if (
      activeScheduleIndex !== null &&
      scheduleChartData[activeScheduleIndex]
    ) {
      const data = scheduleChartData[activeScheduleIndex];
      return {
        status: data.name,
        count: data.value,
      };
    }
    // 지연 건수 표시
    const delayedData = scheduleChartData.find(
      (item) => item.schedule === 'delayed',
    );
    if (delayedData) {
      return {
        status: delayedData.name,
        count: delayedData.value,
      };
    }
    return scheduleChartData.length > 0
      ? { status: scheduleChartData[0].name, count: scheduleChartData[0].value }
      : { status: '데이터 없음', count: 0 };
  };

  const statusCenterText = getStatusCenterText();
  const scheduleCenterText = getScheduleCenterText();

  // 공통 Pie 컴포넌트 렌더링 함수
  const renderPie = (
    data,
    colors,
    activeIndex,
    onClick,
    centerText,
    legendItems,
  ) => (
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={80}
      paddingAngle={1}
      dataKey="value"
      labelLine={false}
      onClick={onClick}
      activeIndex={activeIndex}
      style={{ outline: 'none' }}
      activeShape={(props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
          props;
        const RADIAN = Math.PI / 180;

        return (
          <g>
            <path
              d={`M ${cx},${cy} L ${
                cx + outerRadius * Math.cos(-startAngle * RADIAN)
              },${cy + outerRadius * Math.sin(-startAngle * RADIAN)} A ${
                outerRadius + 5
              },${outerRadius + 5} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${
                cx + (outerRadius + 5) * Math.cos(-endAngle * RADIAN)
              },${cy + (outerRadius + 5) * Math.sin(-endAngle * RADIAN)} Z`}
              fill={fill}
              stroke={fill}
              strokeWidth={1}
            />
            <circle cx={cx} cy={cy} r={innerRadius} fill="#fff" />
          </g>
        );
      }}
    >
      {data.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={colors[entry.code] || colors[entry.status || entry.schedule]}
          stroke="#ffffff"
          strokeWidth={1}
          opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
          style={{ outline: 'none' }}
          className="focus:outline-none"
        />
      ))}
    </Pie>
  );

  // 커스텀 범례 렌더링 함수
  const renderCustomLegend = (items) => (
    <div className="flex flex-wrap gap-3 justify-center mt-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs">
          <span
            className="inline-block rounded-full mr-1"
            style={{ width: 12, height: 12, backgroundColor: item.color }}
          />
          <span>
            {item.name} <span className="font-semibold">({item.value})</span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <ChartContainer title="프로젝트 상태">
      <div className="grid grid-cols-2 h-full">
        {/* 프로젝트 상태 차트 */}
        <div className="flex flex-col items-center justify-between h-full">
          <div className="w-full" style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {renderPie(
                  statusChartData,
                  statusColors,
                  activeStatusIndex,
                  onStatusPieClick,
                  statusCenterText,
                  statusLegendItems,
                )}
                <Tooltip content={<StatusTooltip />} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-medium"
                  fill="#333"
                >
                  {statusCenterText.status}
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
                  {statusCenterText.count}건
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* 커스텀 범례 */}
          {renderCustomLegend(statusLegendItems)}
        </div>

        {/* 프로젝트 일정 상태 차트 */}
        <div className="flex flex-col items-center justify-between h-full">
          <div className="w-full" style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {renderPie(
                  scheduleChartData,
                  scheduleColors,
                  activeScheduleIndex,
                  onSchedulePieClick,
                  scheduleCenterText,
                  scheduleLegendItems,
                )}
                <Tooltip content={<ScheduleTooltip />} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-medium"
                  fill="#333"
                >
                  {scheduleCenterText.status}
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
                  {scheduleCenterText.count}건
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* 커스텀 범례 */}
          {renderCustomLegend(scheduleLegendItems)}
        </div>
      </div>
    </ChartContainer>
  );
};

export default ProjectStatusDonutCharts;
