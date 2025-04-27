/**
 * Todo 컨텍스트 및 Provider 컴포넌트
 * @date 25.04.09
 * @version 1.0.0
 * @filename src/features/todo/context/TodoContext.jsx
 */
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '@shared/api/apiService';
import { fetchTasks } from '../../../store/slices/taskSlice';
import { fetchWorks } from '../../../store/slices/workSlice';
import dayjs from 'dayjs';

const TodoContext = createContext(null);
const todoReducer = (state, action) => {
  // switch (action.type) {
  //   case 'FETCH_START':
  //     return { ...state, loading: true, error: null };
  //   case 'FETCH_SUCCESS':
  //     return {
  //       ...state,
  //       loading: false,
  //       todoStatus: action.payload.todoStatus,
  //       monthlyStats: action.payload.monthlyStats,
  //     };
  //   case 'FETCH_ERROR':
  //     return { ...state, loading: false, error: action.payload };
  //   case 'FETCH_PROGRESS_START':
  //     return {
  //       ...state,
  //       loadingProgress: true,
  //       errorProgress: null,
  //     };
  //   case 'FETCH_PROGRESS_SUCCESS':
  //     return {
  //       ...state,
  //       todoProgress: action.payload,
  //       loadingProgress: false,
  //     };
  //   case 'FETCH_PROGRESS_ERROR':
  //     return {
  //       ...state,
  //       errorProgress: action.payload,
  //       loadingProgress: false,
  //     };
  //   default:
  //     return state;
  // }
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
  const dispatch = useDispatch();
  // 현재 로그인한 사용자 정보 조회
  const currentUser = useSelector((state) => state.auth.user?.user || null);

  // 데이터 상태
  const [state, dispatchTodo] = useReducer(todoReducer, {
    loading: false,
    error: null,
    todoStatus: [],
    monthlyStats: [],
    todoProgress: [],
    loadingProgress: false,
    errorProgress: null,
  });

  // 필터 설정 (API 호출에 사용할 형식으로 구성)
  const getTaskFilters = () => {
    // 기본 필터 구조 설정
    const filters = {
      $and: [],
    };

    // 필터 조건이 있는 경우 $and 조건 추가
    const additionalConditions = {};

    // 진행중인 프로젝트 작업만 조회 (project.pjt_status.id = 88인 프로젝트)
    additionalConditions.project = {
      pjt_status: {
        id: {
          $eq: 88,
        },
      },
    };

    // 로그인한 사용자의 작업만 조회 (users.id = 현재 사용자 ID)
    if (currentUser) {
      additionalConditions.users = {
        id: {
          $eq: currentUser.id,
        },
      };
    }

    // task_schedule_type 조건 설정
    const today = dayjs().format('YYYY-MM-DD');

    // 날짜 필터링 조건
    // const taskTypeCondition = {
    //   $or: [
    //     // 'scheduled' 타입은 오늘 날짜 이전의 데이터만
    //     {
    //       $and: [
    //         { task_schedule_type: { $eq: 'scheduled' } },
    //         { plan_start_date: { $lt: today } },
    //       ],
    //     },
    //     // 'ongoing' 타입은 날짜 상관없이 모두 가져옴
    //     { task_schedule_type: { $eq: 'ongoing' } },
    //   ],
    // };
    // 날짜 필터링 조건
    const taskTypeCondition = {
      $and: [
        { task_schedule_type: { $eq: 'scheduled' } },
        { plan_start_date: { $lt: today } },
      ],
    };

    // 추가 필터 조건이 있는 경우 $and 배열에 추가
    if (Object.keys(additionalConditions).length > 0) {
      filters.$and.push(additionalConditions);
    }

    // task_schedule_type 조건 추가
    filters.$and.push(taskTypeCondition);

    // 사용자 지정 필터가 있으면 병합
    // if (Object.keys(taskFilters).length > 0) {
    //   filters.$and.push(taskFilters);
    // }

    return filters;
  };

  const fetchTasksData = async () => {
    try {
      const taskFilters = getTaskFilters();
      dispatch(fetchTasks({ filters: taskFilters }));
    } catch (error) {
      console.error('Task 데이터 로드 오류:', error);
    }
  };

  const fetchWorkData = async () => {
    try {
      dispatch(fetchWorks());
    } catch (error) {
      console.error('Work 데이터 로드 오류:', error);
    }
  };

  // Provider 마운트시 자동으로 데이터 로드
  useEffect(() => {
    fetchTasksData();
    fetchWorkData();
  }, []);

  // 컨텍스트 값 정의
  const value = {
    ...state,
    // fetchTasksData,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
