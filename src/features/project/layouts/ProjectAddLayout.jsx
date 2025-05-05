// src/features/project/layouts/ProjectAddLayout.jsx

import React, { useEffect } from 'react';
import useProjectTask from '../hooks/useProjectTask';
import ProjectAddFormSection from '../sections/ProjectAddFormSection';
import ProjectAddTasksSection from '../sections/ProjectAddTasksSection';

/**
 * 프로젝트 추가 페이지 레이아웃 컴포넌트
 * 프로젝트 정보 입력 폼과 작업 칸반보드 섹션을 구성
 */
const ProjectAddLayout = () => {
  // 칸반 보드 훅 사용
  const { resetKanbanBoard } = useProjectTask();

  useEffect(() => {
    return () => {
      resetKanbanBoard();
    };
  }, [resetKanbanBoard]);

  return (
    <div className="project-add-layout">
      {/* 프로젝트 기본정보 입력 폼 섹션 */}
      <ProjectAddFormSection />

      {/* 프로젝트 작업 칸반보드 섹션 */}
      <ProjectAddTasksSection />
    </div>
  );
};

export default ProjectAddLayout;
