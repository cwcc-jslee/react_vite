// src/features/sfa/hooks/useFormData.js
// 구조개선(25.01.24)
import { useState, useEffect } from 'react';

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

const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
};

const initialSalesByPayment = {
  billingType: '',
  isConfirmed: false,
  probability: '',
  amount: '',
  profitAmount: '',
  isProfit: false,
  marginProfitValue: '',
  recognitionDate: '',
  scheduledDate: '',
  memo: '',
};

/**
 * 매출 등록 폼의 데이터를 관리하는 커스텀 훅
 * @param {Function} fetchItems - 매출품목 조회 함수
 * @returns {Object} 폼 데이터 상태와 관련 핸들러 함수들
 */
export const useFormData = (fetchItems) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    console.log('Form Data Changed:', {
      previous: initialState,
      current: formData,
      changes: Object.keys(formData).reduce((diff, key) => {
        if (formData[key] !== initialState[key]) {
          diff[key] = {
            from: initialState[key],
            to: formData[key],
          };
        }
        return diff;
      }, {}),
    });
  }, [formData]);

  // 에러 상태 관리
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 입력값 변경 핸들러
   * @param {Object} e - 이벤트 객체
   */
  const updateFormField = (e) => {
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

  /**
   * 매출항목 추가 핸들러
   * 최대 3개까지만 추가 가능
   */
  const handleAddSalesItem = () => {
    if (formData.salesByItems.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesByItems: [...prev.salesByItems, { ...initialSalesByItem }],
      }));
    }
  };

  /**
   * 매출항목 제거 핸들러
   * @param {number} index - 제거할 매출항목의 인덱스
   */
  const handleRemoveSalesItem = (index) => {
    setFormData((prev) => {
      // 깊은 복사를 통해 새로운 배열 생성
      const updatedItems = [...prev.salesByItems];
      updatedItems.splice(index, 1);

      // 관련 에러 상태도 함께 제거
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[`salesItems.${index}.productType`];
        delete newErrors[`salesItems.${index}.teamName`];
        delete newErrors[`salesItems.${index}.amount`];
        return newErrors;
      });

      // 나머지 항목들의 값 재설정
      return {
        ...prev,
        salesByItems: updatedItems.map((item) => ({
          itemId: item.itemId || '',
          itemName: item.itemName || '',
          teamId: item.teamId || '',
          teamName: item.teamName || '',
          amount: item.amount || '',
        })),
      };
    });
  };

  /**
   * 결제매출 추가 핸들러
   * 최대 3개까지만 추가 가능
   * 결제 방법 데이터가 없을 경우 먼저 조회
   */
  const handleAddPayment = async () => {
    if (formData.salesByPayments.length >= 3) return;

    try {
      if (!isPaymentDataLoading && !paymentMethodData.data.length) {
        await fetchPayments();
      }

      setFormData((prev) => ({
        ...prev,
        salesByPayments: [
          ...prev.salesByPayments,
          { ...initialSalesByPayment },
        ],
      }));
    } catch (error) {
      console.error('Failed to add sales payment:', error);
    }
  };

  /**
   * 결제매출 제거 핸들러
   * @param {number} index - 제거할 결제매출의 인덱스
   */
  const handleRemovePayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesByPayments: prev.salesByPayments.filter((_, i) => i !== index),
    }));
  };

  // 매출 아이템 관련 핸들러
  const handleSalesItemChange = (index, fields, values) => {
    setFormData((prev) => {
      const updatedItems = [...prev.salesByItems];

      if (typeof fields === 'string') {
        updatedItems[index] = {
          ...updatedItems[index],
          [fields]: values,
        };
      } else if (typeof fields === 'object') {
        updatedItems[index] = {
          ...updatedItems[index],
          ...fields,
        };
      }

      return {
        ...prev,
        salesByItems: updatedItems,
      };
    });
  };

  // 결제매출 관련 핸들러
  const handlePaymentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedPayments = [...prev.salesByPayments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        [field]: value,
      };
      return {
        ...prev,
        salesByPayments: updatedPayments,
      };
    });
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    updateFormField, // 기존 handleChange
    handleCustomerSelect,
    resetForm,
    setFieldValue,
    setFieldValues,
    // handle actions
    handleAddSalesItem,
    handleRemoveSalesItem,
    handleAddPayment,
    handleRemovePayment,
    handleSalesItemChange,
    handlePaymentChange,
  };
};
