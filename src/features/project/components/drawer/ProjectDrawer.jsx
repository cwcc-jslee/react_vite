/**
 * PROJECT 전용 Drawer 컴포넌트
 */
// src/features/project/components/drawer/ProjectDrawer.jsx
import React from 'react';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';

// 컴포넌트
import ProjectStatusUpdateForm from '../forms/ProjectStatusUpdateForm.jsx';
import ProjectTaskDescription from '../description/ProjectTaskDescription.jsx';

const ProjectDrawer = ({ drawer }) => {
  const { actions } = useUiStore();
  const { visible, mode, data, width = '900px' } = drawer;

  console.log(`>>> drawer`, drawer);

  const controlMenus = [
    // {
    //   key: 'view',
    //   label: 'View',
    //   active: mode === 'view',
    //   onClick: () => {
    //     handleSetDrawer({ mode: 'view', featureMode: null });
    //   },
    // },
  ];

  const functionMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (data && mode) {
      const titles = {
        view: `TASK 상세정보 - (${data.id})${data.name}`,
      };
      return titles[mode] || '';
    }
    return '';
  };

  const handleSetDrawer = (props) => {
    actions.drawer.update(props);
  };

  const setDrawerClose = () => {
    actions.drawer.close();
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
      width={width}
      enableOverlayClick={false}
      controlMode={mode}
    >
      {mode === 'view' && <ViewContent task={data} />}
      {mode === 'edit' && <ProjectStatusUpdateForm data={data} />}
    </BaseDrawer>
  );
};

export default ProjectDrawer;
