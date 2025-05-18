/**
 * @file useProjectBucketStore.js
 * @description 프로젝트 버킷(칸반 보드) 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. 버킷(컬럼) 및 태스크 CRUD 관리
 * 2. 편집 상태 관리
 * 3. 에러 및 로딩 상태 관리
 */

import { useSelector, useDispatch } from 'react-redux';
import {
  setBuckets,
  startEditing,
  startEditingColumnTitle,
  handleEditChange,
  saveEdit,
  cancelEdit,
  addColumn,
  deleteColumn,
  moveColumn,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  toggleCompletedSection,
  resetKanban,
} from '../../../store/slices/projectBucketSlice';

/**
 * 프로젝트 버킷 관련 상태와 액션을 관리하는 커스텀 훅
 * 칸반 보드의 버킷과 태스크를 통합 관리
 */
export const useProjectBucketStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const buckets = useSelector((state) => state.projectBucket.buckets);
  const editState = useSelector((state) => state.projectBucket.editState);
  const completedExpanded = useSelector(
    (state) => state.projectBucket.completedExpanded,
  );
  const status = useSelector((state) => state.projectBucket.status);
  const error = useSelector((state) => state.projectBucket.error);

  // 액션 핸들러
  const actions = {
    // 버킷 관리
    bucket: {
      setBuckets: (buckets) => {
        dispatch(setBuckets(buckets));
      },
      addColumn: (column) => {
        dispatch(addColumn(column));
      },
      deleteColumn: (bucketIndex) => {
        dispatch(deleteColumn(bucketIndex));
      },
      moveColumn: (bucketIndex, direction) => {
        dispatch(moveColumn({ bucketIndex, direction }));
      },
      // 프로젝트 태스크 데이터를 칸반 보드에 동기화
      syncProjectTasksToKanban: (projectTaskBuckets, projectTasks) => {
        // 버킷 데이터 변환 및 정렬
        const sortedBuckets = [...projectTaskBuckets].sort(
          (a, b) => a.position - b.position,
        );

        // 각 버킷에 해당하는 태스크 매핑
        const bucketsWithTasks = sortedBuckets.map((bucket) => ({
          ...bucket,
          tasks: projectTasks
            .filter((task) => task.projectTaskBucket?.id === bucket.id)
            .sort((a, b) => a.position - b.position),
        }));

        // 변환된 데이터를 스토어에 저장
        dispatch(setBuckets(bucketsWithTasks));
      },
      resetKanbanBoard: () => {
        dispatch(resetKanban());
      },
    },

    // 편집 상태 관리
    edit: {
      startEditing: (bucketIndex, taskIndex, field, value) => {
        dispatch(startEditing({ bucketIndex, taskIndex, field, value }));
      },
      startEditingColumnTitle: (bucketIndex) => {
        dispatch(startEditingColumnTitle(bucketIndex));
      },
      handleEditChange: (value) => {
        dispatch(handleEditChange(value));
      },
      saveEdit: () => {
        dispatch(saveEdit());
      },
      cancelEdit: () => {
        dispatch(cancelEdit());
      },
    },

    // 태스크 관리
    task: {
      addTask: (bucketIndex, task) => {
        dispatch(addTask({ bucketIndex, task }));
      },
      updateTask: (bucketIndex, taskIndex, updatedTask) => {
        dispatch(updateTask({ bucketIndex, taskIndex, updatedTask }));
      },
      deleteTask: (bucketIndex, taskIndex) => {
        dispatch(deleteTask({ bucketIndex, taskIndex }));
      },
      toggleCompletion: (bucketIndex, taskIndex) => {
        dispatch(toggleTaskCompletion({ bucketIndex, taskIndex }));
      },
    },

    // UI 상태 관리
    ui: {
      toggleCompletedSection: () => {
        dispatch(toggleCompletedSection());
      },
      resetKanban: () => {
        dispatch(resetKanban());
      },
    },
  };

  // 유틸리티 함수들
  const utils = {
    // 버킷 ID로 버킷 인덱스 찾기
    findBucketIndexById: (bucketId) => {
      return buckets.findIndex((bucket) => bucket.id === bucketId);
    },

    // 태스크 ID로 버킷 및 태스크 인덱스 찾기
    findTaskIndexById: (taskId) => {
      for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
        const taskIndex = buckets[bucketIndex].tasks.findIndex(
          (task) => task.id === taskId,
        );
        if (taskIndex !== -1) {
          return { bucketIndex, taskIndex };
        }
      }
      return { bucketIndex: -1, taskIndex: -1 };
    },

    // 특정 상태의 태스크 필터링
    filterTasksByStatus: (statusValue) => {
      return buckets.reduce((filtered, bucket) => {
        const tasksWithStatus = bucket.tasks.filter(
          (task) => task.pjtProgress === statusValue,
        );
        return [...filtered, ...tasksWithStatus];
      }, []);
    },

    // 드래그 앤 드롭 - 태스크 이동 유틸리티
    moveTask: (sourceBucketIndex, sourceTaskIndex, targetBucketIndex) => {
      if (
        sourceBucketIndex >= 0 &&
        sourceBucketIndex < buckets.length &&
        sourceTaskIndex >= 0 &&
        sourceTaskIndex < buckets[sourceBucketIndex].tasks.length &&
        targetBucketIndex >= 0 &&
        targetBucketIndex < buckets.length
      ) {
        // 원본 태스크 추출
        const task = { ...buckets[sourceBucketIndex].tasks[sourceTaskIndex] };

        // 태스크 삭제 후 타겟에 추가
        dispatch(
          deleteTask({
            bucketIndex: sourceBucketIndex,
            taskIndex: sourceTaskIndex,
          }),
        );
        dispatch(addTask({ bucketIndex: targetBucketIndex, task }));

        return true;
      }
      return false;
    },
  };

  return {
    // 상태
    buckets,
    editState,
    completedExpanded,
    status,
    error,

    // 액션
    actions,

    // 유틸리티
    utils,
  };
};

export default useProjectBucketStore;
