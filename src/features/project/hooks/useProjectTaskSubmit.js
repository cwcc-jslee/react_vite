/**
 * 프로젝트 태스크 제출 처리를 위한 커스텀 훅
 *
 * 주요 기능:
 * 1. 수정된 태스크 데이터 추출 및 처리
 * 2. 데이터 전처리 및 변환
 * 3. API 호출 및 응답 처리
 * 4. 에러 처리 및 복구
 */

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { notification } from '@shared/services/notification';
import { convertKeysToSnakeCase } from '@shared/utils/transformUtils';
import { projectTaskService } from '../services/projectTaskService';

export const useProjectTaskSubmit = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * 수정된 태스크 데이터 추출
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Array} 수정된 태스크 데이터 배열
   */
  const extractModifiedTasks = useCallback((buckets) => {
    if (!buckets || !Array.isArray(buckets)) return [];

    const modifiedTasks = [];
    buckets.forEach((bucket) => {
      if (bucket.tasks && Array.isArray(bucket.tasks)) {
        bucket.tasks.forEach((task) => {
          if (task.isModified) {
            modifiedTasks.push({
              ...task,
            });
          }
        });
      }
    });

    return modifiedTasks;
  }, []);

  /**
   * 태스크 데이터 전처리
   * @param {Object} task - 처리할 태스크 데이터
   * @returns {Object} 처리된 태스크 데이터
   */
  const prepareTaskData = useCallback((task) => {
    // 깊은 복사로 원본 데이터 유지
    const processedTask = JSON.parse(JSON.stringify(task));

    // documentId 분리 및 불필요한 필드 제거
    const {
      documentId, // API URL에서 사용할 documentId
      id,
      isModified,
      bucketId,
      bucketName,
      ...cleanTask
    } = processedTask;

    // users 필드 처리
    if (cleanTask.users && Array.isArray(cleanTask.users)) {
      cleanTask.users = cleanTask.users.map((user) => user.id);
    }

    // taskProgress 처리
    if (cleanTask.taskProgress && typeof cleanTask.taskProgress === 'object') {
      cleanTask.taskProgress = cleanTask.taskProgress.id;
    }

    // priorityLevel 처리
    if (
      cleanTask.priorityLevel &&
      typeof cleanTask.priorityLevel === 'object'
    ) {
      cleanTask.priorityLevel = cleanTask.priorityLevel.id;
    }

    // isScheduled가 false인 경우 관련 필드 제거
    if (!cleanTask.isScheduled) {
      delete cleanTask.planStartDate;
      delete cleanTask.planEndDate;
      delete cleanTask.planningTimeData;
    }

    return { documentId, data: cleanTask };
  }, []);

  /**
   * 태스크 업데이트 처리
   * @param {Array} buckets - 버킷 데이터 배열
   * @returns {Promise<Object>} 처리 결과
   */
  const handleTaskUpdate = useCallback(
    async (buckets) => {
      try {
        setIsSubmitting(true);
        setProgress(0);

        // 1. 수정된 태스크 추출
        const modifiedTasks = extractModifiedTasks(buckets);
        if (modifiedTasks.length === 0) {
          notification.info({
            message: '업데이트 알림',
            description: '수정된 태스크가 없습니다.',
          });
          return { success: true, updatedTasks: [] };
        }

        setProgress(20);

        // 2. 각 태스크 데이터 전처리
        const processedTasks = modifiedTasks.map(prepareTaskData);
        setProgress(40);

        // 3. API 호출을 위한 데이터 변환
        const snakeCaseTasks = processedTasks.map(({ documentId, data }) => ({
          documentId,
          ...convertKeysToSnakeCase(data),
        }));
        setProgress(60);

        // 4. API 호출 및 결과 처리
        const updatePromises = snakeCaseTasks.map(
          ({ documentId, ...taskData }) =>
            projectTaskService.updateTask(documentId, taskData),
        );

        const results = await Promise.all(updatePromises);
        setProgress(80);

        // 5. 성공 메시지 표시
        notification.success({
          message: '태스크 업데이트 성공',
          description: `${results.length}개의 태스크가 성공적으로 업데이트되었습니다.`,
        });

        setProgress(100);
        return { success: true, updatedTasks: results };
      } catch (error) {
        console.error('Task update error:', error);
        notification.error({
          message: '태스크 업데이트 실패',
          description:
            error.message || '태스크 업데이트 중 오류가 발생했습니다.',
        });
        return { success: false, error };
      } finally {
        setIsSubmitting(false);
        setProgress(0);
      }
    },
    [extractModifiedTasks, prepareTaskData],
  );

  return {
    isSubmitting,
    progress,
    handleTaskUpdate,
  };
};

export default useProjectTaskSubmit;
