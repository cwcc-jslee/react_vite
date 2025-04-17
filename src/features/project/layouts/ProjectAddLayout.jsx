// src/features/project/layouts/ProjectAddLayout.jsx

import React, { useEffect } from 'react';
import useProjectTask from '../hooks/useProjectTask';
import ProjectAddFormSection from '../sections/ProjectAddFormSection';
import ProjectTaskBoardSection from '../sections/ProjectTaskBoardSection';

/**
 * 프로젝트 추가 페이지 레이아웃 컴포넌트
 * 프로젝트 정보 입력 폼과 작업 칸반보드 섹션을 구성
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.formProps - 프로젝트 기본정보 폼 속성
 * @param {Object} props.kanbanProps - 칸반보드 관련 속성
 * @returns {JSX.Element} 프로젝트 추가 레이아웃
 */
const ProjectAddLayout = ({ formProps, codebooks }) => {
  // 칸반 보드 훅 사용
  const { resetKanbanBoard } = useProjectTask();

  useEffect(() => {
    // 컴포넌트 언마운트 시 버킷 상태 초기화
    return () => {
      resetKanbanBoard();
    };
  }, [resetKanbanBoard]);

  return (
    <div className="flex flex-col space-y-6">
      {/* 프로젝트 기본정보 입력 폼 섹션 */}
      <ProjectAddFormSection {...formProps} codebooks={codebooks} />

      {/* 프로젝트 작업 칸반보드 섹션 */}
      <ProjectTaskBoardSection />
    </div>
  );
};

export default ProjectAddLayout;
