/**
 * PROJECT 상세보기 전용 Drawer 컴포넌트
 * SFA 상세보기 Drawer 구조를 참고하여 작성
 * - 프로젝트 정보 표시
 * - TASK 관리 (테이블/보드/작업)
 * - 진행상태 변경 (중첩 Drawer)
 */
// src/features/project/components/drawer/ProjectDetailDrawer.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Drawer } from '@shared/components/drawer';
import { useProjectStore } from '../../hooks/useProjectStore';

// 섹션 컴포넌트
import ProjectDetailTableSection from '../../sections/ProjectDetailTableSection';
import ProjectDetailTaskSection from '../../sections/ProjectDetailTaskSection';
import ProjectStatusDrawer from './ProjectStatusDrawer';

// 메뉴 컴포넌트
import ProjectDetailDrawerMenu from './ProjectDetailDrawerMenu';

const ProjectDetailDrawer = ({ visible, data, onClose }) => {
  const { actions: projectActions } = useProjectStore();

  // ==================== 탭 상태 관리 ====================
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'task' | 'work' | 'timeline'
  const [activeTaskView, setActiveTaskView] = useState('table'); // 'table' | 'board'

  // ==================== 진행상태 관리 Drawer 상태 ====================
  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [statusDrawerData, setStatusDrawerData] = useState(null);

  // ==================== 탭 메뉴 렌더링 ====================
  const renderTabMenu = () => {
    return (
      <div className="flex items-center gap-4">
        {/* 메인 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            프로젝트 정보
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'task'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            TASK 관리
          </button>
          <button
            onClick={() => setActiveTab('work')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'work'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            작업
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            타임라인
          </button>
        </div>

        {/* Task 서브메뉴 (Task 탭 선택 시만 표시) */}
        {activeTab === 'task' && (
          <>
            <div className="h-6 w-px bg-gray-300" /> {/* 구분선 */}
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTaskView('table')}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded transition-colors
                  ${activeTaskView === 'table'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                테이블
              </button>
              <button
                onClick={() => setActiveTaskView('board')}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded transition-colors
                  ${activeTaskView === 'board'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                보드
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ==================== 진행상태 카드 클릭 핸들러 ====================
  const handleStatusClick = () => {
    setStatusDrawerData({
      id: data.id,
      documentId: data.documentId,
      pjtStatus: data.pjtStatus,
      statusHistory: data.statusHistory || [],
      isClosed: data.isClosed,
      projectClosure: data.projectClosure,
      projectTasks: data.projectTasks,
    });
    setStatusDrawerVisible(true);
  };

  // ==================== 진행상태 Drawer 닫기 ====================
  const handleStatusDrawerClose = () => {
    setStatusDrawerVisible(false);
    // TODO: 프로젝트 상태 변경 후 데이터 갱신이 필요한 경우
    // fetchDetailForDrawer를 사용하거나 부모 컴포넌트에서 처리
  };

  // ==================== 메뉴 액션 핸들러 ====================
  const handleEdit = () => {
    console.log('프로젝트 수정 기능 - 구현 예정');
  };

  const handleDelete = () => {
    console.log('프로젝트 삭제 기능 - 구현 예정');
  };

  const handleHistory = () => {
    console.log('변경 이력 기능 - 구현 예정');
  };

  // ==================== 렌더링 ====================
  if (!data) return null;

  return (
    <>
      {/* 1차 Drawer: 프로젝트 상세보기 (사이드바 제외 전체) */}
      <Drawer
        visible={visible}
        title={`프로젝트 상세정보 - (${data.id}) ${data.name || ''}`}
        onClose={onClose}
        width="WIDE"
        level="primary"  // z-index: 50
        enableOverlayClick={false}
        mode="view"
        animationEnabled={true}
        headerActions={
          <ProjectDetailDrawerMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            onHistory={handleHistory}
          />
        }
        menu={renderTabMenu()}
      >
        {/* 탭별 컨텐츠 */}
        {activeTab === 'info' && (
          <ProjectDetailTableSection
            data={data}
            projectTasks={data.projectTasks || []}
            onStatusClick={handleStatusClick}
          />
        )}

        {activeTab === 'task' && (
          <ProjectDetailTaskSection
            projectTaskBuckets={data.projectTaskBuckets || []}
            projectTasks={data.projectTasks || []}
            activeMenu={activeTaskView}
          />
        )}

        {activeTab === 'work' && (
          <ProjectDetailTaskSection
            projectTaskBuckets={data.projectTaskBuckets || []}
            projectTasks={data.projectTasks || []}
            activeMenu="work"
          />
        )}

        {activeTab === 'timeline' && (
          <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
            타임라인 뷰는 현재 개발 중입니다.
          </div>
        )}
      </Drawer>

      {/* 2차 Drawer: 진행상태 관리 (중첩 Drawer) */}
      {statusDrawerVisible && statusDrawerData && (
        <ProjectStatusDrawer
          visible={statusDrawerVisible}
          data={statusDrawerData}
          onClose={handleStatusDrawerClose}
        />
      )}
    </>
  );
};

ProjectDetailDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ProjectDetailDrawer;
