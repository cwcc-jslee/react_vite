// src/features/sfa/hooks/useFormData.js
// 구조개선(25.01.24)
import { useState, useEffect, useCallback } from 'react';
import { sfaApi } from '../api/sfaApi';
import {
  FORM_LIMITS,
  initialFormState,
  initialSalesByItem,
  initialSalesByPayment,
  INITIAL_PAYMENT_ID_STATE,
} from '../constants/formInitialState';

/**
 * 매출 등록 폼의 데이터를 관리하는 커스텀 훅
 * @param {Function} fetchItems - 매출품목 조회 함수
 * @returns {Object} 폼 데이터 상태와 관련 핸들러 함수들
 */
export const useFormData = (drawerState) => {
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState(initialFormState);
  // 에러 상태 관리
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // API 데이터 상태
  const [itemsData, setItemsData] = useState({ data: [] });
  const [paymentData, setPaymentData] = useState({ data: [] });
  const [percentageData, setPercentageData] = useState({ data: [] });
  // API 데이터 로딩 상태 관리
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isPaymentDataLoading, setIsPaymentDataLoading] = useState(false);
  // 선택된 결제매출 ID 상태 관리
  const [selectedPaymentIds, setSelectedPaymentIds] = useState(
    INITIAL_PAYMENT_ID_STATE,
  );
  const [selectedPaymentData, setSelectedPaymentData] = useState([]);

  useEffect(() => {
    console.log('Form Data Changed:', {
      previous: initialFormState,
      current: formData,
      changes: Object.keys(formData).reduce((diff, key) => {
        if (formData[key] !== initialFormState[key]) {
          diff[key] = {
            from: initialFormState[key],
            to: formData[key],
          };
        }
        return diff;
      }, {}),
    });
  }, [formData]);

  // useEffect(() => {
  //   console.log('Payment Data Changed:', paymentData);
  // }, [paymentData]);
  /**
   * 매출 금액 합계 계산 Effect
   */
  useEffect(() => {
    const itemTotal = formData.salesByItems.reduce(
      (sum, item) => sum + (parseInt(item.amount) || 0),
      0,
    );

    const paymentTotal = formData.salesByPayments.reduce(
      (sum, payment) => sum + (parseInt(payment.amount) || 0),
      0,
    );

    setFormData((prev) => ({
      ...prev,
      itemAmount: itemTotal.toString(),
      paymentAmount: paymentTotal.toString(),
    }));
  }, [formData.salesByItems, formData.salesByPayments]);

  // 아이템 데이터 조회
  const loadItems = useCallback(async (classificationId) => {
    if (!classificationId) {
      setItemsData({ data: [] });
      return;
    }

    setIsItemsLoading(true);
    try {
      const response = await sfaApi.fetchItems(classificationId);
      setItemsData(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItemsData({ data: [] });
    } finally {
      setIsItemsLoading(false);
    }
  }, []);

  const loadPayments = async () => {
    setIsPaymentDataLoading(true);
    try {
      const [paymentMethods, percentages] = await Promise.all([
        sfaApi.fetchCodebook('re_payment_method'),
        sfaApi.fetchCodebook('sfa_percentage'),
      ]);

      setPaymentData(paymentMethods.data);
      setPercentageData(percentages.data);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      setPaymentData({ data: [] });
      setPercentageData({ data: [] });
    } finally {
      setIsPaymentDataLoading(false);
    }
  };

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
      loadItems(value);
      // fetchItems(value);
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
    setFormData(initialFormState);
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
      if (!isPaymentDataLoading && !paymentData.data.length) {
        await loadPayments();
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

  /**
   * 매출 아이템 관리 훅
   * updateItem
   * addItem
   * removeItem
   */
  const updateItem = useCallback(
    (index, fields, values) => {
      setFormData((prev) => {
        const updatedItems = [...prev.salesByItems];

        if (typeof fields === 'string') {
          updatedItems[index] = {
            ...updatedItems[index],
            [fields]: values,
          };
        } else {
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
    },
    [setFormData],
  );

  const addItem = useCallback(() => {
    if (formData.salesByItems.length < FORM_LIMITS.MAX_SALES_ITEMS) {
      setFormData((prev) => ({
        ...prev,
        salesByItems: [...prev.salesByItems, { ...initialSalesByItem }],
      }));
    }
  }, [formData.salesByItems.length, setFormData]);

  const removeItem = useCallback(
    (index) => {
      setFormData((prev) => ({
        ...prev,
        salesByItems: prev.salesByItems.filter((_, i) => i !== index),
      }));
    },
    [setFormData],
  );

  //경제매출 수정 선택시
  const handleEditPayment = async () => {
    if (formData.salesByPayments.length >= 3) return;

    try {
      if (!isPaymentDataLoading && !paymentData.data.length) {
        await loadPayments();
      }
    } catch (error) {
      console.error('Failed to load payment:', error);
    }
  };

  // 결제매출 선택 핸들러 (수정 모드)
  const togglePaymentSelection = async (item) => {
    console.log('>>togglePaymentSelection>> [paymentId] : ', item);

    // formData 업데이트
    const payment = drawerState.data.sfa_by_payments.find(
      (p) => p.documentId === item.documentId,
    );
    console.log('>>togglePaymentSelection>> [payment] : ', payment);

    try {
      // if (!isPaymentDataLoading && !paymentData.data.length) {
      //   await loadPayments();
      // }
      setFormData((prev) => ({
        ...prev,
        salesByPayments: [
          {
            // 선택시 추가
            id: payment.id,
            documentId: payment.documentId,
            billingType: payment.billing_type || '',
            isConfirmed: payment.is_confirmed || false,
            probability: payment.probability?.toString() || '',
            amount: payment.amount?.toString() || '',
            profitAmount: payment.profit_amount?.toString() || '',
            isProfit: payment.profit_config?.is_profit || false,
            marginProfitValue:
              payment.profit_config?.margin_profit_value?.toString() || '',
            recognitionDate: payment.recognition_date || '',
            scheduledDate: payment.scheduled_date || '',
            memo: payment.memo || '',
            sfa: payment.sfa || null,
          },
        ],
      }));
    } catch (error) {
      console.error('Failed to edit sales payment:', error);
    }
  };

  const resetPaymentForm = () => {
    try {
      // 순차적으로 상태 업데이트
      setFormData((prev) => ({
        ...prev,
        salesByPayments: [],
      }));
    } catch (error) {
      console.error('Reset 중 오류 발생:', error);
    }
  };

  return {
    // 폼 상태관리
    formData,
    errors,
    updateFormField, // 기존 handleChange
    setFormData, //확인후 삭제
    setErrors,
    //
    isSubmitting,
    setIsSubmitting,
    // 매출 아이템 관리 훅
    updateItem,
    addItem,
    removeItem,
    itemsData,
    isItemsLoading,
    paymentData,
    percentageData,
    isPaymentDataLoading,
    //
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
    // 결제매출 수정
    // selectedPaymentData,
    selectedPaymentIds,
    togglePaymentSelection,
    resetPaymentForm,
    handleEditPayment,
  };
};
