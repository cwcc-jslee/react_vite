/**
 * PROJECT 전용 Drawer 컴포넌트
 */
// src/features/project/components/drawer/ProjectDrawer.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrawer, closeDrawer } from '../../../../store/slices/uiSlice.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';

// 컴포넌트
import ProjectTaskDescription from '../description/ProjectTaskDescription.jsx';

const ProjectDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  const { visible, mode, options = {} } = drawer;
  const { taskId, bucketIndex, taskIndex } = options;

  // 프로젝트 작업 상태 가져오기
  const projectTaskState = useSelector((state) => state.projectTask);

  // 현재 선택된 작업 정보
  const [currentTask, setCurrentTask] = useState(null);

  // 작업 검색 시 인덱스 먼저 시도, 실패 시 ID로 검색
  const getTaskForStore = () => {
    // 인덱스로 먼저 시도
    if (bucketIndex !== undefined && taskIndex !== undefined) {
      const task = projectTaskState.buckets[bucketIndex]?.tasks[taskIndex];
      if (task && task.id === taskId) {
        return { task, bucketIndex, taskIndex };
      }
    }

    // 인덱스가 유효하지 않거나 ID가 일치하지 않으면 ID로 검색
    if (taskId) {
      for (let i = 0; i < projectTaskState.buckets.length; i++) {
        const bucket = projectTaskState.buckets[i];
        const taskIdx = bucket.tasks.findIndex((t) => t.id === taskId);
        if (taskIdx !== -1) {
          return {
            task: bucket.tasks[taskIdx],
            bucketIndex: i,
            taskIndex: taskIdx,
          };
        }
      }
    }

    return null;
  };

  // drawer가 열릴 때마다 선택된 작업 정보 가져오기
  useEffect(() => {
    if (visible) {
      const taskInfo = getTaskForStore();
      if (taskInfo) {
        setCurrentTask(taskInfo.task);
      } else {
        console.error('작업을 찾을 수 없습니다');
      }
    }
  }, [visible, options, projectTaskState]);

  const controlMenus = [
    {
      key: 'view',
      label: 'View',
      active: mode === 'view',
      onClick: () => {
        // setActiveControl('view');
        handleSetDrawer({ mode: 'view', featureMode: null });
        // dispatch(setDrawer({ mode: 'view' }));
      },
    },
  ];

  const functionMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (currentTask && mode) {
      const titles = {
        view: `TASK 상세정보 - (${currentTask.id})${currentTask.name}`,
      };
      return titles[mode] || '';
    }
    return '';
  };

  // 작업 저장 핸들러
  const handleSaveTask = (updatedTask) => {
    const taskInfo = getTaskForStore();
    if (taskInfo) {
      // updateTask(taskInfo.bucketIndex, taskInfo.taskIndex, updatedTask);
      dispatch(setDrawer({ mode: 'view' }));
    }
  };

  const setDrawerClose = () => {
    dispatch(closeDrawer());
  };

  // 작업 정보 조회 컴포넌트
  const ViewContent = ({ task }) => {
    if (!task)
      return <div className="p-4">작업 정보를 불러오는 중입니다...</div>;
    return <ProjectTaskDescription data={task} />;
  };

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      menu={
        <ActionMenuBar
          controlMenus={controlMenus}
          functionMenus={functionMenus}
        />
      }
      width="900px"
      enableOverlayClick={false}
      controlMode={mode}
    >
      {/* {renderDrawerContent()} */}
      {mode === 'view' && <ViewContent task={currentTask} />}
    </BaseDrawer>
  );
};

export default ProjectDrawer;
