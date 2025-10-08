/**
 * 프로젝트 TASK 업데이트를 위한 커스텀 훅
 *
 * 주요 기능:
 * - TASK 완료 처리 (is_completed, end_date, task_progress)
 * - TASK 필드 개별 업데이트
 * - 제출 상태 관리 (isUpdating, error)
 * - 성공/실패 알림 처리
 * - 프로젝트 데이터 리프레시
 *
 * 사용 예시:
 * const { isUpdating, completeTask, updateTaskField } = useProjectTaskUpdate();
 * await completeTask(documentId, completionDate, taskName);
 */

import { useState, useCallback } from 'react';
import { projectTaskService } from '../services/projectTaskService';
import { notification } from '@shared/services/notification';
import { useProjectStore } from './useProjectStore';

export const useProjectTaskUpdate = () => {
  const { actions, selectedItem } = useProjectStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 현재 선택된 프로젝트 ID 가져오기
   * @returns {string|number|null} 프로젝트 ID
   */
  const getCurrentProjectId = useCallback(() => {
    return selectedItem?.data?.id || null;
  }, [selectedItem]);

  /**
   * TASK 완료 처리
   * @param {string|number} documentId - 완료 처리할 TASK documentId
   * @param {string} completionDate - 완료일 (YYYY-MM-DD)
   * @param {string} taskName - TASK 이름 (알림용, 선택)
   * @returns {Promise<Object>} { success: boolean, data?: Object, error?: Error }
   */
  const completeTask = useCallback(
    async (documentId, completionDate, taskName = '') => {
      setIsUpdating(true);
      setError(null);

      try {
        // 1. API 호출로 TASK 완료 처리
        const result = await projectTaskService.updateTask(documentId, {
          is_completed: true,
          end_date: completionDate,
          task_progress: 97, // 코드북 ID 97 = 100%
        });

        // 2. 성공 알림
        notification.success({
          message: 'TASK 완료 처리 성공',
          description: taskName
            ? `"${taskName}" 작업이 완료되었습니다.`
            : 'TASK가 완료되었습니다.',
        });

        // 3. 프로젝트 상세 데이터 리프레시
        const currentProjectId = getCurrentProjectId();
        if (currentProjectId) {
          await actions.detail.fetchDetail(currentProjectId);
        }

        return { success: true, data: result };
      } catch (err) {
        console.error('Task completion error:', err);
        setError(err);

        notification.error({
          message: 'TASK 완료 처리 실패',
          description: err.message || '완료 처리 중 오류가 발생했습니다.',
        });

        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [actions, getCurrentProjectId],
  );

  /**
   * TASK 완료 취소 (이미 완료된 TASK를 미완료로 되돌림)
   * @param {string|number} documentId - TASK documentId
   * @param {string} taskName - TASK 이름 (선택)
   * @returns {Promise<Object>} { success: boolean, data?: Object, error?: Error }
   */
  const uncompleteTask = useCallback(
    async (documentId, taskName = '') => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await projectTaskService.updateTask(documentId, {
          is_completed: false,
          end_date: null,
        });

        notification.success({
          message: 'TASK 완료 취소 성공',
          description: taskName
            ? `"${taskName}" 작업이 미완료 상태로 변경되었습니다.`
            : 'TASK가 미완료 상태로 변경되었습니다.',
        });

        const currentProjectId = getCurrentProjectId();
        if (currentProjectId) {
          await actions.detail.fetchDetail(currentProjectId);
        }

        return { success: true, data: result };
      } catch (err) {
        console.error('Task uncompletion error:', err);
        setError(err);

        notification.error({
          message: 'TASK 완료 취소 실패',
          description: err.message || '완료 취소 중 오류가 발생했습니다.',
        });

        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [actions, getCurrentProjectId],
  );

  /**
   * TASK 개별 필드 업데이트
   * @param {string|number} documentId - TASK documentId
   * @param {Object} updateData - 업데이트할 필드 데이터 (snake_case)
   * @param {string} successMessage - 성공 메시지 (선택)
   * @returns {Promise<Object>} { success: boolean, data?: Object, error?: Error }
   */
  const updateTaskField = useCallback(
    async (documentId, updateData, successMessage = 'TASK가 업데이트되었습니다.') => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await projectTaskService.updateTask(documentId, updateData);

        notification.success({
          message: 'TASK 업데이트 성공',
          description: successMessage,
        });

        const currentProjectId = getCurrentProjectId();
        if (currentProjectId) {
          await actions.detail.fetchDetail(currentProjectId);
        }

        return { success: true, data: result };
      } catch (err) {
        console.error('Task update error:', err);
        setError(err);

        notification.error({
          message: 'TASK 업데이트 실패',
          description: err.message || 'TASK 업데이트 중 오류가 발생했습니다.',
        });

        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [actions, getCurrentProjectId],
  );

  /**
   * 여러 TASK 일괄 업데이트
   * @param {Array<Object>} tasks - 업데이트할 TASK 배열 [{ documentId, updateData }, ...]
   * @returns {Promise<Object>} { success: boolean, results?: Array, error?: Error }
   */
  const updateMultipleTasks = useCallback(
    async (tasks) => {
      setIsUpdating(true);
      setError(null);

      try {
        const updatePromises = tasks.map(({ documentId, updateData }) =>
          projectTaskService.updateTask(documentId, updateData),
        );

        const results = await Promise.all(updatePromises);

        notification.success({
          message: '일괄 업데이트 성공',
          description: `${results.length}개의 TASK가 업데이트되었습니다.`,
        });

        const currentProjectId = getCurrentProjectId();
        if (currentProjectId) {
          await actions.detail.fetchDetail(currentProjectId);
        }

        return { success: true, results };
      } catch (err) {
        console.error('Multiple tasks update error:', err);
        setError(err);

        notification.error({
          message: '일괄 업데이트 실패',
          description: err.message || '일괄 업데이트 중 오류가 발생했습니다.',
        });

        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [actions, getCurrentProjectId],
  );

  return {
    // 상태
    isUpdating,
    error,

    // 완료 처리 함수
    completeTask,
    uncompleteTask,

    // 일반 업데이트 함수
    updateTaskField,
    updateMultipleTasks,
  };
};

export default useProjectTaskUpdate;
