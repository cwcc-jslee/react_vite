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
import { projectApiService } from '../services/projectApiService';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import { processRelationFields } from '../../../shared/utils/relationFieldUtils';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
import { useProjectStore } from './useProjectStore';

export const useProjectUpdate = (initialData) => {
  const { data: codebooks } = useCodebook(['pjtStatus']);
  const { selectedItem } = useProjectStore();

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

  // 현재 상태에 따른 변경 가능한 상태 목록
  const availableStatuses = useMemo(() => {
    if (!codebooks?.pjtStatus || !initialData.pjtStatus) return [];

    const currentStatus = initialData.pjtStatus.name;
    const allStatuses = [...codebooks.pjtStatus].sort(
      (a, b) => a.sort - b.sort,
    );

    // 현재 상태를 포함한 변경 가능한 상태 목록
    const getAvailableStatuses = (statusList) => {
      return allStatuses.filter(
        (status) =>
          status.name === currentStatus || statusList.includes(status.name),
      );
    };

    switch (currentStatus) {
      case '진행중':
        return getAvailableStatuses(['보류', '대기', '검수', '종료']);
      case '시작전':
        return getAvailableStatuses(['진행중', '대기', '보류']);
      case '검수':
        return getAvailableStatuses(['진행중', '종료']);
      case '종료':
        return [allStatuses.find((status) => status.name === currentStatus)];
      case '보류':
      case '대기':
        return getAvailableStatuses(['진행중']);
      default:
        return [];
    }
  }, [codebooks?.pjtStatus, initialData.pjtStatus]);

  /**
   * 폼 데이터 정리 함수
   * 불필요한 필드(id, documentId) 제거
   *
   * @param {Object} formData - 정리할 폼 데이터
   * @returns {Object} 정리된 폼 데이터
   */
  const cleanFormData = (formData) => {
    // 깊은 복사로 원본 데이터 유지
    const cleanedData = JSON.parse(JSON.stringify(formData));

    // id와 documentId 필드 제거
    const { id, documentId, ...restData } = cleanedData;

    return restData;
  };

  const validateProjectTasks = useCallback(
    (nextStatus) => {
      if (nextStatus === '검수' || nextStatus === '종료') {
        const projectTasks = selectedItem?.data?.projectTasks || [];
        const hasIncompleteTasks = projectTasks.some(
          (task) => task.taskProgress?.name !== '100%',
        );

        if (hasIncompleteTasks) {
          throw new Error(
            '모든 테스트가 100% 완료되어야 상태를 변경할 수 있습니다.',
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

      const id = initialData.documentId;
      console.log(`>>>> formData id: ${id}`, formData);

      try {
        setIsSubmitting(true);
        setError(null);

        // 상태 변경 시 테스트 완료 여부 검증
        validateProjectTasks(formData.pjtStatus.name);

        // 불필요 필드 제거
        const cleanedData = cleanFormData(formData);

        // 관계 필드 처리
        const processedData = processRelationFields(cleanedData);

        // 키 정보 스네이크케이스로 변환
        const snakeCaseData = convertKeysToSnakeCase(processedData);

        console.log(`>>>> snakeCaseData`, snakeCaseData);

        const result = await projectApiService.updateProject(id, snakeCaseData);

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
    [formData, validateProjectTasks],
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
