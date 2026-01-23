/**
 * 프로젝트 수정을 위한 커스텀 훅
 *
 * 주요 기능:
 * - 프로젝트 필드 수정 (현재는 pjtStatus만 지원, 향후 확장 가능)
 * - 수정 상태 관리 (isSubmitting, error)
 * - 폼 데이터 관리
 * - 상태 변경 가능 범위 관리
 *
 * 사용 예시:
 * const { formData, isSubmitting, error, handleSubmit, availableStatuses, handleCancel } = useProjectUpdate(initialData, codebooks);
 */

import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { projectApiService } from '../services/projectApiService';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import { useProjectStore } from './useProjectStore';
import { PROJECT_STATUS_TRANSITIONS } from '../constants/projectStatusConstants';
import { determineStatusChangeType } from '../constants/statusChangeTypeConstants';
import dayjs from 'dayjs';

export const useProjectUpdate = (initialData) => {
  const { data: codebooks } = useCodebook(['pjtStatus', 'pjtClosureType']);
  const { selectedItem } = useProjectStore();
  const currentUser = useSelector((state) => state.auth.user); // 현재 로그인 사용자

  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  console.log(`>>>> initialData`, initialData);

  // 현재 상태에 따른 변경 가능한 상태 목록 (상수 사용)
  const availableStatuses = useMemo(() => {
    if (!codebooks?.pjtStatus || !initialData.pjtStatus) return [];

    const currentStatus = initialData.pjtStatus.name;
    const allStatuses = [...codebooks.pjtStatus].sort(
      (a, b) => a.sort - b.sort,
    );

    // 전환 가능한 상태 목록 가져오기
    const transitionableStatuses = PROJECT_STATUS_TRANSITIONS[currentStatus] || [];

    // 현재 상태를 포함한 변경 가능한 상태 목록 반환
    return allStatuses.filter(
      (status) =>
        status.name === currentStatus ||
        transitionableStatuses.includes(status.name),
    );
  }, [codebooks?.pjtStatus, initialData.pjtStatus]);

  const validateProjectTasks = useCallback(
    (nextStatus) => {
      const projectTasks = selectedItem?.data?.projectTasks || [];

      // 중간검수 또는 고객검수 상태일 때 검증
      // - isProgress가 true인 TASK는 isCompleted가 true여야 함
      // - isProgress가 false인 TASK는 검증 통과
      if (nextStatus === '중간검수' || nextStatus === '고객검수') {
        const hasIncompleteTasks = projectTasks.some(
          (task) => task.isProgress === true && task.isCompleted !== true,
        );

        if (hasIncompleteTasks) {
          throw new Error(
            '진행 중인 모든 태스크가 완료되어야 검수 상태로 변경할 수 있습니다.',
          );
        }
      }
    },
    [selectedItem?.data?.projectTasks],
  );

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // const id = initialData.documentId;
      console.log(`>>>> formData id`, formData);

      try {
        setIsSubmitting(true);
        setError(null);

        // 상태 변경 시 테스트 완료 여부 검증
        validateProjectTasks(formData.pjtStatus.name);

        // 불필요 필드 제거 및 데이터 정리
        const { id, documentId, pjtClosureType, closureDate, statusDetail, changeDescription, ...restData } = formData;
        console.log(`>>>> restData`, restData);

        // 상태 변경 이력 생성 (상태가 변경된 경우에만)
        let createdStatusChange = null;
        if (formData.pjtStatus?.id !== initialData.pjtStatus?.id) {
          try {
            const statusChangeData = {
              project: id,
              name: determineStatusChangeType(initialData.pjtStatus.name, formData.pjtStatus.name), // 상태 변경 유형
              fromStatus: initialData.pjtStatus.id,
              toStatus: formData.pjtStatus.id,
              statusDetail: statusDetail || null,
              requestedBy: currentUser?.user?.id || null,
              requestedAt: dayjs().toISOString(),
              changeDescription: changeDescription || null,
              approvalStatus: 'pending', // 승인 대기 상태
            };

            createdStatusChange = await projectApiService.createProjectStatusChange(statusChangeData);
            console.log('상태 변경 이력 생성 완료:', createdStatusChange);
          } catch (statusChangeError) {
            // 상태 변경 이력 생성 실패 시 전체 프로세스 중단
            console.error('상태 변경 이력 생성 실패:', statusChangeError);
            throw new Error('상태 변경 이력 생성 중 오류가 발생했습니다.');
          }
        }

        // 프로젝트에 승인 대기 상태만 설정 (실제 상태는 변경하지 않음)
        const approvalUpdateData = {
          currentApprovalStatus: 'pending',
        };

        console.log(`>>>> approvalUpdateData`, approvalUpdateData);

        // 프로젝트 승인 상태 업데이트
        await projectApiService.updateProject(
          documentId,
          approvalUpdateData,
        );

        return {
          success: true,
          error: null,
        };
      } catch (err) {
        setError(err.message);
        return {
          success: false,
          error: {
            message: err.message || '프로젝트 업데이트 중 오류가 발생했습니다.',
            code: 'UPDATE_ERROR',
            details: { error: err },
          },
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateProjectTasks, initialData],
  );

  const handleCancel = useCallback(() => {
    setFormData(initialData);
    setError(null);
  }, [initialData]);

  return {
    formData,
    isSubmitting,
    error,
    codebooks,
    updateField,
    handleSubmit,
    handleCancel,
    availableStatuses,
  };
};
