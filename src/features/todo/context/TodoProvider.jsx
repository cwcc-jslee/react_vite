/**
 * Todo 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/todo/context/TodoContext.jsx
 */
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { apiService } from '@shared/api/apiService';

const TodoContext = createContext(null);
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        todoStatus: action.payload.todoStatus,
        monthlyStats: action.payload.monthlyStats,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_PROGRESS_START':
      return {
        ...state,
        loadingProgress: true,
        errorProgress: null,
      };
    case 'FETCH_PROGRESS_SUCCESS':
      return {
        ...state,
        todoProgress: action.payload,
        loadingProgress: false,
      };
    case 'FETCH_PROGRESS_ERROR':
      return {
        ...state,
        errorProgress: action.payload,
        loadingProgress: false,
      };
    default:
      return state;
  }
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
  // 데이터 상태

  // 컨텍스트 값 정의
  const value = {
    //
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
