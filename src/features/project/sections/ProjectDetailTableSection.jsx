// src/features/project/sections/ProjectDetailTableSection.jsx

import React from 'react';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import ProjectDetailTable from '../components/tables/ProjectDetailTable';

/**
 * 프로젝트 목록 테이블 섹션 컴포넌트
 * 프로젝트 목록과 페이지네이션을 표시

 */
const ProjectDetailTableSection = ({ data, projectTasks }) => {
  const { actions } = useUiStore();
  // 상태 섹션 클릭 핸들러
  const handleStatusSectionClick = (e) => {
    // 이벤트 디버깅 로그
    console.log('이벤트 발생', e.type);
    console.log('진행상태 섹션 클릭:', data);
    actions.drawer.open({
      mode: 'edit',
      data: {
        id: data.id,
        documentId: data.documentId,
        pjtStatus: data.pjtStatus,
      },
      width: '600px',
    });
  };

  return (
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">
            프로젝트 정보({data.id}) : {data.name}
          </h2>
        </div>
      </div>
      <ProjectDetailTable
        data={data}
        projectTasks={projectTasks}
        onStatusClick={handleStatusSectionClick}
      />
    </div>
  );
};

export default ProjectDetailTableSection;
