/**
 * PROJECT 추가 전용 Drawer 컴포넌트
 * - 프로젝트 기본정보 폼
 * - TASK 칸반보드
 */
// src/features/project/components/drawer/ProjectAddDrawer.jsx

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Drawer } from '@shared/components/drawer';
import useProjectTask from '../../hooks/useProjectTask';

// 섹션 컴포넌트
import ProjectAddFormSection from '../../sections/ProjectAddFormSection';
import ProjectAddTasksSection from '../../sections/ProjectAddTasksSection';

const ProjectAddDrawer = ({ visible, onClose }) => {
  // 칸반 보드 훅 사용
  const { resetKanbanBoard } = useProjectTask();

  // Drawer 닫힐 때 칸반보드 초기화
  useEffect(() => {
    if (!visible) {
      resetKanbanBoard();
    }
  }, [visible, resetKanbanBoard]);

  return (
    <Drawer
      visible={visible}
      title="새 프로젝트 등록"
      onClose={onClose}
      width="WIDE"
      level="primary"
      enableOverlayClick={false}
      mode="add"
      animationEnabled={true}
    >
      <div className="flex flex-col gap-6">
        {/* 프로젝트 기본정보 입력 폼 섹션 */}
        <div className="flex-shrink-0">
          <ProjectAddFormSection onClose={onClose} />
        </div>

        {/* 프로젝트 작업 칸반보드 섹션 */}
        <div className="flex-1 min-h-0">
          <ProjectAddTasksSection />
        </div>
      </div>
    </Drawer>
  );
};

ProjectAddDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectAddDrawer;
