// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';
import { notification } from '../../../shared/services/notification';
import {
  formatValidationErrors,
  getFirstErrorMessage,
} from '../utils/validationUtils';
import {
  ERROR_GROUPS,
  ERROR_TYPES,
  REQUIRED_FIELDS,
  PAYMENT_REQUIRED_FIELDS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  PARTNER_ERROR_MESSAGE,
} from '../constants/validationConstants';

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
  const [validationErrors, setValidationErrors] = useState({
    [ERROR_GROUPS.BASIC_INFO]: [],
    [ERROR_GROUPS.SALES_ITEMS]: [],
    [ERROR_GROUPS.PAYMENTS]: [],
  });
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

  // hooks/useFormValidation 으로 이동 예정
  /**
   * 폼 전체 검증 함수
   * @param {boolean} hasPartner - 매출파트너 포함 여부 체크박스 상태
   * @returns {boolean} 검증 통과 여부
   */
  const validateForm = (hasPartner) => {
    const errors = {
      [ERROR_GROUPS.BASIC_INFO]: [],
      [ERROR_GROUPS.SALES_ITEMS]: [],
      [ERROR_GROUPS.PAYMENTS]: [],
    };

    // 기본 정보 검증
    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
      if (!formData[field]) {
        errors[ERROR_GROUPS.BASIC_INFO].push(
          ERROR_MESSAGES.REQUIRED_FIELD(label),
        );
      }
    });

    // 매출파트너 선택 검증
    if (hasPartner && !formData.sellingPartner) {
      errors[ERROR_GROUPS.BASIC_INFO].push(PARTNER_ERROR_MESSAGE);
    }

    // 매출 아이템 검증
    if (formData.salesByItems.length === 0) {
      errors[ERROR_GROUPS.SALES_ITEMS].push(ERROR_MESSAGES.MIN_SALES_ITEMS);
    } else {
      formData.salesByItems.forEach((item, index) => {
        const missingFields = [];
        if (!item.itemName) missingFields.push('매출품목');
        if (!item.teamName) missingFields.push('사업부');
        if (!item.amount) missingFields.push('매출금액');

        if (missingFields.length > 0) {
          errors[ERROR_GROUPS.SALES_ITEMS].push(
            ERROR_MESSAGES.ITEM_FIELDS(index + 1, missingFields),
          );
        }
      });
    }

    // 결제 매출 검증
    if (formData.salesByPayments.length === 0) {
      errors[ERROR_GROUPS.PAYMENTS].push(ERROR_MESSAGES.MIN_PAYMENTS);
    } else {
      formData.salesByPayments.forEach((payment, index) => {
        // 필수 필드 검증
        const paymentErrors = [];
        Object.entries(PAYMENT_REQUIRED_FIELDS).forEach(([field, label]) => {
          if (!payment[field]) {
            paymentErrors.push(label);
          }
        });

        if (paymentErrors.length > 0) {
          errors[ERROR_GROUPS.PAYMENTS].push(
            ERROR_MESSAGES.ITEM_FIELDS(index + 1, paymentErrors),
          );
        }

        // 매출액 숫자 검증
        if (payment.amount && !Number.isInteger(Number(payment.amount))) {
          errors[ERROR_GROUPS.PAYMENTS].push(
            `${index + 1}번 항목: ${ERROR_MESSAGES.INTEGER_ONLY}`,
          );
        }

        // 이익률/이익금 검증
        if (payment.margin) {
          const marginValue = Number(payment.margin);
          const amountValue = Number(payment.amount);

          if (payment.isProfit && marginValue >= amountValue) {
            errors[ERROR_GROUPS.PAYMENTS].push(
              `${index + 1}번 항목: ${ERROR_MESSAGES.MARGIN_LESS_THAN_AMOUNT}`,
            );
          } else if (
            !payment.isProfit &&
            (marginValue < VALIDATION_RULES.MIN_MARGIN ||
              marginValue > VALIDATION_RULES.MAX_MARGIN)
          ) {
            errors[ERROR_GROUPS.PAYMENTS].push(
              `${index + 1}번 항목: ${ERROR_MESSAGES.MARGIN_RANGE}`,
            );
          }
        }
      });
    }

    const hasErrors = Object.values(errors).some((group) => group.length > 0);

    if (hasErrors) {
      setValidationErrors(errors);
      // notification으로 에러 메시지 표시
      notification.error({
        // message: getFirstErrorMessage(errors),
        message: '매출등록오류',
        description: formatValidationErrors(errors),
        duration: 0, // 수동으로 닫을 때까지 유지
        style: {
          width: 500, // 더 넓은 알림창
        },
      });
      return false;
    }

    setValidationErrors({
      [ERROR_GROUPS.BASIC_INFO]: [],
      [ERROR_GROUPS.SALES_ITEMS]: [],
      [ERROR_GROUPS.PAYMENTS]: [],
    });
    return true;
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
    isItemsLoading,
    itemsData,
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
    // validation
    validationErrors,
    validateForm,
  };
};
