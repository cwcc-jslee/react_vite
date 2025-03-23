// src/features/project/hooks/useProjectForm.js
/**
 * Project 폼 관련 로직을 관리하는 커스텀 훅
 * 담당자 정보 관리, 폼 상태 처리, 고객사 연결 기능을 제공
 */

import { useState, useCallback } from 'react';
import { useProject } from '../context/ProjectProvider';
import { projectInitialState } from '../../../shared/constants/initialFormState';
import { submitProjectData } from '../services/projectSubmitService';
import { useForm } from '../../../shared/hooks/useForm';
import { formatFullName } from '../../../shared/utils/nameUtils';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';
// import { validateProjectForm } from '../utils/projectFormValidation';
import { notification } from '../../../shared/services/notification';

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
   * 데이터를 API 제출 전에 정리하는 함수
   * 불필요한 임시 필드 제거 및 데이터 정리
   *
   * @param {Object} data - 원본 폼 데이터
   * @returns {Object} 정리된 데이터
   */
  const prepareData = useCallback((data) => {
    // 깊은 복사로 원본 데이터 유지
    const clonedData = JSON.parse(JSON.stringify(data));

    // 1. 불필요한 임시 필드 제거
    const { __temp, ...cleanData } = clonedData;

    // 2. null이나 빈 문자열인 경우 해당 키 삭제
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    return cleanData;
  }, []);

  /**
   * 폼 제출 처리 함수
   * 제출 상태 관리 및 서비스 레이어 호출
   */
  const processSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // 1. 불필요한 필드 제거, null 빈문자열 필드 제거 및 데이터 정리
      const preparedData = prepareData(formHook.formData);

      // 2. 카멜케이스를 스네이크케이스로 변환
      const snakeCaseData = convertKeysToSnakeCase(preparedData);
      console.log(`스네이크케이스 변환 결과:`, snakeCaseData);

      // 3. API 호출 (내부에서 추가 변환 없이 바로 사용)
      const response = await submitProjectData(snakeCaseData);

      // 4. 성공 알림
      notification.success({
        message: '프로젝트 등록 성공',
        description: '프로젝트 정보가 성공적으로 저장되었습니다.',
      });

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
  }, [formHook.formData, prepareData]);

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
      // setDrawerClose();

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
    prepareData, // 필요시 외부에 노출
  };
};
