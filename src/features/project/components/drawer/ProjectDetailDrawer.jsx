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
import { useDispatch } from 'react-redux';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Drawer } from '@shared/components/drawer';
import { useProjectStore } from '../../hooks/useProjectStore';
import { fetchProjectWorks } from '../../../../store/slices/projectSlice';
import {
  getProjectTypeInfo,
  getWorkTypeInfo,
} from '../../constants/projectTypeConstants';

// 섹션 컴포넌트
import ProjectDetailTableSection from '../../sections/ProjectDetailTableSection';
import ProjectDetailTaskSection from '../../sections/ProjectDetailTaskSection';
import ProjectOverviewSection from '../../sections/ProjectOverviewSection';
import ProjectStatusDrawer from './ProjectStatusDrawer';
import ProjectStatusHistoryTab from './tabs/ProjectStatusHistoryTab';

// 메뉴 컴포넌트
import ProjectDetailDrawerMenu from './ProjectDetailDrawerMenu';

const ProjectDetailDrawer = ({ visible, data, onClose }) => {
  const dispatch = useDispatch();
  const { actions: projectActions } = useProjectStore();

  // ==================== 탭 상태 관리 ====================
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'history' | 'statusHistory'
  const [activeTaskView, setActiveTaskView] = useState('table'); // 'table' | 'board' | 'timeline'

  // ==================== Drawer 크기 관리 ====================
  const [isExpanded, setIsExpanded] = useState(false);
  const drawerWidth = isExpanded ? 'WIDE' : 'XL';

  // 확장 버튼 노출 조건: 작업 관리(리스트/보드) 탭에서만 노출
  const showExpandButton = 
    activeTab === 'tasks' && ['table', 'board'].includes(activeTaskView);

  // 탭 변경 시 기본 크기로 초기화
  React.useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  // ==================== 진행상태 관리 Drawer 상태 ====================
  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [statusDrawerData, setStatusDrawerData] = useState(null);

  // ==================== 작업 이력 탭 활성화 시 데이터 조회 ====================
  React.useEffect(() => {
    if (activeTab === 'history' && data?.id) {
      dispatch(fetchProjectWorks({ projectId: data.id }));
    }
  }, [activeTab, data?.id, dispatch]);

  // ==================== 탭 메뉴 렌더링 ====================
  const renderTabMenu = () => {
    return (
      <div className="flex items-center gap-4">
        {/* 메인 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            작업 관리
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
            작업 이력
          </button>
          <button
            onClick={() => setActiveTab('statusHistory')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'statusHistory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            변경이력
          </button>
        </div>

        {/* Task 서브메뉴 (Task 탭 선택 시만 표시) */}
        {activeTab === 'tasks' && (
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
                리스트
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
              <button
                onClick={() => setActiveTaskView('timeline')}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded transition-colors
                  ${activeTaskView === 'timeline'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                타임라인
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
        title={
          <div className="flex items-center gap-3">
            <span>프로젝트 상세정보 - ({data.id}) {data.name || ''}</span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getProjectTypeInfo(data.projectType).colorClass}`}>
                {getProjectTypeInfo(data.projectType).label}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getWorkTypeInfo(data.workType).colorClass}`}>
                {getWorkTypeInfo(data.workType).label}
              </span>
            </div>
          </div>
        }
        onClose={onClose}
        width={drawerWidth}
        level="primary"  // z-index: 50
        enableOverlayClick={false}
        mode="view"
        animationEnabled={true}
        headerActions={
          <div className="flex items-center gap-2">
            {/* 확장/축소 버튼 */}
            {showExpandButton && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={isExpanded ? '기본 크기로 복원' : '넓게 보기'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            )}
            <ProjectDetailDrawerMenu
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHistory={handleHistory}
            />
          </div>
        }
        menu={renderTabMenu()}
      >
        {/* 탭별 컨텐츠 */}
        {activeTab === 'overview' && (
          <ProjectOverviewSection
            data={data}
            projectTasks={data.projectTasks || []}
            onStatusClick={handleStatusClick}
          />
        )}

        {activeTab === 'tasks' && (
          <ProjectDetailTaskSection
            projectTaskBuckets={data.projectTaskBuckets || []}
            projectTasks={data.projectTasks || []}
            activeMenu={activeTaskView}
            isExpanded={isExpanded}
          />
        )}

        {activeTab === 'history' && (
          <ProjectDetailTaskSection
            projectTaskBuckets={data.projectTaskBuckets || []}
            projectTasks={data.projectTasks || []}
            activeMenu="work"
          />
        )}

        {activeTab === 'statusHistory' && (
          <ProjectStatusHistoryTab data={data} />
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
