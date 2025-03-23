// src/features/project/hooks/useProjectForm.js
/**
 * Project 폼 관련 로직을 관리하는 커스텀 훅
 * 담당자 정보 관리, 폼 상태 처리, 고객사 연결 기능을 제공
 */

import { useState, useCallback } from 'react';
import { useProject } from '../context/ProjectProvider';
import { projectInitialState } from '../../../shared/constants/initialFormState';
// import { submitProjectData } from '../services/projectSubmitService';
import { useForm } from '../../../shared/hooks/useForm';
import { formatFullName } from '../../../shared/utils/nameUtils';
// import { validateProjectForm } from '../utils/projectFormValidation';

/**
 * Project Form 관련 로직을 관리하는 Custom Hook
 */
export const useProjectForm = () => {
  const { setDrawerClose } = useProject();
  // 공통 useForm 훅 사용
  const formHook = useForm(projectInitialState);
  //   formData,
  //   errors,
  //   updateFormField,
  //   setFormData,
  //   setErrors,
  //   resetForm,
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 폼 유효성 검사 함수
   * @returns {Object} { isValid, errors } 형태의 객체
   */
  const validateForm = useCallback(() => {
    // return validateProjectForm(formHook.formData);
  }, [formHook.formData]);

  /**
   * 폼 제출 처리 함수
   * 제출 상태 관리 및 서비스 레이어 호출
   */
  const processSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // 서비스 레이어 호출 (제출)
      // const response = await submitProjectData(formHook.formData);

      // 제출 성공 후처리
      handleSubmitSuccess(response);

      return response;
    } catch (error) {
      // 오류 상태 설정
      formHook.setErrors((prev) => ({
        ...prev,
        submit: error?.message || '제출 중 오류가 발생했습니다',
      }));

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formHook.formData]);

  /**
   * 제출 성공 후 실행할 처리
   */
  const handleSubmitSuccess = useCallback(
    (response) => {
      // 담당자 목록 새로고침 (있는 경우)
      // if (refreshProjectList) {
      //   refreshProjectList();
      // }

      // 드로어 닫기
      setDrawerClose();

      return response;
    },
    // [refreshProjectList, setDrawerClose],
    [setDrawerClose],
  );

  /**
   * Project 전용 필드 업데이트 핸들러
   */
  const updateProjectField = useCallback(
    (e) => {
      const { name, value } = e.target;
      formHook.updateFormField(e);

      // // 해당 필드에 오류가 있었다면 초기화
      // if (formHook.errors[name]) {
      //   formHook.setErrors((prev) => ({ ...prev, [name]: undefined }));
      // }
    },
    [formHook],
  );

  /**
   * 폼 데이터 초기화 (특정 데이터로)
   * @param {Object} data - 설정할 초기 데이터
   */
  const initializeFormData = useCallback(
    (data) => {
      // 초기 데이터에 lastName과 firstName이 있으면 fullName도 설정
      const initialData = { ...data };

      if (initialData.lastName || initialData.firstName) {
        initialData.fullName = formatFullName(
          initialData.lastName,
          initialData.firstName,
        );
      }

      formHook.setFormData({
        ...projectInitialState,
        ...initialData,
      });
      formHook.setErrors({});
    },
    [formHook],
  );

  /**
   * 선택된 회사 변경 시 처리
   * @param {Object} customer - 선택된 고객사 객체
   */
  const handleCustomerSelect = useCallback(
    (customer) => {
      formHook.setFormData((prev) => ({
        ...prev,
        customer: customer.id,
      }));
    },
    [formHook],
  );

  /**
   * 다중 선택 항목 변경 처리 (태그 등)
   * @param {string} fieldName - 필드 이름
   * @param {Object} item - 선택/해제된 항목
   * @param {boolean} isSelected - 선택 여부
   */
  const handleMultiSelectChange = useCallback(
    (fieldName, item, isSelected) => {
      formHook.setFormData((prev) => {
        const currentItems = Array.isArray(prev[fieldName])
          ? [...prev[fieldName]]
          : [];

        if (isSelected) {
          // 이미 선택된 항목이 아닌 경우에만 추가
          if (!currentItems.some((existing) => existing.id === item.id)) {
            return { ...prev, [fieldName]: [...currentItems, item] };
          }
        } else {
          // 선택 해제된 항목 제거
          return {
            ...prev,
            [fieldName]: currentItems.filter(
              (existing) => existing.id !== item.id,
            ),
          };
        }

        return prev;
      });
    },
    [formHook],
  );

  return {
    ...formHook,
    isSubmitting,
    updateFormField: updateProjectField,
    initializeFormData,
    processSubmit,
    validateForm,
    handleCustomerSelect,
    handleMultiSelectChange,
  };
};
