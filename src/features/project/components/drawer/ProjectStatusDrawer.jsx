/**
 * PROJECT 진행상태 관리 전용 Drawer 컴포넌트
 * 기존 ProjectDrawer의 status 모드를 분리
 * 중첩 Drawer로 사용 (level: 'secondary')
 */
// src/features/project/components/drawer/ProjectStatusDrawer.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Drawer } from '@shared/components/drawer';

// 탭 컴포넌트
import ProjectStatusFlowTab from './tabs/ProjectStatusFlowTab';
import ProjectStatusHistoryTab from './tabs/ProjectStatusHistoryTab';

const ProjectStatusDrawer = ({ visible, data, onClose }) => {
  const [activeTab, setActiveTab] = useState('flow'); // 'flow' | 'history'

  // ==================== 탭 메뉴 렌더링 ====================
  const renderTabMenu = () => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('flow')}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${
              activeTab === 'flow'
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
            ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          변경 이력
        </button>
      </div>
    );
  };

  // ==================== 렌더링 ====================
  if (!data) return null;

  return (
    <Drawer
      visible={visible}
      title="프로젝트 상태 관리"
      onClose={onClose}
      width="LG_PLUS"
      level="secondary" // z-index: 60 (중첩 Drawer)
      enableOverlayClick={false}
      mode="status"
      animationEnabled={true}
      menu={renderTabMenu()}
    >
      {/* 탭별 컨텐츠 */}
      {activeTab === 'flow' && <ProjectStatusFlowTab data={data} />}
      {activeTab === 'history' && <ProjectStatusHistoryTab data={data} />}
    </Drawer>
  );
};

ProjectStatusDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ProjectStatusDrawer;
