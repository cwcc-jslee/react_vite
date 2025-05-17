// src/features/todo/layouts/TodoLayout.jsx

import React, { useState, useEffect } from 'react';
import TodoSection from '../sections/TodoSection';
import TodoSearchForm from '../components/forms/TodoSearchForm';
import { useTodoStore } from '../hooks/useTodoStore';
import { useUiStore } from '@shared/hooks/useUiStore';
import { Spinner, Message } from '@shared/components/ui';

/**
 * Todo 레이아웃 컴포넌트
 * TaskSection에 필요한 데이터를 로드하고 전달
 */
const TodoLayout = () => {
  // 데이터 로딩 관련 상태
  const { items: tasks, isLoading: isDataLoading, error } = useTodoStore();
  const { pageLayout } = useUiStore();
  const activeMenu = pageLayout.menu;

  // activeMenu에 따른 작업 목록 상태 관리
  const [displayTasks, setDisplayTasks] = useState([]);

  // activeMenu 변경 시 작업 목록 업데이트
  useEffect(() => {
    if (activeMenu === 'searchTasks') {
      setDisplayTasks([]); // 검색 메뉴일 경우 빈 배열로 설정
    } else {
      setDisplayTasks(tasks); // 기본 메뉴일 경우 전체 작업 목록 표시
    }
  }, [activeMenu, tasks]);

  // 로딩 중일 때 표시할 컴포넌트
  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Spinner size="large" color="#1890ff" />
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때 표시할 컴포넌트
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Message type="error" className="max-w-md">
          데이터를 불러오는데 실패했습니다: {error}
        </Message>
      </div>
    );
  }

  // 데이터가 준비되었을 때만 TodoSection 렌더링
  return (
    <div className="mt-4">
      {activeMenu === 'searchTasks' && (
        <TodoSearchForm onSearchResult={setDisplayTasks} />
      )}
      <TodoSection tasks={displayTasks} activeMenu={activeMenu} />
    </div>
  );
};

export default TodoLayout;
