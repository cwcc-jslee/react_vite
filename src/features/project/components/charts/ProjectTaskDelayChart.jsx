// src/features/project/components/charts/ProjectTaskDelayChart.jsx
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
import { getTaskStatus } from '../../utils/scheduleStatusUtils';

/**
 * 프로젝트별 태스크 지연 현황을 표시하는 차트 컴포넌트
 * @param {Array} filteredProjects - 서비스별 필터링된 진행중 프로젝트 배열
 * @param {boolean} isFiltered - 필터가 활성화되어 있는지 여부
 * @param {Object} activeFilters - 현재 활성화된 필터들
 * @returns {JSX.Element} 태스크 지연 차트 컴포넌트
 */
const ProjectTaskDelayChart = ({ 
  filteredProjects = [],
  isFiltered = false,
  activeFilters = {}
}) => {
  const { items, dashboardData } = useProjectStore();
  const [chartType, setChartType] = useState('bar'); // 'donut' or 'bar'
  const [activeIndex, setActiveIndex] = useState(null);
  
  // filteredProjects에서 태스크 상태 계산
  const calculateTaskStatusFromProjects = (projects) => {
    console.log('=== calculateTaskStatusFromProjects ===');
    console.log('입력 프로젝트 수:', projects.length);
    
    const taskStatus = {
      normal: 0,
      delayed: 0,
      imminent: 0,
      total: 0,
    };

    projects.forEach((project, projectIndex) => {
      console.log(`프로젝트 ${projectIndex + 1}:`, {
        id: project.id,
        name: project.pjtName || project.projectName,
        projectTasks: project.projectTasks ? `${project.projectTasks.length}개` : 'undefined',
        taskKeys: project.projectTasks ? Object.keys(project.projectTasks[0] || {}) : 'no tasks'
      });
      
      if (project.projectTasks && Array.isArray(project.projectTasks)) {
        project.projectTasks.forEach((task, taskIndex) => {
          const status = getTaskStatus(task);
          
          if (projectIndex === 0 && taskIndex < 3) { // 첫 번째 프로젝트의 첫 3개 태스크만 로그
            console.log(`  태스크 ${taskIndex + 1}:`, {
              id: task.id,
              name: task.taskName || task.name,
              status: status,
              taskData: task
            });
          }
          
          if (status === 'normal') {
            taskStatus.normal++;
          } else if (status === 'delayed') {
            taskStatus.delayed++;
          } else if (status === 'imminent') {
            taskStatus.imminent++;
          }
          taskStatus.total++;
        });
      } else {
        console.log(`  ⚠️ 프로젝트 ${projectIndex + 1}에 projectTasks가 없음 또는 배열이 아님`);
      }
    });

    console.log('최종 태스크 상태:', taskStatus);
    return taskStatus;
  };
  
  // 필터 상태에 따른 태스크 데이터 결정
  const getTaskScheduleData = () => {
    console.log('=== ProjectTaskDelayChart 디버깅 ===');
    console.log('isFiltered:', isFiltered);
    console.log('filteredProjects.length:', filteredProjects.length);
    console.log('filteredProjects 샘플:', filteredProjects.slice(0, 2));
    
    // 필터가 활성화된 상태라면
    if (isFiltered) {
      // filteredProjects가 있으면 동적 계산
      if (filteredProjects.length > 0) {
        const result = calculateTaskStatusFromProjects(filteredProjects);
        console.log('동적 계산된 태스크 상태:', result);
        return result;
      } else {
        console.log('필터는 활성화되었으나 데이터 없음');
        // 필터가 활성화되어 있지만 데이터가 없으면 빈 데이터 반환
        return {
          normal: 0,
          delayed: 0,
          imminent: 0,
          total: 0,
        };
      }
    } else {
      // 필터가 비활성화 상태면 기존 데이터 사용
      const originalData = dashboardData?.projectAnalytics?.taskScheduleStatus || 
             dashboardData?.projectAnalytics?.task || {
        normal: 0,
        delayed: 0,
        imminent: 0,
        total: 0,
      };
      console.log('기존 대시보드 데이터 사용:', originalData);
      return originalData;
    }
  };

  const taskScheduleData = getTaskScheduleData();


  // 태스크 지연 데이터 가공 (API 데이터 활용)
  const processTaskDelayData = () => {
    const normalTasks = taskScheduleData.normal || 0;
    const delayedTasks = taskScheduleData.delayed || 0;
    const imminentTasks = taskScheduleData.imminent || 0;
    const totalTasks = taskScheduleData.total || 0;

    const result = [
      {
        name: '정상',
        value: normalTasks,
        type: 'normal',
        detail: `${normalTasks}개 태스크 (전체 ${totalTasks}개 중)`
      },
      {
        name: '임박',
        value: imminentTasks,
        type: 'imminent',
        detail: `${imminentTasks}개 태스크 (3일 이내 완료 예정)`
      },
      {
        name: '지연',
        value: delayedTasks,
        type: 'delayed',
        detail: `${delayedTasks}개 태스크 (완료 예정일 초과)`
      }
    ].filter(item => item.value > 0);

    return result;
  };

  // 지연 분포 데이터 (막대 차트용) - API 데이터 활용
  const processDelayDistribution = () => {
    const normalTasks = taskScheduleData.normal || 0;
    const delayedTasks = taskScheduleData.delayed || 0;
    const imminentTasks = taskScheduleData.imminent || 0;

    return [
      {
        name: '정상',
        value: normalTasks,
        count: normalTasks,
        description: '계획된 일정 내'
      },
      {
        name: '임박',
        value: imminentTasks,
        count: imminentTasks,
        description: '3일 이내 완료 예정'
      },
      {
        name: '지연',
        value: delayedTasks,
        count: delayedTasks,
        description: '완료 예정일 초과'
      }
    ].filter(item => item.value > 0);
  };

  const taskDelayData = processTaskDelayData();
  const distributionData = processDelayDistribution();


  // 색상 정의
  const colors = {
    normal: '#10b981',   // 에메랄드 그린
    imminent: '#f59e0b', // 앰버 옐로우
    delayed: '#ef4444',  // 레드
  };

  const barColors = {
    '정상': '#10b981',   // 에메랄드 그린
    '임박': '#f59e0b',   // 앰버 옐로우
    '지연': '#ef4444',   // 레드
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.detail || data.description || `${data.value}개 태스크`}
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
    if (activeIndex !== null && taskDelayData[activeIndex]) {
      const data = taskDelayData[activeIndex];
      return {
        status: data.name,
        count: data.value,
      };
    }
    
    // 지연 데이터가 있으면 우선 표시, 없으면 임박 데이터 표시
    const delayedData = taskDelayData.find(item => item.type === 'delayed');
    if (delayedData) {
      return {
        status: delayedData.name,
        count: delayedData.value,
      };
    }
    
    const imminentData = taskDelayData.find(item => item.type === 'imminent');
    if (imminentData) {
      return {
        status: imminentData.name,
        count: imminentData.value,
      };
    }
    
    return taskDelayData.length > 0
      ? { status: taskDelayData[0].name, count: taskDelayData[0].value }
      : { status: '데이터 없음', count: 0 };
  };

  const centerText = getCenterText();

  // 범례 데이터
  const legendItems = taskDelayData.map(item => ({
    name: item.name,
    value: item.value,
    color: colors[item.type]
  }));

  // 커스텀 범례
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

  // 모든 데이터가 0인지 확인
  const hasNoData = taskDelayData.length === 0 || taskDelayData.every(item => item.value === 0);

  return (
    <ChartContainer title="태스크 지연 현황">
      <div className="relative h-full">
        {renderTypeToggle()}
        
        {hasNoData ? (
          // 데이터가 없을 때 표시할 메시지
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">데이터가 없습니다</p>
              {isFiltered && (
                <p className="text-gray-400 text-xs mt-1">
                  선택된 조건에 해당하는 태스크가 없습니다
                </p>
              )}
            </div>
          </div>
        ) : chartType === 'donut' ? (
          // 도넛 차트
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDelayData}
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
                    {taskDelayData.map((entry, index) => (
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
              <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, fill: '#333' }}>
                  {distributionData.map((entry, index) => (
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

export default ProjectTaskDelayChart;