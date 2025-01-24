// src/features/sfa/hooks/useFormData.js
// 구조개선(25.01.24)
import { useState } from 'react';

/**
 * 초기 상태 정의
 */
export const initialState = {
  name: '',
  sfaSalesType: '',
  sfaClassification: '',
  customer: '',
  sellingPartner: '',
  itemAmount: '',
  paymentAmount: '',
  description: '',
  salesByItems: [],
  salesByPayments: [],
};

/**
 * 매출 등록 폼의 데이터를 관리하는 커스텀 훅
 * @param {Function} fetchItems - 매출품목 조회 함수
 * @returns {Object} 폼 데이터 상태와 관련 핸들러 함수들
 */
export const useFormData = (fetchItems) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(initialState);

  // 에러 상태 관리
  const [errors, setErrors] = useState({});

  /**
   * 입력값 변경 핸들러
   * @param {Object} e - 이벤트 객체
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // SFA 분류 변경 시 관련 매출품목 조회
    if (name === 'sfaClassification' && value) {
      fetchItems(value);
      // 매출품목 변경 시 관련 항목 초기화
      setFormData((prev) => ({
        ...prev,
        salesByItems: prev.salesByItems.map((item) => ({
          ...item,
          itemName: '',
        })),
      }));
    }

    // 에러 상태 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * 고객사 선택 핸들러
   * @param {Object} customer - 선택된 고객사 정보
   */
  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customer: customer.id,
    }));

    // 에러 상태 초기화
    if (errors.customer) {
      setErrors((prev) => ({ ...prev, customer: undefined }));
    }
  };

  /**
   * 폼 초기화 함수
   * 모든 필드를 초기 상태로 리셋
   */
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  /**
   * 특정 필드의 값을 설정하는 유틸리티 함수
   * @param {string} fieldName - 필드명
   * @param {any} value - 설정할 값
   */
  const setFieldValue = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  /**
   * 여러 필드의 값을 한번에 설정하는 유틸리티 함수
   * @param {Object} values - 설정할 필드와 값들의 객체
   */
  const setFieldValues = (values) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleCustomerSelect,
    resetForm,
    setFieldValue,
    setFieldValues,
  };
};
