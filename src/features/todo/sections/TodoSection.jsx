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
    scheduled: true, // 기본값: scheduled만 체크
    ongoing: false,
  });

  // 날짜 필터 토글 핸들러
  const toggleTaskDateFilter = useCallback(() => {
    const newFilter = taskDateFilter === 'started' ? 'upcoming' : 'started';
    setTaskDateFilter(newFilter);
  }, [taskDateFilter]);

  // 작업 유형 필터 핸들러
  const handleTaskTypeChange = useCallback((type) => {
    setTaskTypeFilter((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  // 필터링된 작업 목록
  const filteredTasks = useCallback(() => {
    if (!tasks) return [];

    console.log('**** tasks ****', tasks);

    let filteredByType = tasks;

    // 1. 작업 유형별 필터링
    if (!taskTypeFilter.scheduled && !taskTypeFilter.ongoing) {
      // 둘 다 체크 해제된 경우 빈 배열 반환
      return [];
    }

    if (!taskTypeFilter.scheduled || !taskTypeFilter.ongoing) {
      // 하나만 선택된 경우
      filteredByType = tasks.filter((task) => {
        if (taskTypeFilter.scheduled && !taskTypeFilter.ongoing) {
          return task.taskScheduleType === 'scheduled';
        }
        if (taskTypeFilter.ongoing && !taskTypeFilter.scheduled) {
          return task.taskScheduleType === 'ongoing';
        }
        return true;
      });
    }

    // activeMenu가 'todayTasks'가 아닌 경우 작업 유형 필터만 적용
    if (activeMenu !== 'todayTasks') {
      return filteredByType;
    }

    // 2. 날짜 필터링 (todayTasks인 경우만)
    const today = dayjs().startOf('day');

    return filteredByType.filter((task) => {
      let startDate;

      if (task.taskScheduleType === 'scheduled') {
        // scheduled: task의 planStartDate 기준
        startDate = dayjs(task.planStartDate).startOf('day');
      } else if (task.taskScheduleType === 'ongoing') {
        // ongoing: project의 startDate 기준
        startDate = dayjs(task.project?.startDate).startOf('day');
      } else {
        return true; // 알 수 없는 타입은 항상 표시
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="scheduled-filter"
                  checked={taskTypeFilter.scheduled}
                  onChange={() => handleTaskTypeChange('scheduled')}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="scheduled-filter"
                  className="text-sm text-gray-700"
                >
                  scheduled
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ongoing-filter"
                  checked={taskTypeFilter.ongoing}
                  onChange={() => handleTaskTypeChange('ongoing')}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="ongoing-filter"
                  className="text-sm text-gray-700"
                >
                  ongoing
                </label>
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
              scheduled:{' '}
              {tasks?.filter((t) => t.taskScheduleType === 'scheduled')
                .length || 0}
            </div>
            <div>
              ongoing:{' '}
              {tasks?.filter((t) => t.taskScheduleType === 'ongoing').length ||
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
              if (!taskTypeFilter.scheduled && !taskTypeFilter.ongoing) {
                return '작업 유형을 선택해주세요.';
              }

              const selectedTypes = [];
              if (taskTypeFilter.scheduled) selectedTypes.push('scheduled');
              if (taskTypeFilter.ongoing) selectedTypes.push('ongoing');

              const typeText = selectedTypes.join(', ');

              if (activeMenu === 'todayTasks') {
                return `${typeText} 작업 중 ${
                  taskDateFilter === 'started' ? '시작된' : '예정된'
                } 작업이 없습니다.`;
              } else {
                return `${typeText} 작업이 없습니다.`;
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
