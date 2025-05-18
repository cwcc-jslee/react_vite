/**
 * Todo 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/todo/context/TodoContext.jsx
 */
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { useProjectTaskStore } from '../../project/hooks/useProjectTaskStore';
import { useTodoStore } from '../hooks/useTodoStore';
import { useTodoFilterAction } from '../hooks/useTodoFilterAction';
import { useWorkFilterActions } from '../hooks/useWorkFilterActions';
const TodoContext = createContext(null);
const todoReducer = (state, action) => {
  // switch (action.type) {
};

/**
 * 프로젝트 Context Hook
 */
export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};

/**
 * Todo Provider 컴포넌트
 */
export const TodoProvider = ({ children }) => {
  // 현재 로그인한 사용자 정보 조회
  const currentUser = useSelector((state) => state.auth.user?.user || null);
  const { actions: taskActions } = useProjectTaskStore();
  const { actions } = useTodoStore();
  const { actions: filterActions } = useTodoFilterAction();
  const { actions: workFilterActions } = useWorkFilterActions();
  // Provider 마운트시 자동으로 데이터 로드
  useEffect(() => {
    // 초기 필터 설정 및 Todo 목록 조회
    filterActions.user.set(currentUser?.id, true);

    // 초기 필터 설정 및 Work 목록 조회
    workFilterActions.setUserAndDateRange(currentUser?.id, 30, true);
    // workFilterActions.date.setRange(30, false);
    // workFilterActions.user.set(currentUser?.id, false);

    // cleanup 함수: 컴포넌트 언마운트 시 taskSlice 초기화
    return () => {
      taskActions.resetState();
    };
  }, [currentUser?.id]); // currentUser.id가 변경될 때마다 필터 재설정

  // 컨텍스트 값 정의
  const value = {
    // fetchTasksData,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
