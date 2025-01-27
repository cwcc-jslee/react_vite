// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';

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

  return {
    handleSalesItemChange,
    handleAddSalesItem, //useFormActions
    handleRemoveSalesItem, //useFormActions
    handleSalesPaymentChange,
    handleAddSalesPayment, //useFormActions
    handleRemoveSalesPayment, //useFormActions
    isItemsLoading,
    itemsData,
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
    handleChange,
  };
};
