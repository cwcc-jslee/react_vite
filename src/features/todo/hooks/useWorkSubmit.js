/**
 * 작업(Work) 제출 처리를 위한 커스텀 훅
 *
 * 주요 기능:
 * 1. 작업 데이터 제출 프로세스 관리
 * 2. 데이터 전처리 및 변환
 * 3. API 호출 및 응답 처리
 * 4. 에러 처리 및 복구
 *
 * 사용 예시:
 * const { isSubmitting, handleFormSubmit, updateWorkData } = useWorkSubmit();
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { notification } from '@shared/services/notification';
import { useTodoStore } from './useTodoStore';
import {
  prepareFormData,
  convertKeysToSnakeCase,
} from '@shared/utils/transformUtils';
import { todoApiService } from '../services/todoApiService';
import { setFormSubmitting } from '../../../store/slices/todoSlice';
import { validateWorkForm } from '../utils/validateWorkForm';

export const useWorkSubmit = () => {
  const dispatch = useDispatch();
  const { form, updateFormField } = useTodoStore();

  /**
   * 폼 제출 처리
   * @param {Object} formData - 제출할 폼 데이터
   */
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        dispatch(setFormSubmitting(true));

        // 1. 유효성 검사
        const { isValid, errors: validationErrors } =
          validateWorkForm(formData);
        if (!isValid) {
          notification.error({
            message: '작업 등록 오류',
            description: Object.values(validationErrors)[0],
          });
          return false;
        }

        // 2. 데이터 전처리
        const cleanData = prepareFormData(formData);

        // taskProgress에서 id 값만 추출
        if (
          cleanData.taskProgress &&
          typeof cleanData.taskProgress === 'object'
        ) {
          cleanData.taskProgress = cleanData.taskProgress.id;
        }

        const snakeCaseData = convertKeysToSnakeCase(cleanData);

        // 3. API 제출
        console.log(`>>>>> api 제출 : `, snakeCaseData);
        const response = await todoApiService.createWork(snakeCaseData);

        notification.success({
          message: '작업 등록 성공',
          description: '작업이 성공적으로 등록되었습니다.',
        });

        return response;
      } catch (error) {
        console.error('Work submission error:', error);
        notification.error({
          message: '작업 등록 실패',
          description: error.message || '작업 등록 중 오류가 발생했습니다.',
        });
        return false;
      } finally {
        dispatch(setFormSubmitting(false));
      }
    },
    [dispatch],
  );

  return {
    isSubmitting: form.isSubmitting,
    handleFormSubmit,
  };
};
