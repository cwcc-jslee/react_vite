// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';
import { notification } from '../../../shared/services/notification';

/**
 * 초기 상태 정의
 */
const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
};

const initialSalesByPayment = {
  paymentType: '',
  confirmed: false,
  probability: '',
  amount: '',
  isProfit: false,
  margin: '',
  marginAmount: '',
  recognitionDate: '',
  paymentDate: '',
  memo: '',
};

const initialFormState = {
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
 * Drawer 폼 데이터 관리 Hook
 */
export const useDrawerFormData = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 데이터 상태 관리
  const [itemsData, setItemsData] = useState({ data: [] });
  const [paymentMethodData, setPaymentMethodData] = useState({ data: [] });
  const [percentageData, setPercentageData] = useState({ data: [] });

  // 로딩 상태 관리
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isPaymentDataLoading, setIsPaymentDataLoading] = useState(false);

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

  /**
   * API 호출 함수들
   */
  const fetchItems = async (classificationId) => {
    if (!classificationId) {
      setItemsData({ data: [] });
      return;
    }

    setIsItemsLoading(true);
    try {
      const query = qs.stringify(
        {
          filters: {
            sfa_classification: { id: { $eq: classificationId } },
          },
          sort: ['sort:asc'],
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClient.get(`/api/sfa-items?${query}`);
      setItemsData(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItemsData({ data: [] });
    } finally {
      setIsItemsLoading(false);
    }
  };

  const fetchCodebook = async (type) => {
    const queryObj = {
      fields: ['code', 'name', 'sort'],
      populate: {
        codetype: {
          fields: ['type', 'name'],
        },
      },
      filters: {
        $and: [{ used: { $eq: true } }, { codetype: { type: { $eq: type } } }],
      },
      sort: ['sort:asc'],
      pagination: { start: 0, limit: 50 },
    };

    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    return apiClient.get(`/api/codebooks?${query}`);
  };

  const fetchPayments = async () => {
    setIsPaymentDataLoading(true);
    try {
      const [paymentMethods, percentages] = await Promise.all([
        fetchCodebook('re_payment_method'),
        fetchCodebook('sfa_percentage'),
      ]);

      setPaymentMethodData(paymentMethods.data);
      setPercentageData(percentages.data);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      setPaymentMethodData({ data: [] });
      setPercentageData({ data: [] });
    } finally {
      setIsPaymentDataLoading(false);
    }
  };

  /**
   * 이벤트 핸들러들
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'sfaClassification' && value) {
      fetchItems(value);
      setFormData((prev) => ({
        ...prev,
        salesByItems: prev.salesByItems.map((item) => ({
          ...item,
          itemName: '',
        })),
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customer: customer.id,
    }));

    if (errors.customer) {
      setErrors((prev) => ({ ...prev, customer: undefined }));
    }
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

  const handleAddSalesItem = () => {
    if (formData.salesByItems.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesByItems: [...prev.salesByItems, { ...initialSalesByItem }],
      }));
    }
  };

  const handleRemoveSalesItem = (index) => {
    setFormData((prev) => {
      // 깊은 복사를 통해 새로운 배열 생성
      const updatedItems = [...prev.salesByItems];

      // 해당 인덱스의 항목을 완전히 제거
      updatedItems.splice(index, 1);

      // 관련 에러 상태도 함께 제거
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        // 해당 인덱스의 모든 관련 에러 삭제
        delete newErrors[`salesItems.${index}.productType`];
        delete newErrors[`salesItems.${index}.teamName`];
        delete newErrors[`salesItems.${index}.amount`];
        return newErrors;
      });

      // 나머지 항목들의 값도 재설정하여 초기화된 상태로 업데이트
      return {
        ...prev,
        salesByItems: updatedItems.map((item, i) => ({
          itemId: item.itemId || '',
          itemName: item.itemName || '',
          teamId: item.teamId || '',
          teamName: item.teamName || '',
          amount: item.amount || '',
          productType: item.productType || '',
          teamName: item.teamName || '',
        })),
      };
    });
  };

  // 결제매출 관련 핸들러
  const handleSalesPaymentChange = (index, field, value) => {
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

  const handleAddSalesPayment = async () => {
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

  const handleRemoveSalesPayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesByPayments: prev.salesByPayments.filter((_, i) => i !== index),
    }));
  };

  /**
   * 유효성 검사 함수들
   */
  const validateSalesItems = (items) => {
    let hasError = false;
    const errors = {};

    items.forEach((item, index) => {
      const missingFields = [];

      if (!item.productType) missingFields.push('매출품목');
      if (!item.teamName) missingFields.push('사업부');
      if (!item.amount) missingFields.push('매출금액');

      if (missingFields.length > 0) {
        hasError = true;
        errors[`salesItems.${index}.productType`] = true;
        errors[`salesItems.${index}.teamName`] = true;
        errors[`salesItems.${index}.amount`] = true;
      }
    });

    return { errors, hasError };
  };

  const validatePayments = (payments) => {
    const errors = {};

    payments.forEach((payment, index) => {
      // 필수 필드 검증
      const requiredFields = {
        paymentType: '결제구분을 선택해주세요',
        probability: '매출확률을 선택해주세요',
        amount: '매출액을 입력해주세요',
        margin: payment.isProfit
          ? '이익금을 입력해주세요'
          : '이익률을 입력해주세요',
        recognitionDate: '매출인식일자를 선택해주세요',
      };

      Object.entries(requiredFields).forEach(([field, message]) => {
        if (!payment[field]) {
          errors[`salesPayments.${index}.${field}`] = message;
        }
      });

      // 매출액 숫자 검증
      if (payment.amount && !Number.isInteger(Number(payment.amount))) {
        errors[`salesPayments.${index}.amount`] =
          '매출액은 정수만 입력 가능합니다';
      }

      // 이익률/이익금 검증
      if (payment.margin) {
        const marginValue = Number(payment.margin);
        const amountValue = Number(payment.amount);

        if (payment.isProfit) {
          // 이익금 검증: 매출액보다 작아야 함
          if (marginValue >= amountValue) {
            errors[`salesPayments.${index}.margin`] =
              '이익금은 매출액보다 작아야 합니다';
          }
        } else {
          // 이익률 검증: 0-100 사이 값
          if (marginValue < 0 || marginValue > 100) {
            errors[`salesPayments.${index}.margin`] =
              '이익률은 0-100 사이의 값을 입력해주세요';
          }
        }
      }
    });

    return errors;
  };

  const validateForm = () => {
    const newErrors = {};

    // 필수 필드 검증
    const requiredFields = {
      sfaSalesType: '매출유형을 선택해주세요',
      sfaClassification: '매출구분을 선택해주세요',
      customer: '고객사를 선택해주세요',
      name: '건명을 입력해주세요',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) {
        newErrors[field] = message;
      }
    });

    // 매출 아이템 검증
    if (formData.salesByItems.length === 0) {
      notification.error({
        message: '사업부매출등록 오류',
        description: '최소 하나의 사업부 매출을 등록해주세요',
      });
      return false;
    }

    // 매출 아이템 유효성 검사
    const { errors: salesItemErrors, hasError } = validateSalesItems(
      formData.salesByItems,
    );

    if (hasError) {
      notification.error({
        message: '사업부매출등록 유효성 검사 오류!!',
        description: '매출품목과 사업부를 모두 입력해주세요.',
      });
      Object.assign(newErrors, salesItemErrors);
    }

    // 결제 매출 검증
    if (formData.salesByPayments.length === 0) {
      newErrors.salesPayments = '최소 하나의 결제 매출을 등록해주세요';
    } else {
      Object.assign(newErrors, validatePayments(formData.salesByPayments));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    setErrors,
    handleChange,
    handleCustomerSelect,
    handleSalesItemChange,
    handleAddSalesItem,
    handleRemoveSalesItem,
    handleSalesPaymentChange,
    handleAddSalesPayment,
    handleRemoveSalesPayment,
    validateForm,
    isItemsLoading,
    itemsData,
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
  };
};
