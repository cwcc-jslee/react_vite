// src/features/project/sections/ProjectDetailTableSection.jsx

import React from 'react';
import ProjectDetailTable from '../components/tables/ProjectDetailTable';

/**
 * 프로젝트 목록 테이블 섹션 컴포넌트
 * 프로젝트 목록과 페이지네이션을 표시

 */
const ProjectDetailTableSection = ({}) => {
  return (
    <div className="bg-white rounded-md shadow">
      {/* 상단 툴바 - 검색, 필터, 뷰 전환 버튼 */}
      <div className="flex flex-wrap items-center justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-800">프로젝트 정보</h2>
        </div>
      </div>
      <ProjectDetailTable />
    </div>
  );
};

export default ProjectDetailTableSection;
