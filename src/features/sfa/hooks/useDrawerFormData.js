// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';
// import { useSelectData } from '../../../shared/hooks/useSelectData';
// import { QUERY_KEYS } from '../../../shared/utils/queryKeys';
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';

/**
 * 매출 아이템 초기 상태
 */
const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
  productType: '',
  department: '',
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
  customer: '',
  sfaClassification: '',
  itemAmount: '',
  paymentAmount: '',
  description: '',
  salesByItems: [],
  salesByPayments: [],
};

/**
 * Drawer 폼 데이터 관리 Hook
 * @returns {Object} 폼 데이터 및 핸들러 함수들
 */
export const useDrawerFormData = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 매출품목 데이터 관리
  const [itemsData, setItemsData] = useState({ data: [] });
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  // 매출 금액 합계 계산 (매출아이템, 결제매출 통합)
  useEffect(() => {
    const itemTotal = formData.salesByItems.reduce((sum, item) => {
      return sum + (parseInt(item.amount) || 0);
    }, 0);

    const paymentTotal = formData.salesByPayments.reduce((sum, payment) => {
      return sum + (parseInt(payment.amount) || 0);
    }, 0);

    setFormData((prev) => ({
      ...prev,
      itemAmount: itemTotal.toString(),
      paymentAmount: paymentTotal.toString(),
    }));
  }, [formData.salesByItems, formData.salesByPayments]);

  // 매출품목 데이터 조회 함수
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
            sfa_classification: {
              id: { $eq: classificationId },
            },
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

  // 결제구분, 매출확률 데이터 상태 추가
  const [paymentMethodData, setPaymentMethodData] = useState({ data: [] });
  const [percentageData, setPercentageData] = useState({ data: [] });
  const [isPaymentDataLoading, setIsPaymentDataLoading] = useState(false);

  /**
   * 코드북 데이터 조회 함수
   * @param {string} type - 코드북 타입
   * @returns {Promise} 코드북 데이터
   */
  const fetchCodebook = async (type) => {
    const queryObj = {
      fields: ['code', 'name', 'sort'],
      populate: {
        codetype: {
          fields: ['type', 'name'],
        },
      },
      filters: {
        $and: [
          { used: { $eq: true } },
          {
            codetype: {
              type: { $eq: type },
            },
          },
        ],
      },
      sort: ['sort:asc'],
      pagination: {
        start: 0,
        limit: 50,
      },
    };

    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    const response = await apiClient.get(`/api/codebooks?${query}`);
    return response.data;
  };

  /**
   * 결제매출 관련 데이터 조회
   * @returns {Promise} 결제구분, 매출확률 데이터
   */
  const fetchPayments = async () => {
    setIsPaymentDataLoading(true);
    try {
      // 결제구분과 매출확률 데이터를 병렬로 조회
      const [paymentMethods, percentages] = await Promise.all([
        fetchCodebook('re_payment_method'),
        fetchCodebook('sfa_percentage'),
      ]);

      setPaymentMethodData(paymentMethods);
      setPercentageData(percentages);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      // 에러 발생시 빈 배열로 초기화
      setPaymentMethodData({ data: [] });
      setPercentageData({ data: [] });
    } finally {
      setIsPaymentDataLoading(false);
    }
  };

  // 기본 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 매출구분 변경시
    if (name === 'sfaClassification' && value) {
      fetchItems(value);
      // 매출품목 초기화
      setFormData((prev) => ({
        ...prev,
        salesByItems: prev.salesByItems.map((item) => ({
          ...item,
          productType: '',
        })),
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 고객사 선택 핸들러
  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customer: customer.id,
      // customer: customer.name,
      // customerId: customer.id,
    }));
    if (errors.customer) {
      setErrors((prev) => ({
        ...prev,
        customer: undefined,
      }));
    }
  };

  // 매출 아이템 관련 핸들러
  const handleSalesItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.salesByItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return {
        ...prev,
        salesByItems: updatedItems,
      };
    });
  };

  // 매출 아이템 추가 (최대 3개)
  const handleAddSalesItem = () => {
    if (formData.salesByItems.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesByItems: [...prev.salesByItems, { ...initialSalesByItem }],
      }));
    }
  };

  // 매출 아이템 삭제
  const handleRemoveSalesItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesByItems: prev.salesByItems.filter((_, i) => i !== index),
    }));
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
      // 데이터 로딩 중이거나 이미 데이터가 있는 경우 API 호출 스킵
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

  // 사업부 매출 유효성 검사사
  const validateSalesItems = (items) => {
    const errors = [];

    items.forEach((item, index) => {
      const itemErrors = [];

      if (!item.productType) {
        itemErrors.push('매출품목');
      }
      if (!item.department) {
        itemErrors.push('사업부');
      }
      if (!item.amount) {
        itemErrors.push('매출금액');
      }

      if (itemErrors.length > 0) {
        errors.push(
          `[매출항목 ${index + 1}] ${itemErrors.join(', ')}을(를) 입력해주세요`,
        );
      }
    });

    return errors;
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 필수 필드 검사
    if (!formData.sfaSalesType) {
      newErrors.sfaSalesType = '매출유형을 선택해주세요';
      isValid = false;
    }
    if (!formData.sfaClassification) {
      newErrors.sfaClassification = '매출구분을 선택해주세요';
      isValid = false;
    }
    if (!formData.customer) {
      newErrors.customer = '고객사를 선택해주세요';
      isValid = false;
    }
    if (!formData.name) {
      newErrors.name = '건명을 입력해주세요';
      isValid = false;
    }

    // 매출 아이템 검사 (하나 이상 필수)
    if (formData.salesByItems.length === 0) {
      newErrors.salesItems = '최소 하나의 사업부 매출을 등록해주세요';
      isValid = false;
    } else {
      const salesItemErrors = validateSalesItems(formData.salesByItems);
      if (salesItemErrors.length > 0) {
        newErrors.salesItems = salesItemErrors.join('\n');
        isValid = false;
      }
    }

    // 결제매출 검사
    if (formData.salesByPayments.length === 0) {
      newErrors.salesItems = '최소 하나의 결제 매출을 등록해주세요';
      isValid = false;
    } else {
      formData.salesByPayments.forEach((payment, index) => {
        if (!payment.paymentType) {
          newErrors[`salesPayments.${index}.paymentType`] =
            '결제구분을 선택해주세요';
          isValid = false;
        }
        if (!payment.amount) {
          newErrors[`salesPayments.${index}.amount`] = '매출액을 입력해주세요';
          isValid = false;
        }
        if (payment.isProfit && !payment.margin) {
        }
      });
    }

    setErrors(newErrors);
    return isValid;
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
    // 매출품목 관련 상태 추가
    isItemsLoading,
    itemsData,
    // 결제매출 관련 데이터 추가
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
  };
};
