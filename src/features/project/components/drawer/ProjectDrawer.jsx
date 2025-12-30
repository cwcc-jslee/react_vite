/**
 * PROJECT 전용 Drawer 컴포넌트
 */
// src/features/project/components/drawer/ProjectDrawer.jsx
import React, { useState } from 'react';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar.jsx';

// 컴포넌트
import ProjectTaskDescription from '../description/ProjectTaskDescription.jsx';
import ProjectStatusFlowTab from './tabs/ProjectStatusFlowTab.jsx';
import ProjectStatusHistoryTab from './tabs/ProjectStatusHistoryTab.jsx';

const ProjectDrawer = ({ drawer }) => {
  const { actions } = useUiStore();
  const { visible, mode, data, width = '900px', activeTab: initialTab } = drawer;
  const [activeTab, setActiveTab] = useState(initialTab || 'flow');

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
        edit: '프로젝트 상태 관리',
        status: '프로젝트 상태 관리',
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

  // 상태 관리 모드 (탭 구조)
  const StatusManagementContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* 탭 메뉴 */}
        <div className="flex gap-2 px-6 py-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('flow')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'flow'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            진행 플로우
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            변경 이력
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'flow' && <ProjectStatusFlowTab data={data} />}
          {activeTab === 'history' && <ProjectStatusHistoryTab data={data} />}
        </div>
      </div>
    );
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
      {mode === 'edit' && <StatusManagementContent />}
      {mode === 'status' && <StatusManagementContent />}
    </BaseDrawer>
  );
};

export default ProjectDrawer;
