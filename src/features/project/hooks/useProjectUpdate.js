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
import { processRelationFields } from '../../../shared/utils/relationFieldUtils';
import { useProjectStore } from './useProjectStore';
import { PROJECT_STATUS_TRANSITIONS } from '../constants/projectStatusConstants';
import dayjs from 'dayjs';

export const useProjectUpdate = (initialData) => {
  const { data: codebooks } = useCodebook(['pjtStatus', 'pjtClosureType']);
  const { selectedItem } = useProjectStore();
  const currentUser = useSelector((state) => state.auth.user); // 현재 로그인 사용자

  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [fieldName]: value,
      };

      // 상태가 '종료'가 아닐 때는 종료타입과 종료일을 초기화
      if (fieldName === 'pjtStatus' && value?.name !== '종료') {
        newData.pjtClosureType = null;
        newData.closureDate = null;
      }

      return newData;
    });
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

        // 종료 상태일 때 종료타입 및 종료일 필수 검증
        if (formData.pjtStatus?.name === '종료') {
          if (!formData.pjtClosureType) {
            throw new Error(
              '종료 상태로 변경할 때는 종료타입을 선택해야 합니다.',
            );
          }
          if (!formData.closureDate) {
            throw new Error(
              '종료 상태로 변경할 때는 종료일을 선택해야 합니다.',
            );
          }
        }

        // 불필요 필드 제거 및 데이터 정리
        const { id, documentId, pjtClosureType, closureDate, statusDetail, changeDescription, ...restData } = formData;
        console.log(`>>>> restData`, restData);

        // 관계 필드 처리
        const processedData = processRelationFields(restData);

        // 종료 상태일 경우 isClosed를 true로 설정
        if (formData.pjtStatus?.name === '종료') {
          processedData.isClosed = true;
        }

        console.log(`>>>> processedData`, processedData);

        // 프로젝트 업데이트
        const result = await projectApiService.updateProject(
          documentId,
          processedData,
        );

        // 상태 변경 이력 생성 (상태가 변경된 경우에만)
        if (formData.pjtStatus?.id !== initialData.pjtStatus?.id) {
          try {
            const statusChangeData = {
              project: id,
              fromStatus: initialData.pjtStatus.id,
              toStatus: formData.pjtStatus.id,
              statusDetail: statusDetail || null,
              requestedBy: currentUser?.user?.id || null,
              requestedAt: dayjs().toISOString(),
              changeDescription: changeDescription || null,
            };

            await projectApiService.createProjectStatusChange(statusChangeData);
            console.log('상태 변경 이력 생성 완료:', statusChangeData);
          } catch (statusChangeError) {
            // 상태 변경 이력 생성 실패를 콘솔에 기록하지만 전체 프로세스를 실패시키지는 않음
            console.error('상태 변경 이력 생성 실패:', statusChangeError);
          }
        }

        // 프로젝트 상태가 '종료'인 경우에만 project-closures 테이블에 데이터 추가
        if (formData.pjtStatus?.name === '종료') {
          try {
            // 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 이슈 방지)
            const formattedClosureDate = formData.closureDate
              ? dayjs(formData.closureDate).format('YYYY-MM-DD')
              : null;

            const closureData = {
              project: id,
              closureType: formData.pjtClosureType.id,
              closureDate: formattedClosureDate,
            };
            await projectApiService.createProjectClosure(closureData);
          } catch (closureError) {
            // 종료 정보 생성 실패 시 에러 발생 (상태 이력은 이미 생성됨)
            throw new Error(
              '프로젝트 종료 정보 생성 중 오류가 발생했습니다.',
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
