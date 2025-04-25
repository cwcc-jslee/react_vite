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
 * @param {boolean} options.onlyMyTasks - 로그인한 사용자의 작업만 조회 (기본값: false)
 * @param {boolean} options.onlyActiveProjects - 진행중인 프로젝트 작업만 조회 (기본값: false)
 * @param {string} options.key - 강제 리로드를 위한 키
 * @returns {Object} tasks와 works 데이터 및 상태 정보
 */
const useTodoPageData = ({
  taskFilters = {},
  workFilters = {},
  loadOnMount = true,
  onlyMyTasks = false,
  onlyActiveProjects = false,
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
    onlyMyTasks,
    onlyActiveProjects,
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

  // 필터 설정 (API 호출에 사용할 형식으로 구성)
  const getTaskFilters = useMemo(() => {
    // 기본 필터 (삭제된 항목 제외)
    const filters = {
      $and: [
        {
          is_deleted: {
            $eq: false,
          },
        },
      ],
    };

    // 필터 조건이 있는 경우 2번째 $and 조건 추가
    const additionalConditions = {};

    // 진행중인 프로젝트 작업만 조회 (project.pjt_status.id = 88인 프로젝트)
    if (onlyActiveProjects) {
      additionalConditions.project = {
        pjt_status: {
          id: {
            $eq: 88,
          },
        },
      };
    }

    // 로그인한 사용자의 작업만 조회 (users.id = 현재 사용자 ID)
    if (onlyMyTasks && currentUser) {
      additionalConditions.users = {
        id: {
          $eq: currentUser.id,
        },
      };
    }

    // 추가 필터 조건이 있는 경우 $and 배열에 추가
    if (Object.keys(additionalConditions).length > 0) {
      filters.$and.push(additionalConditions);
    }

    // 사용자 지정 필터가 있으면 병합
    if (Object.keys(taskFilters).length > 0) {
      filters.$and.push(taskFilters);
    }

    return filters;
  }, [taskFilters, onlyMyTasks, onlyActiveProjects, currentUser]);

  // Redux 에러 상태 변경 감지
  useEffect(() => {
    if (tasksError || worksError) {
      hasError.current = true;
      setCustomError(tasksError || worksError);
    } else if (!isManualLoading) {
      hasError.current = false;
      setCustomError(null);
    }
  }, [tasksError, worksError, isManualLoading]);

  // 데이터 로드 함수
  const loadData = useCallback(
    async (isManual = false) => {
      // 에러가 있고 수동 요청이 아니면 로드하지 않음
      if (hasError.current && !isManual) {
        return;
      }

      try {
        if (isManual) {
          setIsManualLoading(true);
          setCustomError(null);
        }

        await Promise.all([
          dispatch(fetchTasks({ filters: getTaskFilters })),
          dispatch(fetchWorks({ filters: workFilters })),
        ]);

        if (isManual) {
          setIsManualLoading(false);
        }
      } catch (error) {
        setCustomError(error.message || '데이터 로드 중 오류가 발생했습니다');
        if (isManual) {
          setIsManualLoading(false);
        }
      }
    },
    [dispatch, getTaskFilters, workFilters],
  );

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    if (loadOnMount && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadData(false);
    }
  }, [loadOnMount]); // 빈 배열로 처리하여 최초 1회만 실행

  // 필터 변경 시 데이터 재로드
  useEffect(() => {
    // 초기 로드가 완료되었고, 에러가 없는 경우에만 필터 변경 시 데이터 재로드
    if (initialLoadDone.current && !hasError.current) {
      loadData(false);
    }
  }, [filterKey]); // filterKey가 변경될 때만 실행

  // 수동 데이터 새로고침 함수 (사용자가 명시적으로 호출할 때만 실행)
  const refreshData = useCallback(() => {
    // 에러 상태 리셋
    hasError.current = false;
    // 수동 로드 실행
    loadData(true);
  }, [loadData]);

  // 로딩 상태 통합
  const isLoading =
    tasksStatus === 'loading' || worksStatus === 'loading' || isManualLoading;

  // 에러 상태 통합
  const error = customError || tasksError || worksError;

  // 디버깅용 로그
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Task filters:', getTaskFilters);
    }
  }, [getTaskFilters]);

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
    refreshData,

    // 개별 데이터 로드 함수
    loadTasks: () => {
      refreshData();
    },

    loadWorks: () => {
      refreshData();
    },
  };
};

export default useTodoPageData;
