import React, { useState, useCallback } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPageData from '../hooks/useTodoPageData';
import { Button, Switch, Alert } from '@shared/components/ui';
import dayjs from 'dayjs';

/**
 * ToDo 카드 목록 섹션 컴포넌트
 * ToDo 목록 표시 및 필터링 담당
 */
const TodoSection = ({ onTaskAction, selectedTaskId }) => {
  // 필터 상태 관리
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(true);
  const [taskDateFilter, setTaskDateFilter] = useState('started');
  const [retryCount, setRetryCount] = useState(0);

  // 커스텀 훅을 사용하여 데이터 로드
  const { tasks, isLoading, error, refreshData } = useTodoPageData({
    key: retryCount,
  });

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (newMyTasks, newDateFilter) => {
      if (error) {
        setRetryCount((prevCount) => prevCount + 1);
      }
    },
    [error],
  );

  // 수동 새로고침 핸들러
  const handleManualRefresh = useCallback(() => {
    setRetryCount((prevCount) => prevCount + 1);
    refreshData();
  }, [refreshData]);

  // 필터 토글 핸들러
  const toggleMyTasks = useCallback(
    (checked) => {
      setShowOnlyMyTasks(checked);
      handleFilterChange(checked, taskDateFilter);
    },
    [taskDateFilter, handleFilterChange],
  );

  // 날짜 필터 토글 핸들러
  const toggleTaskDateFilter = useCallback(() => {
    const newFilter = taskDateFilter === 'started' ? 'upcoming' : 'started';
    setTaskDateFilter(newFilter);
    handleFilterChange(showOnlyMyTasks, newFilter);
  }, [taskDateFilter, showOnlyMyTasks, handleFilterChange]);

  // 필터링된 작업 목록
  const filteredTasks = useCallback(() => {
    if (!tasks) return [];

    const today = dayjs().startOf('day');

    return tasks.filter((task) => {
      const planStartDate = dayjs(task.planStartDate).startOf('day');

      if (taskDateFilter === 'started') {
        return planStartDate.isBefore(today) || planStartDate.isSame(today);
      } else {
        return planStartDate.isAfter(today);
      }
    });
  }, [tasks, taskDateFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">할 일 목록</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Switch
              checked={taskDateFilter === 'started'}
              onChange={toggleTaskDateFilter}
              className="mr-2"
              disabled={isLoading}
            />
            <span className="text-sm">
              {taskDateFilter === 'started' ? '시작됨' : '작업예정'}
            </span>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="primary"
            size="sm"
            className="!py-1 !h-8"
            disabled={isLoading}
          >
            새로고침
          </Button>
        </div>
      </div>

      {/* 디버깅 정보 */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-2 bg-gray-100 text-xs">
          <div>총 작업: {tasks?.length || 0}</div>
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <Alert variant="error" className="mb-4">
          <p className="font-bold">데이터 로드 오류</p>
          <p>{error}</p>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isLoading}
          >
            다시 시도
          </Button>
        </Alert>
      )}

      {/* 로딩 표시 */}
      {isLoading && !error && (
        <div className="text-center py-4">데이터를 불러오는 중...</div>
      )}

      {/* 작업 목록 표시 */}
      {!isLoading && !error && filteredTasks().length > 0 ? (
        <div>
          {filteredTasks().map((task) => (
            <TodoCard
              key={task.id}
              task={task}
              onAction={onTaskAction}
              isSelected={selectedTaskId === task.id}
            />
          ))}
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          {taskDateFilter === 'started'
            ? '시작된 작업이 없습니다.'
            : '예정된 작업이 없습니다.'}
        </div>
      ) : null}
    </div>
  );
};

export default TodoSection;
