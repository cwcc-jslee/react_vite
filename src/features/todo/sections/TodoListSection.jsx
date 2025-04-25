// src/features/project/sections/ProjectListSection.jsx

import React, { useState, useCallback, useEffect } from 'react';
import TodoCard from '../components/cards/TodoCard';
import useTodoPageData from '../hooks/useTodoPageData';
import { Button, Switch, Alert } from '@shared/components/ui';

/**
 * ToDo 목록 테이블 섹션 컴포넌트
 * ToDo 목록과 페이지네이션을 표시
 */
const TodoListSection = () => {
  // 필터 상태 관리
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(true);
  const [showOnlyActiveProjects, setShowOnlyActiveProjects] = useState(true);
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수 추적

  // 커스텀 훅을 사용하여 데이터 로드
  const { tasks, isLoading, error, refreshData } = useTodoPageData({
    onlyMyTasks: showOnlyMyTasks,
    onlyActiveProjects: showOnlyActiveProjects,
    key: retryCount, // 재시도 카운트를 키로 사용
  });

  // 디버깅 로그
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('TodoListSection 렌더링');
      console.log('tasks 길이:', tasks?.length);
    }
  }, [tasks]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (newMyTasks, newActiveProjects) => {
      if (error) {
        // 에러 상태에서 필터 변경 시 수동으로 데이터 새로고침
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
      handleFilterChange(checked, showOnlyActiveProjects);
    },
    [showOnlyActiveProjects, handleFilterChange],
  );

  const toggleActiveProjects = useCallback(
    (checked) => {
      setShowOnlyActiveProjects(checked);
      handleFilterChange(showOnlyMyTasks, checked);
    },
    [showOnlyMyTasks, handleFilterChange],
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">할 일 목록</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Switch
              checked={showOnlyMyTasks}
              onChange={toggleMyTasks}
              className="mr-2"
              disabled={isLoading}
            />
            <span className="text-sm">내 작업만 보기</span>
          </div>
          <div className="flex items-center">
            <Switch
              checked={showOnlyActiveProjects}
              onChange={toggleActiveProjects}
              className="mr-2"
              disabled={isLoading}
            />
            <span className="text-sm">진행 중인 프로젝트만</span>
          </div>
          <Button
            onClick={handleManualRefresh}
            type="primary"
            size="small"
            loading={isLoading}
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
          {/* <div>필터링된 작업: {filteredTasks?.length || 0}</div> */}
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <Alert
          message="데이터 로드 오류"
          description={error}
          type="error"
          showIcon
          className="mb-4"
          action={
            <Button
              size="small"
              onClick={handleManualRefresh}
              loading={isLoading}
              disabled={isLoading}
            >
              다시 시도
            </Button>
          }
        />
      )}

      {/* 로딩 표시 */}
      {isLoading && !error && (
        <div className="text-center py-4">데이터를 불러오는 중...</div>
      )}

      {/* 데이터 표시 */}
      {!isLoading && (
        <div className="mt-4">
          {!error && tasks.length > 0 ? (
            tasks.map((task) => <TodoCard key={task.id} task={task} />)
          ) : !error ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              {showOnlyMyTasks && showOnlyActiveProjects
                ? '진행 중인 프로젝트에 배정된 작업이 없습니다.'
                : showOnlyMyTasks
                ? '배정된 작업이 없습니다.'
                : '등록된 할일이 없습니다.'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TodoListSection;
