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
  const { data } = selectedItem;

  const [tasks, setTasks] = useState([
    // 샘플 작업 데이터
    {
      id: 1,
      name: '요구사항 분석',
      bucket: '계획',
      completed: true,
      progress: 100,
      startDate: '2025-03-15',
      endDate: '2025-03-20',
      workHours: 15,
      assignee: { id: 1, name: '홍길동' },
      priority: '높음',
      checklist: [
        { id: 1, text: '이해관계자 인터뷰', checked: true },
        { id: 2, text: '요구사항 문서화', checked: true },
      ],
    },
    {
      id: 2,
      name: '디자인 작업',
      bucket: '진행중',
      completed: false,
      progress: 60,
      startDate: '2025-03-22',
      endDate: '2025-04-05',
      workHours: 24,
      assignee: { id: 2, name: '김철수' },
      priority: '중간',
      checklist: [
        { id: 1, text: '와이어프레임 제작', checked: true },
        { id: 2, text: 'UI 디자인', checked: true },
        { id: 3, text: '사용자 테스트', checked: false },
      ],
    },
    {
      id: 3,
      name: '프론트엔드 개발',
      bucket: '진행중',
      completed: false,
      progress: 30,
      startDate: '2025-03-25',
      endDate: '2025-04-15',
      workHours: 40,
      assignee: { id: 3, name: '이영희' },
      priority: '높음',
      checklist: [
        { id: 1, text: '레이아웃 구현', checked: true },
        { id: 2, text: '컴포넌트 개발', checked: false },
        { id: 3, text: '상태 관리 연결', checked: false },
      ],
    },
  ]);

  return (
    <div className="flex flex-col space-y-6">
      {/* 프로젝트 기본정보 테이블 섹션 */}
      <ProjectDetailTableSection />

      {/* 프로젝트 Task 섹션 */}
      {/* <ProjectTaskSection tasks={tasks} /> */}

      <ProjectTaskBoardSection />
    </div>
  );
};

export default ProjectDetailLayout;
