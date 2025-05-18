// src/features/project/layouts/ProjectDetailLayout.jsx
// 프로젝트 상세 정보와 태스크를 표시하는 레이아웃 컴포넌트
// 프로젝트 데이터를 추출하고 변환하여 하위 컴포넌트에 전달합니다

import React, { useEffect } from 'react';

// 커스텀 훅
import { useProjectStore } from '../hooks/useProjectStore';
import useWorkStore from '../../work/hooks/useWorkStore';
import { useProjectBucketStore } from '../hooks/useProjectBucketStore';

// 컴포넌트
import ProjectDetailTableSection from '../sections/ProjectDetailTableSection';
import ProjectDetailTaskSection from '../sections/ProjectDetailTaskSection';

/**
 * 프로젝트 상세 페이지 레이아웃 컴포넌트
 */
const ProjectDetailLayout = () => {
  // Detail 상태 가져오기
  const { selectedItem, actions } = useProjectStore();
  const { data, status, error } = selectedItem || {};
  const { actions: bucketActions } = useProjectBucketStore();

  // 컴포넌트 언마운트 selectedItem 초기화
  useEffect(() => {
    return () => {
      actions.detail.clearDetail();
      bucketActions.bucket.resetKanbanBoard();
    };
  }, []);

  // 프로젝트 태스크 데이터를 칸반 보드에 동기화
  useEffect(() => {
    // 데이터 로딩이 완료되고 데이터가 있는 경우에만 동기화 실행
    if (
      status === 'succeeded' &&
      data?.projectTaskBuckets?.length > 0 &&
      data?.projectTasks?.length > 0
    ) {
      bucketActions.bucket.syncProjectTasksToKanban(
        data.projectTaskBuckets,
        data.projectTasks,
      );
    }
  }, [status, data?.projectTaskBuckets, data?.projectTasks]);

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
  const {
    projectTaskBuckets = [],
    projectTasks = [],
    ...projectData
  } = data || {};

  console.log(`>>>> projectTaskBuckets : `, projectTaskBuckets);
  console.log(`>>>> projectTasks : `, projectTasks);

  return (
    <div className="flex flex-col space-y-6">
      {/* 프로젝트 기본정보 테이블 섹션 */}
      <ProjectDetailTableSection
        data={projectData}
        projectTasks={projectTasks}
      />
      {/* 프로젝트 테스크 섹션 */}
      <ProjectDetailTaskSection
        // data={data}
        // projectTaskBuckets={projectTaskBuckets}
        projectTasks={projectTasks}
        bucketActions={bucketActions}
      />
    </div>
  );
};

export default ProjectDetailLayout;
