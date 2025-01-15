// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';

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

  // 기본 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleAddSalesPayment = () => {
    if (formData.salesByPayments.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesByPayments: [
          ...prev.salesByPayments,
          { ...initialSalesByPayment },
        ],
      }));
    }
  };

  const handleRemoveSalesPayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesByPayments: prev.salesByPayments.filter((_, i) => i !== index),
    }));
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
      formData.salesByItems.forEach((item, index) => {
        if (!item.productType) {
          newErrors[`salesItems.${index}.productType`] =
            '매출품목을 선택해주세요';
          isValid = false;
        }
        if (!item.department) {
          newErrors[`salesItems.${index}.department`] = '사업부를 선택해주세요';
          isValid = false;
        }
        if (!item.amount) {
          newErrors[`salesItems.${index}.amount`] = '금액을 입력해주세요';
          isValid = false;
        }
      });
    }

    // 결제매출 검사
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
        newErrors[`salesPayments.${index}.margin`] = '이익/마진을 입력해주세요';
        isValid = false;
      }
    });

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
  };
};
