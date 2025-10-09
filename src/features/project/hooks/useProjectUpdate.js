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
  const { data: codebooks } = useCodebook(['pjtStatus', 'pjtClosureType']);
  const { selectedItem } = useProjectStore();

  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [fieldName]: value,
      };

      // 상태가 '종료'가 아닐 때는 종료타입을 초기화
      if (fieldName === 'pjtStatus' && value?.name !== '종료') {
        newData.pjtClosureType = null;
      }

      return newData;
    });
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

  // 종료 상태 여부 확인
  const isClosureStatus = useMemo(() => {
    return formData.pjtStatus?.name === '종료';
  }, [formData.pjtStatus]);

  // 종료타입 목록
  const availableClosureTypes = useMemo(() => {
    return codebooks?.pjtClosureType || [];
  }, [codebooks?.pjtClosureType]);

  const validateProjectTasks = useCallback(
    (nextStatus, closureType) => {
      const projectTasks = selectedItem?.data?.projectTasks || [];

      // 검수 상태일 때 검증
      // - isProgress가 true인 TASK는 isCompleted가 true여야 함
      // - isProgress가 false인 TASK는 검증 통과
      if (nextStatus === '검수') {
        const hasIncompleteTasks = projectTasks.some(
          (task) => task.isProgress === true && task.isCompleted !== true,
        );

        if (hasIncompleteTasks) {
          throw new Error(
            '진행 중인 모든 태스크가 완료되어야 검수 상태로 변경할 수 있습니다.',
          );
        }
      }

      // 종료 상태일 때는 pjtClosureType이 '완료'인 경우에만 task 체크
      // - 모든 TASK의 isCompleted가 true여야 함
      if (nextStatus === '종료' && closureType?.name === '완료') {
        const hasIncompleteTasks = projectTasks.some(
          (task) => task.isCompleted !== true,
        );

        if (hasIncompleteTasks) {
          throw new Error(
            '완료로 종료할 경우 모든 태스크가 완료되어야 합니다.',
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
        validateProjectTasks(formData.pjtStatus.name, formData.pjtClosureType);

        // 종료 상태일 때 종료타입 필수 검증
        if (formData.pjtStatus?.name === '종료' && !formData.pjtClosureType) {
          throw new Error(
            '종료 상태로 변경할 때는 종료타입을 선택해야 합니다.',
          );
        }

        // 불필요 필드 제거 및 데이터 정리
        const { id, documentId, pjtClosureType, ...restData } = formData;
        console.log(`>>>> restData`, restData);
        // 관계 필드 처리
        const processedData = processRelationFields(restData);

        // 키 정보 스네이크케이스로 변환
        const snakeCaseData = convertKeysToSnakeCase(processedData);

        // 종료 상태일 경우 is_closed를 true로 설정
        if (formData.pjtStatus?.name === '종료') {
          snakeCaseData.is_closed = true;
        }

        console.log(`>>>> snakeCaseData`, snakeCaseData);

        // 프로젝트 업데이트
        const result = await projectApiService.updateProject(
          documentId,
          snakeCaseData,
        );

        // 프로젝트 상태가 '종료'인 경우에만 project-closures 테이블에 데이터 추가
        if (formData.pjtStatus?.name === '종료') {
          try {
            const closureData = {
              project: id,
              closure_type: pjtClosureType.id,
            };
            await projectApiService.createProjectClosure(closureData);
          } catch (closureError) {
            // 종료 정보 생성 실패 시 프로젝트 상태 롤백
            const rollbackData = {
              ...snakeCaseData,
              pjt_status: initialData.pjtStatus.id,
              pjt_closure_type: null,
            };
            await projectApiService.updateProject(id, rollbackData);
            throw new Error(
              '프로젝트 종료 정보 생성 중 오류가 발생했습니다. 프로젝트 상태가 이전 상태로 복원되었습니다.',
            );
          }
        }

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
    isClosureStatus,
    availableClosureTypes,
  };
};
