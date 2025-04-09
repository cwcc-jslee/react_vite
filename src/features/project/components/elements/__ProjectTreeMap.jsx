// src/features/project/components/elements/ProjectTreeMap.jsx
import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * 진행 중인 프로젝트를 작업 시간에 따라 크기가 다르게 표시하는 TreeMap 차트
 * @returns {JSX.Element} 프로젝트 TreeMap 차트 컴포넌트
 */
const ProjectTreeMap = () => {
  // 샘플 프로젝트 데이터 - 실제 구현 시 props 또는 API에서 가져올 수 있음
  const projectData = [
    {
      name: '웹사이트 리뉴얼',
      hours: 180,
      progress: 75,
      status: '진행중',
      color: '#0078D4',
      members: 4,
    },
    {
      name: '모바일 앱 개발',
      hours: 320,
      progress: 50,
      status: '진행중',
      color: '#FFB900',
      members: 6,
    },
    {
      name: '마케팅 대시보드',
      hours: 120,
      progress: 25,
      status: '진행중',
      color: '#FF8C00',
      members: 3,
    },
    {
      name: 'ERP 시스템 구축',
      hours: 450,
      progress: 35,
      status: '진행중',
      color: '#107C10',
      members: 8,
    },
    {
      name: '검색 엔진 최적화',
      hours: 85,
      progress: 90,
      status: '진행중',
      color: '#0078D4',
      members: 2,
    },
    {
      name: 'CRM 시스템 연동',
      hours: 160,
      progress: 45,
      status: '진행중',
      color: '#FFB900',
      members: 3,
    },
    {
      name: '데이터 마이그레이션',
      hours: 110,
      progress: 65,
      status: '진행중',
      color: '#107C10',
      members: 2,
    },
    {
      name: 'API 개발',
      hours: 200,
      progress: 30,
      status: '진행중',
      color: '#FF8C00',
      members: 4,
    },
  ];

  // 프로젝트 상태에 따른 색상 지정 함수
  const getColorByProgress = (progress) => {
    if (progress < 30) return '#FF8C00';
    if (progress < 50) return '#FFB900';
    if (progress < 75) return '#107C10';
    return '#0078D4';
  };

  // TreeMap 데이터 형식으로 변환
  const treeMapData = [
    {
      name: '진행중 프로젝트',
      children: projectData.map((project) => ({
        name: project.name,
        size: project.hours,
        progress: project.progress,
        hours: project.hours,
        members: project.members,
        color: getColorByProgress(project.progress),
      })),
    },
  ];

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="text-base font-semibold mb-1">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p>
              작업 시간: <span className="font-medium">{data.hours}시간</span>
            </p>
            <p>
              진행률: <span className="font-medium">{data.progress}%</span>
            </p>
            <p>
              참여 인원: <span className="font-medium">{data.members}명</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // TreeMap 내부 콘텐츠 렌더링 함수
  const CustomizedContent = (props) => {
    const { x, y, width, height, name, progress, hours } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.color,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {width > 30 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 12}
              textAnchor="middle"
              fill="#fff"
              fontSize={width < 100 ? 10 : 12}
              fontWeight="bold"
              style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize={width < 100 ? 9 : 11}
              style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
            >
              {hours}시간
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 18}
              textAnchor="middle"
              fill="#fff"
              fontSize={width < 100 ? 9 : 11}
              style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
            >
              {progress}% 완료
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="w-full border border-gray-200 rounded shadow-sm">
      <h2 className="text-lg font-semibold p-3 bg-zinc-100 border-b">
        진행중 프로젝트 작업 시간
      </h2>

      <div className="p-4 bg-white">
        <div style={{ width: '100%', height: '450px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeMapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap p-3 border-t bg-gray-50">
        <div className="mr-6 font-medium text-sm">진행률에 따른 색상:</div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 mr-1 bg-orange-500"></div>
          <span className="text-xs">30% 미만</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 mr-1 bg-yellow-500"></div>
          <span className="text-xs">30-50%</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 mr-1 bg-green-700"></div>
          <span className="text-xs">50-75%</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 mr-1 bg-blue-600"></div>
          <span className="text-xs">75% 이상</span>
        </div>
        <div className="flex-1 text-right text-xs text-gray-500">
          *박스 크기는 총 작업 시간에 비례합니다
        </div>
      </div>
    </div>
  );
};

export default ProjectTreeMap;
