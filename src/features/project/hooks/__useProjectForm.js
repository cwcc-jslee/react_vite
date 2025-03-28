// src/features/project/hooks/useProjectForm.js
/**
 * Project 폼 관련 로직을 관리하는 커스텀 훅
 * Redux와 완전히 통합된 버전으로, 중복 상태를 제거하고 Redux에 의존합니다.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { projectInitialState } from '../../../shared/constants/initialFormState';
import {
  updateFormField,
  resetForm,
  setFormErrors,
  createProject,
} from '../store/projectSlice';
import { closeDrawer } from '../../../store/slices/uiSlice';
import { formatFullName } from '../../../shared/utils/nameUtils';
import { notification } from '../../../shared/services/notification';

/**
 * Project Form 관련 로직을 관리하는 Custom Hook
 * Redux 상태를 직접 활용하도록 리팩토링
 */
export const useProjectForm = () => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const {
    data: formData,
    errors,
    isSubmitting,
  } = useSelector((state) => state.project.form);

  /**
   * 폼 유효성 검사 함수
   * @returns {boolean} 유효성 검사 통과 여부
   */
  const validateForm = useCallback(() => {
    // 유효성 검증 로직
    const newErrors = {};

    // 필수 필드 체크
    if (!formData.projectName) {
      newErrors.projectName = '프로젝트 이름은 필수입니다';
    }

    if (!formData.customer) {
      newErrors.customer = '고객사 정보는 필수입니다';
    }

    // 오류가 있으면 저장
    if (Object.keys(newErrors).length > 0) {
      dispatch(setFormErrors(newErrors));
      return false;
    }

    return true;
  }, [formData, dispatch]);

  /**
   * 폼 데이터 전처리 함수
   * @param {Object} data - 처리할 폼 데이터
   * @returns {Object} 처리된 데이터
   */
  const prepareData = useCallback((data) => {
    // 깊은 복사로 원본 데이터 유지
    const clonedData = JSON.parse(JSON.stringify(data));

    // 불필요한 임시 필드 제거
    const { __temp, ...cleanData } = clonedData;

    // null이나 빈 문자열인 경우 해당 키 삭제
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    return cleanData;
  }, []);

  /**
   * 폼 제출 처리
   * @returns {Promise} 제출 결과
   */
  const processSubmit = useCallback(async () => {
    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      // 데이터 전처리
      const preparedData = prepareData(formData);

      // Redux 액션으로 프로젝트 생성 요청
      const resultAction = await dispatch(createProject(preparedData));

      // 성공 시
      if (createProject.fulfilled.match(resultAction)) {
        notification.success({
          message: '프로젝트 등록 성공',
          description: '프로젝트 정보가 성공적으로 저장되었습니다.',
        });

        // 드로어 닫기
        dispatch(closeDrawer());

        // 폼 초기화
        dispatch(resetForm());

        return resultAction.payload;
      }
    } catch (error) {
      console.error('Project submission error:', error);
      notification.error({
        message: '프로젝트 등록 실패',
        description: error.message || '프로젝트 등록 중 오류가 발생했습니다.',
      });
    }
  }, [formData, validateForm, prepareData, dispatch]);

  /**
   * 특정 폼 필드 업데이트 함수
   * @param {string} name - 필드 이름
   * @param {any} value - 필드 값
   */
  const updateField = useCallback(
    (name, value) => {
      dispatch(updateFormField({ name, value }));
    },
    [dispatch],
  );

  /**
   * 이벤트에서 폼 필드 업데이트 함수
   * @param {Event} e - 이벤트 객체
   */
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch(updateFormField({ name, value }));
    },
    [dispatch],
  );

  /**
   * 폼 데이터 초기화
   * @param {Object} data - 초기 데이터
   */
  const initializeFormData = useCallback(
    (data = {}) => {
      // 초기 데이터에 lastName과 firstName이 있으면 fullName도 설정
      const initialData = { ...data };

      if (initialData.lastName || initialData.firstName) {
        initialData.fullName = formatFullName(
          initialData.lastName,
          initialData.firstName,
        );
      }

      dispatch(
        resetForm({
          ...projectInitialState,
          ...initialData,
        }),
      );
    },
    [dispatch],
  );

  /**
   * 고객사 선택 처리
   * @param {Object} customer - 선택된 고객사 객체
   */
  const handleCustomerSelect = useCallback(
    (customer) => {
      dispatch(
        updateFormField({
          name: 'customer',
          value: customer.id,
        }),
      );
    },
    [dispatch],
  );

  /**
   * 에러 상태 설정 함수
   * @param {Object} errors - 에러 객체
   */
  const setErrors = useCallback(
    (errors) => {
      dispatch(setFormErrors(errors));
    },
    [dispatch],
  );

  /**
   * 제출 상태 설정 함수
   * @param {boolean} isSubmitting - 제출 중 상태
   */
  const setIsSubmitting = useCallback(
    (value) => {
      // Redux에 isSubmitting 상태 설정 액션이 없어 추가 필요
      dispatch({ type: 'project/setSubmitting', payload: value });
    },
    [dispatch],
  );

  return {
    formData,
    errors,
    isSubmitting,
    updateFormField: handleInputChange,
    updateField,
    initializeFormData,
    processSubmit,
    validateForm,
    handleCustomerSelect,
    prepareData,
    setErrors,
    setIsSubmitting,
  };
};
