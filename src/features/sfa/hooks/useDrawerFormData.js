// src/features/sfa/hooks/useDrawerFormData.js
import { useState, useEffect } from 'react';

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
  customer: '',
  sfaClassification: '',
  itemAmount: '',
  totalItemAmount: '',
  description: '',
  salesByItems: [],
  salesByPayments: [],
};

export const useDrawerFormData = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // salesItems의 amount 합계 계산 및 totalAmount 업데이트
  useEffect(() => {
    const calculateTotalAmount = () => {
      const total = formData.salesItems.reduce((sum, item) => {
        // 이미 숫자로만 저장되어 있으므로 단순 변환만
        return sum + (parseInt(item.amount) || 0);
      }, 0);

      setFormData((prev) => ({
        ...prev,
        itemAmount: total.toString(), // 숫자로만 저장
        totalItemAmount:
          prev.totalItemAmount === '' ? total.toString() : prev.totalItemAmount,
      }));
    };

    calculateTotalAmount();
  }, [formData.salesItems]);

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

  // 매출ITEM 핸들러
  const handleSalesItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.salesItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return {
        ...prev,
        salesItems: updatedItems,
      };
    });
  };

  const handleAddSalesItem = () => {
    if (formData.salesItems.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesItems: [...prev.salesItems, { ...initialSalesByItem }],
      }));
    }
  };

  const handleRemoveSalesItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesItems: prev.salesItems.filter((_, i) => i !== index),
    }));
  };

  // 매출항목 핸들러
  const handleSalesPaymentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedEntries = [...prev.salesPayments];
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value,
      };
      return {
        ...prev,
        salesPayments: updatedEntries,
      };
    });
  };

  const handleAddSalesPayment = () => {
    if (formData.salesPayments.length < 3) {
      setFormData((prev) => ({
        ...prev,
        salesPayments: [...prev.salesPayments, { ...initialSalesByPayment }],
      }));
    }
  };

  const handleRemoveSalesPayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesPayments: prev.salesPayments.filter((_, i) => i !== index),
    }));
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 기본 필드 검사
    if (!formData.sfaSalesType)
      newErrors.sfaSalesType = '매출유형을 선택해주세요';
    if (!formData.customer) newErrors.customer = '고객사를 선택해주세요';
    if (!formData.name) newErrors.name = '건명을 입력해주세요';
    if (!formData.sfaClassification)
      newErrors.sfaClassification = '매출구분을 선택해주세요';
    if (!formData.totalItemAmount)
      newErrors.totalItemAmount = 'ITEM 매출액을 입력해주세요';

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
  };
};
