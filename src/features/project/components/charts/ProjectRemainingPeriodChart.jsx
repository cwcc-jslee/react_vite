// src/features/project/components/charts/ProjectRemainingPeriodChart.jsx
import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import ChartContainer from '../../../../shared/components/charts/ChartContainer';
import { useProjectStore } from '../../hooks/useProjectStore';

/**
 * 프로젝트 남은 기간별 현황을 표시하는 차트 컴포넌트
 * @returns {JSX.Element} 남은 기간별 차트 컴포넌트
 */
const ProjectRemainingPeriodChart = () => {
  const { dashboardData } = useProjectStore();
  const [chartType, setChartType] = useState('bar'); // 'donut' or 'bar'
  const [activeIndex, setActiveIndex] = useState(null);
  
  // API에서 받은 남은 기간별 데이터
  const remainingPeriodData = dashboardData?.projectAnalytics?.projectRemainingPeriod || 
                              dashboardData?.projectAnalytics?.remainingPeriod || {
    overdue2Month: 0,
    overdue1Month: 0,
    imminent: 0,
    oneMonth: 0,
    twoMonths: 0,
    threeMonths: 0,
    longTerm: 0,
    total: 0,
  };


  // 남은 기간 데이터 가공
  const processRemainingPeriodData = () => {
    const result = [
      {
        name: '2달이상 초과',
        value: remainingPeriodData.overdue2Month || 0,
        type: 'overdue2Month',
        detail: `${remainingPeriodData.overdue2Month}개 프로젝트 (2달 이상 초과)`
      },
      {
        name: '1달이상 초과',
        value: remainingPeriodData.overdue1Month || 0,
        type: 'overdue1Month',
        detail: `${remainingPeriodData.overdue1Month}개 프로젝트 (1달 이상 초과)`
      },
      {
        name: '임박',
        value: remainingPeriodData.imminent || 0,
        type: 'imminent',
        detail: `${remainingPeriodData.imminent}개 프로젝트 (7일 이하)`
      },
      {
        name: '1달 이내',
        value: remainingPeriodData.oneMonth || 0,
        type: 'oneMonth',
        detail: `${remainingPeriodData.oneMonth}개 프로젝트 (1달 이내)`
      },
      {
        name: '2달 이내',
        value: remainingPeriodData.twoMonths || 0,
        type: 'twoMonths',
        detail: `${remainingPeriodData.twoMonths}개 프로젝트 (2달 이내)`
      },
      {
        name: '3달 이내',
        value: remainingPeriodData.threeMonths || 0,
        type: 'threeMonths',
        detail: `${remainingPeriodData.threeMonths}개 프로젝트 (3달 이내)`
      },
      {
        name: '3달 이상',
        value: remainingPeriodData.longTerm || 0,
        type: 'longTerm',
        detail: `${remainingPeriodData.longTerm}개 프로젝트 (3달 이상)`
      }
    ].filter(item => item.value > 0);

    return result;
  };

  const chartData = processRemainingPeriodData();

  // 색상 정의
  const colors = {
    overdue2Month: '#dc2626',  // 진한 빨강 - 2달 이상 초과
    overdue1Month: '#ef4444',  // 빨강 - 1달 이상 초과
    imminent: '#f59e0b',       // 주황 - 임박
    oneMonth: '#3b82f6',       // 파랑 - 1달 이내
    twoMonths: '#06b6d4',      // 하늘색 - 2달 이내
    threeMonths: '#10b981',    // 초록 - 3달 이내
    longTerm: '#059669',       // 진한 초록 - 3달 이상
  };

  const barColors = {
    '2달이상 초과': '#dc2626',
    '1달이상 초과': '#ef4444',
    '임박': '#f59e0b',
    '1달 이내': '#3b82f6',
    '2달 이내': '#06b6d4',
    '3달 이내': '#10b981',
    '3달 이상': '#059669',
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.detail || `${data.value}개 프로젝트`}
          </p>
        </div>
      );
    }
    return null;
  };

  // 파이 클릭 핸들러
  const onPieClick = (_, index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // 가운데 텍스트 계산
  const getCenterText = () => {
    if (activeIndex !== null && chartData[activeIndex]) {
      const data = chartData[activeIndex];
      return {
        status: data.name,
        count: data.value,
      };
    }
    
    // 초과 데이터가 있으면 우선 표시
    const overdue2Data = chartData.find(item => item.type === 'overdue2Month');
    if (overdue2Data) {
      return {
        status: overdue2Data.name,
        count: overdue2Data.value,
      };
    }
    
    const overdue1Data = chartData.find(item => item.type === 'overdue1Month');
    if (overdue1Data) {
      return {
        status: overdue1Data.name,
        count: overdue1Data.value,
      };
    }
    
    const imminentData = chartData.find(item => item.type === 'imminent');
    if (imminentData) {
      return {
        status: imminentData.name,
        count: imminentData.value,
      };
    }
    
    return chartData.length > 0
      ? { status: chartData[0].name, count: chartData[0].value }
      : { status: '데이터 없음', count: 0 };
  };

  const centerText = getCenterText();

  // 범례 데이터
  const legendItems = chartData.map(item => ({
    name: item.name,
    value: item.value,
    color: colors[item.type]
  }));

  // 커스텀 범례
  const renderCustomLegend = (items) => (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs">
          <span
            className="inline-block rounded-full mr-1"
            style={{ width: 10, height: 10, backgroundColor: item.color }}
          />
          <span>
            {item.name} <span className="font-semibold">({item.value})</span>
          </span>
        </div>
      ))}
    </div>
  );

  // 차트 타입 토글 버튼
  const renderTypeToggle = () => (
    <div className="absolute top-2 right-2 z-10">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setChartType('donut')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            chartType === 'donut' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          도넛
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            chartType === 'bar' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          막대
        </button>
      </div>
    </div>
  );

  return (
    <ChartContainer title="프로젝트 남은 기간">
      <div className="relative h-full">
        {renderTypeToggle()}
        
        {chartType === 'donut' ? (
          // 도넛 차트
          <div className="flex flex-col h-full">
            <div className="flex-1">
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
                    onClick={onPieClick}
                    activeIndex={activeIndex}
                    style={{ outline: 'none' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[entry.type]}
                        stroke="#ffffff"
                        strokeWidth={1}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                        style={{ outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-medium text-sm"
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
                    className="font-bold text-sm"
                    fill="#333"
                  >
                    {centerText.count}개
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {renderCustomLegend(legendItems)}
          </div>
        ) : (
          // 막대 차트
          <div className="h-full pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, fill: '#333' }}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[entry.name] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

export default ProjectRemainingPeriodChart;