// src/features/project/layouts/ProjectAddLayout.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ProjectDetailTableSection from '../sections/ProjectDetailTableSection';
import ProjectTaskSection from '../sections/ProjectTaskSection';
import ProjectTaskBoardSection from '../sections/ProjectTaskBoardSection';

/**
 * 프로젝트 상세 페이지 레이아웃 컴포넌트
 */
const ProjectDetailLayout = ({ formProps, kanbanProps }) => {
  // Detail 상태 가져오기
  const selectedItem = useSelector((state) => state.pageState.selectedItem);
  const { data, status, error } = selectedItem;

  // 로딩 상태 처리
  if (status === 'loading') {
    return <div className="flex justify-center p-4">로딩 중...</div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div className="text-red-500 p-4">에러 발생: {error.message}</div>;
  }

  // success 상태가 아닐 경우 아무것도 렌더링하지 않음
  if (status !== 'succeeded') {
    return (
      <div className="flex justify-center p-4">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  // status가 succeeded일 때만 데이터 추출 실행
  const { projectTaskBuckets = [], projectTasks = [], ...otherData } = data;

  return (
    <div className="flex flex-col space-y-6">
      {/* 프로젝트 기본정보 테이블 섹션 */}
      <ProjectDetailTableSection data={otherData} />

      {/* 프로젝트 Task 섹션 */}
      {/* <ProjectTaskSection tasks={tasks} /> */}

      <ProjectTaskBoardSection />
    </div>
  );
};

export default ProjectDetailLayout;
