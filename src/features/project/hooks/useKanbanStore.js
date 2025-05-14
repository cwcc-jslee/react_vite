// src/features/project/hooks/useKanbanStore.jsx
// 프로젝트 태스크와 버킷 데이터를 칸반 형식으로 변환하는 커스텀 훅
// 프로젝트 상세 데이터에서 태스크와 버킷을 추출하여 칸반 형식으로 가공합니다

import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setBuckets } from '../../../store/slices/projectBucketSlice';

/**
 * 프로젝트 태스크와 버킷 데이터를 칸반 형식으로 변환하는 커스텀 훅
 * @param {Array} projectTaskBuckets - 프로젝트 태스크 버킷 목록
 * @param {Array} projectTasks - 프로젝트 태스크 목록
 * @returns {Object} 칸반 데이터와 관련 함수
 */
const useKanbanStore = (projectTaskBuckets = [], projectTasks = []) => {
  const dispatch = useDispatch();

  // 칸반 데이터 변환 및 Redux 스토어에 저장
  const kanbanData = useMemo(() => {
    if (projectTaskBuckets.length === 0 && projectTasks.length === 0) {
      return [];
    }

    // 콘솔로그 출력 - 개발 중에만 사용
    console.log('프로젝트 태스크 버킷 원본 데이터:', projectTaskBuckets);
    console.log('프로젝트 태스크 원본 데이터:', projectTasks);

    // 변환된 칸반 데이터 생성
    const convertedBuckets = projectTaskBuckets.map((bucket, index) => {
      // 현재 버킷에 속한 태스크 필터링
      const bucketTasks = projectTasks
        .filter((task) => {
          // projectTaskBucket의 id나 documentId를 사용하여 매칭
          return (
            (task.projectTaskBucket?.id &&
              task.projectTaskBucket.id === bucket.id) ||
            (task.projectTaskBucket?.documentId &&
              task.projectTaskBucket.documentId === bucket.documentId)
          );
        })
        .map((task, taskIndex) => {
          // projectTaskBucket 키를 제외하고 필요한 속성만 추출
          const { projectTaskBucket, ...taskWithoutBucket } = task;

          return {
            ...taskWithoutBucket,
            position: taskIndex,
            // 기본 필드가 없는 경우 기본값 설정
            name: task.name || task.title || '무제',
            task_schedule_type: task.task_schedule_type || 'ongoing',
          };
        });

      return {
        bucket: bucket.name,
        id: bucket.id,
        documentId: bucket.documentId,
        position: bucket.position || index,
        tasks: bucketTasks,
      };
    });

    // 변환된 데이터 로그 출력
    console.log('변환된 칸반 데이터:', convertedBuckets);

    return convertedBuckets;
  }, [projectTaskBuckets, projectTasks]);

  // 변환된 데이터를 Redux 스토어에 저장하는 함수
  const saveToKanbanStore = () => {
    if (kanbanData.length > 0) {
      dispatch(setBuckets(kanbanData));
    }
  };

  return {
    kanbanData,
    saveToKanbanStore,
  };
};

export default useKanbanStore;
