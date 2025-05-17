/**
 * ToDo 페이지 관련 데이터를 가져오고 관리하는 커스텀 훅
 * tasks와 works 데이터를 한 번에 관리
 */

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../../store/slices/taskSlice';
import { fetchWorks } from '../../../store/slices/workSlice';

/**
 * Todo 페이지에 필요한 tasks와 works 데이터를 가져오는 커스텀 훅
 * @param {Object} options - 데이터 조회 옵션
 * @param {Object} options.taskFilters - task 데이터 필터링 옵션
 * @param {Object} options.workFilters - work 데이터 필터링 옵션
 * @param {boolean} options.loadOnMount - 컴포넌트 마운트 시 데이터 로드 여부 (기본값: true)
 * @param {string} options.key - 강제 리로드를 위한 키
 * @returns {Object} tasks와 works 데이터 및 상태 정보
 */
const useTodoPageData = ({
  taskFilters = {},
  workFilters = {},
  loadOnMount = true,
  key, // 강제 리로드를 위한 키
} = {}) => {
  const dispatch = useDispatch();

  // 데이터 로드 상태 관리
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [customError, setCustomError] = useState(null);
  const initialLoadDone = useRef(false);
  const hasError = useRef(false);

  // 필터 상태 변경 감지용 값
  const filterKey = JSON.stringify({
    taskFilters,
    workFilters,
    key,
  });

  // Redux 스토어에서 tasks 데이터 조회
  const {
    items: tasks,
    status: tasksStatus,
    error: tasksError,
    pagination: tasksPagination,
  } = useSelector((state) => state.task);

  // Redux 스토어에서 works 데이터 조회
  const {
    items: works,
    status: worksStatus,
    error: worksError,
    pagination: worksPagination,
  } = useSelector((state) => state.work);

  // 현재 로그인한 사용자 정보 조회
  const currentUser = useSelector((state) => state.auth.user?.user || null);

  // 로딩 상태 통합
  const isLoading =
    tasksStatus === 'loading' || worksStatus === 'loading' || isManualLoading;

  // 에러 상태 통합
  const error = customError || tasksError || worksError;

  return {
    // 원본 데이터
    tasks,
    works,

    // 상태 정보
    isLoading,
    error,
    tasksStatus,
    worksStatus,

    // 페이지네이션
    tasksPagination,
    worksPagination,

    // 액션 함수
    // refreshData,

    // 개별 데이터 로드 함수
    // loadTasks: () => {
    //   refreshData();
    // },

    // loadWorks: () => {
    //   refreshData();
    // },
  };
};

export default useTodoPageData;
