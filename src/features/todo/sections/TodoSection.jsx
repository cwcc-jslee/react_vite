import React, { useState, useCallback } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPanel from '../hooks/useTodoPanel';
import { Button, Switch, Alert, Card } from '@shared/components/ui';
import dayjs from 'dayjs';
// import WorkAddForm from '../components/forms/WorkAddForm';
import TodoDetailPanel from '../components/panels/TodoDetailPanel';
import { useUiStore } from '@shared/hooks/useUiStore';
/**
 * Todo 통합 섹션 컴포넌트
 * 할 일 목록 표시 및 필터링과 패널 표시를 모두 담당
 */
const TodoSection = ({ tasks, activeMenu }) => {
  // 패널 관련 기능 Hook 사용
  const {
    selectedTask,
    activePanel,
    isLoading,
    error: panelError,
    isPanelOpen,
    hasHistory,
    handleTaskAction,
    closePanel,
    goBack,
  } = useTodoPanel();
  const { actions: uiActions } = useUiStore();

  // 필터 상태 관리
  const [taskDateFilter, setTaskDateFilter] = useState('started');
  const [taskTypeFilter, setTaskTypeFilter] = useState({
    isScheduled: 'true', // 'all', 'true', 'false' - 기본값: 있음
    isProgress: 'all',   // 'all', 'true', 'false' - 기본값: 모두
  });

  // 날짜 필터 토글 핸들러
  const toggleTaskDateFilter = useCallback(() => {
    const newFilter = taskDateFilter === 'started' ? 'upcoming' : 'started';
    setTaskDateFilter(newFilter);
  }, [taskDateFilter]);

  // 작업 유형 필터 핸들러
  const handleTaskTypeChange = useCallback((type, value) => {
    setTaskTypeFilter((prev) => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  // 필터링된 작업 목록
  const filteredTasks = useCallback(() => {
    if (!tasks) return [];

    console.log('**** tasks ****', tasks);

    let filteredByType = tasks;

    // 1. 작업 유형별 필터링
    filteredByType = tasks.filter((task) => {
      // isScheduled 필터링
      let passScheduledFilter = true;
      if (taskTypeFilter.isScheduled === 'true') {
        passScheduledFilter = task.isScheduled === true;
      } else if (taskTypeFilter.isScheduled === 'false') {
        passScheduledFilter = task.isScheduled === false;
      }
      // 'all'인 경우 passScheduledFilter는 true 유지

      // isProgress 필터링
      let passProgressFilter = true;
      if (taskTypeFilter.isProgress === 'true') {
        passProgressFilter = task.isProgress === true;
      } else if (taskTypeFilter.isProgress === 'false') {
        passProgressFilter = task.isProgress === false;
      }
      // 'all'인 경우 passProgressFilter는 true 유지

      return passScheduledFilter && passProgressFilter;
    });

    // activeMenu가 'todayTasks'가 아닌 경우 작업 유형 필터만 적용
    if (activeMenu !== 'todayTasks') {
      return filteredByType;
    }

    // 2. 날짜 필터링 (todayTasks인 경우만)
    const today = dayjs().startOf('day');

    return filteredByType.filter((task) => {
      let startDate;

      if (task.isScheduled) {
        // scheduled: task의 planStartDate 기준
        startDate = dayjs(task.planStartDate).startOf('day');
      } else {
        // ongoing: project의 startDate 또는 planStartDate 기준
        startDate = dayjs(task.project?.startDate || task.project?.planStartDate).startOf('day');
      }

      if (!startDate.isValid()) {
        return true; // 날짜가 없는 경우 항상 표시
      }

      if (taskDateFilter === 'started') {
        return startDate.isBefore(today) || startDate.isSame(today);
      } else {
        return startDate.isAfter(today);
      }
    });
  }, [tasks, taskDateFilter, taskTypeFilter, activeMenu]);

  // 패널 관련 함수
  // 패널 헤더에 추가할 액션 버튼 - 패널 타입에 따라 다르게 설정
  const renderPanelHeaderActions = () => {
    const actions = [];

    // 뒤로가기 버튼
    if (hasHistory) {
      actions.push(
        <Button
          key="back"
          onClick={goBack}
          variant="outline"
          size="sm"
          className="!p-1"
        >
          ⬅️
        </Button>,
      );
    }

    return actions;
  };

  // Card 메뉴 버튼 클릭
  const onCardMenuClick = (item, task) => {
    if (item.key === 'add') {
      // 작업등록 클릭 시 Drawer 열기
      uiActions.drawer.open({
        visible: true,
        mode: 'add',
        data: task,
        options: {
          taskId: task.id,
        },
      });
    } else if (item.key === 'view') {
      // 작업보기 클릭 시 기존 동작 유지
      handleTaskAction(task, item.key);
    }
  };

  // 패널 내용 렌더링
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'view':
        return <TodoDetailPanel task={selectedTask} />;
      // case 'add':
      // return <WorkAddForm />;
      // TodoDrawer 컴포넌트 사용
      default:
        return <div className="p-4">컨텐츠가 정의되지 않았습니다.</div>;
    }
  };

  // 패널 타입에 따른 기본값 설정
  const getPanelDefaults = () => {
    switch (activePanel) {
      case 'view':
        return {
          title: '작업 리스트',
          headerBgColor: 'bg-blue-50',
        };
      case 'add':
        return {
          title: '작업 등록',
          headerBgColor: 'bg-orange-50',
        };
      default:
        return {
          title: '작업 정보',
          headerBgColor: 'bg-gray-50',
        };
    }
  };

  const defaults = getPanelDefaults();
  const panelTitle = defaults.title;
  const bgColor = defaults.headerBgColor;

  // 로딩 중 오버레이
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-blue-600 font-medium">처리 중...</p>
        </div>
      </div>
    );
  };

  // 패널 렌더링
  const renderPanel = () => {
    if (!isPanelOpen) return null;

    return (
      <Card className="h-full relative">
        {renderLoadingOverlay()}
        <Card.Header className={bgColor}>
          <div className="flex justify-between items-center">
            <Card.Title>{panelTitle}</Card.Title>
            <div className="flex items-center space-x-2">
              {renderPanelHeaderActions()}
              <Button
                onClick={closePanel}
                variant="outline"
                size="sm"
                className="!p-1"
                disabled={isLoading}
              >
                닫기
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Content>{renderPanelContent()}</Card.Content>
      </Card>
    );
  };

  // 할 일 목록 렌더링
  const renderTaskList = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">할 일 목록</h2>
          <div className="flex space-x-4">
            {/* 작업 유형 필터 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">일정:</label>
                <select
                  value={taskTypeFilter.isScheduled}
                  onChange={(e) => handleTaskTypeChange('isScheduled', e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">모두</option>
                  <option value="true">있음</option>
                  <option value="false">없음</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">진행률:</label>
                <select
                  value={taskTypeFilter.isProgress}
                  onChange={(e) => handleTaskTypeChange('isProgress', e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">모두</option>
                  <option value="true">있음</option>
                  <option value="false">없음</option>
                </select>
              </div>
            </div>

            {/* 날짜 필터 토글 */}
            {activeMenu !== 'searchTasks' && (
              <div className="flex items-center">
                <Switch
                  checked={taskDateFilter === 'started'}
                  onChange={toggleTaskDateFilter}
                  className="mr-2"
                />
                <span className="text-sm">
                  {taskDateFilter === 'started' ? '시작됨' : '작업예정'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 디버깅 정보 */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-4 p-2 bg-gray-100 text-xs">
            <div>총 작업: {tasks?.length || 0}</div>
            <div>필터된 작업: {filteredTasks().length}</div>
            <div>
              일정 true:{' '}
              {tasks?.filter((t) => t.isScheduled === true)
                .length || 0}
            </div>
            <div>
              일정 false:{' '}
              {tasks?.filter((t) => t.isScheduled === false)
                .length || 0}
            </div>
            <div>
              진행률 true:{' '}
              {tasks?.filter((t) => t.isProgress === true).length ||
                0}
            </div>
            <div>
              진행률 false:{' '}
              {tasks?.filter((t) => t.isProgress === false).length ||
                0}
            </div>
          </div>
        )}

        {/* 작업 목록 표시 */}
        {filteredTasks().length > 0 ? (
          <div>
            {filteredTasks().map((task) => (
              <TodoCard
                key={task.id}
                task={task}
                onCardMenuClick={(item) => onCardMenuClick(item, task)}
                isSelected={selectedTask?.id === task.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            {(() => {
              const selectedTypes = [];
              if (taskTypeFilter.isScheduled !== 'all') {
                selectedTypes.push(`일정 ${taskTypeFilter.isScheduled === 'true' ? '있음' : '없음'}`);
              }
              if (taskTypeFilter.isProgress !== 'all') {
                selectedTypes.push(`진행률 ${taskTypeFilter.isProgress === 'true' ? '있음' : '없음'}`);
              }

              if (selectedTypes.length === 0) {
                return '조건에 맞는 작업이 없습니다.';
              }

              const typeText = selectedTypes.join(', ');

              if (activeMenu === 'todayTasks') {
                return `${typeText} 조건의 ${
                  taskDateFilter === 'started' ? '시작된' : '예정된'
                } 작업이 없습니다.`;
              } else {
                return `${typeText} 조건의 작업이 없습니다.`;
              }
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex">
      {/* 작업 목록 섹션 */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isPanelOpen ? 'w-1/2' : 'w-full'
        }`}
      >
        {renderTaskList()}
      </div>

      {/* 상세 정보 패널 섹션 */}
      {isPanelOpen && (
        <div className="transition-all duration-300 ease-in-out w-1/2 pl-4">
          {renderPanel()}
        </div>
      )}
    </div>
  );
};

export default TodoSection;
