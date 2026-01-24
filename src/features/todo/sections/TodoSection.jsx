import React, { useState, useCallback, useEffect } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPanel from '../hooks/useTodoPanel';
import { Button, Switch, Alert, Card } from '@shared/components/ui';
import dayjs from 'dayjs';
// import WorkAddForm from '../components/forms/WorkAddForm';
import TodoDetailPanel from '../components/panels/TodoDetailPanel';
import { useUiStore } from '@shared/hooks/useUiStore';
import { WORK_TYPE } from '../../project/constants/projectTypeConstants';
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
  const [activeWorkType, setActiveWorkType] = useState(WORK_TYPE.PROJECT.code); // 기본값: 프로젝트
  const [activeStatus, setActiveStatus] = useState('inProgress'); // 기본값: 진행중
  const [taskTypeFilter, setTaskTypeFilter] = useState({
    isScheduled: 'true', // 'all', 'true', 'false' - 기본값: 있음
  });

  // 날짜 필터 토글 핸들러
  const toggleTaskDateFilter = useCallback(() => {
    const newFilter = taskDateFilter === 'started' ? 'upcoming' : 'started';
    setTaskDateFilter(newFilter);
  }, [taskDateFilter]);

  // activeWorkType 변경 시 하위 필터 자동 설정
  useEffect(() => {
    if (
      activeWorkType === WORK_TYPE.PROJECT.code ||
      activeWorkType === WORK_TYPE.TASK.code
    ) {
      // 프로젝트, 단순작업: 계획 업무 & 오늘 할 일
      setTaskTypeFilter((prev) => ({ ...prev, isScheduled: 'true' }));
      setTaskDateFilter('started');
    } else {
      // 유지보수, 전체: 전체 & 전체
      setTaskTypeFilter((prev) => ({ ...prev, isScheduled: 'all' }));
      setTaskDateFilter('all');
    }

    // 프로젝트 상태 필터 자동 설정
    if (activeWorkType === WORK_TYPE.PROJECT.code) {
      setActiveStatus('inProgress');
    } else {
      setActiveStatus('all');
    }
  }, [activeWorkType]);

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

    if (process.env.NODE_ENV === 'development') {
      console.log('Task Structure Debug:', tasks[0]);
      console.log('Active WorkType:', activeWorkType);
    }

    let filteredByType = tasks;

    // 0. WorkType(프로젝트 유형) 필터링 (전체가 아닐 경우)
    if (activeWorkType !== 'all') {
      filteredByType = filteredByType.filter(
        (task) => task.project?.workType === activeWorkType,
      );
    }

    // 0-1. Project Status(진행/검수) 필터링
    if (activeStatus !== 'all') {
      filteredByType = filteredByType.filter((task) => {
        // camelCase 또는 snake_case 모두 확인
        const statusId = task.project?.pjtStatus?.id || task.project?.pjt_status?.id;
        
        // 개발 모드 디버깅 로그
        if (process.env.NODE_ENV === 'development') {
           console.log(`Task ${task.id} Project:`, task.project?.name, `Status ID:`, statusId);
        }

        if (activeStatus === 'inProgress') {
          return Number(statusId) === 88;
        } else if (activeStatus === 'reviewing') {
          return Number(statusId) === 87 || Number(statusId) === 89;
        }
        return true;
      });
    }

    // 1. 작업 유형별 필터링
    filteredByType = filteredByType.filter((task) => {
      // isScheduled 필터링
      let passScheduledFilter = true;
      if (taskTypeFilter.isScheduled === 'true') {
        passScheduledFilter = task.isScheduled === true;
      } else if (taskTypeFilter.isScheduled === 'false') {
        passScheduledFilter = task.isScheduled === false;
      }
      // 'all'인 경우 passScheduledFilter는 true 유지

      return passScheduledFilter;
    });

    // activeMenu가 'todayTasks'가 아닌 경우 작업 유형 필터만 적용
    if (activeMenu !== 'todayTasks') {
      return filteredByType;
    }

    // 2. 날짜 필터링 (todayTasks인 경우만)
    const today = dayjs().startOf('day');

    return filteredByType.filter((task) => {
      // '전체' 선택 시 날짜 필터링 제외
      if (taskDateFilter === 'all') {
        return true;
      }

      let startDate;

      if (task.isScheduled) {
        // scheduled: task의 planStartDate 기준
        startDate = dayjs(task.planStartDate).startOf('day');
      } else {
        // ongoing: project의 startDate 또는 planStartDate 기준
        startDate = dayjs(
          task.project?.startDate || task.project?.planStartDate,
        ).startOf('day');
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
  }, [
    tasks,
    taskDateFilter,
    taskTypeFilter,
    activeMenu,
    activeWorkType,
    activeStatus,
  ]);

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
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">할 일 목록</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* WorkType(프로젝트 유형) 필터 버튼 */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { label: '전체', value: 'all' },
                {
                  label: WORK_TYPE.PROJECT.label,
                  value: WORK_TYPE.PROJECT.code,
                },
                { label: WORK_TYPE.TASK.label, value: WORK_TYPE.TASK.code },
                {
                  label: WORK_TYPE.MAINTENANCE.label,
                  value: WORK_TYPE.MAINTENANCE.code,
                },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActiveWorkType(type.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeWorkType === type.value
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Project Status(진행/검수) 필터 버튼 - 프로젝트 유형일 때만 활성화 */}
            <div className={`flex bg-gray-100 p-1 rounded-lg ${
              activeWorkType !== WORK_TYPE.PROJECT.code ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              {[
                { label: '전체', value: 'all' },
                { label: '진행중', value: 'inProgress' },
                { label: '검수중', value: 'reviewing' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setActiveStatus(status.value)}
                  disabled={activeWorkType !== WORK_TYPE.PROJECT.code}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeStatus === status.value
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  } ${activeWorkType !== WORK_TYPE.PROJECT.code ? 'cursor-not-allowed' : ''}`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* 일정(계획/상시) 필터 버튼 */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { label: '전체', value: 'all' },
                { label: '계획 업무', value: 'true' },
                { label: '상시 업무', value: 'false' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTaskTypeChange('isScheduled', opt.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    taskTypeFilter.isScheduled === opt.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 시점(오늘/예정) 필터 버튼 */}
            {activeMenu !== 'searchTasks' && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {[
                  { label: '전체', value: 'all' },
                  { label: '오늘 할 일', value: 'started' },
                  { label: '향후 예정', value: 'upcoming' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTaskDateFilter(opt.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      taskDateFilter === opt.value
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
              {tasks?.filter((t) => t.isScheduled === true).length || 0}
            </div>
            <div>
              일정 false:{' '}
              {tasks?.filter((t) => t.isScheduled === false).length || 0}
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
                selectedTypes.push(
                  `일정 ${taskTypeFilter.isScheduled === 'true' ? '있음' : '없음'}`,
                );
              }
              if (taskTypeFilter.isProgress !== 'all') {
                selectedTypes.push(
                  `진행률 ${taskTypeFilter.isProgress === 'true' ? '있음' : '없음'}`,
                );
              }

              if (selectedTypes.length === 0) {
                return '조건에 맞는 작업이 없습니다.';
              }

              const typeText = selectedTypes.join(', ');

              if (activeMenu === 'todayTasks') {
                if (taskDateFilter === 'all') {
                  return `${typeText} 조건의 작업이 없습니다.`;
                }
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
