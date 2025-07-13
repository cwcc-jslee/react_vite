import React, { useCallback, useMemo, useState } from 'react';
import { apiCommon } from '../../../shared/api/apiCommon';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import { useSfaStore } from './useSfaStore';
import {
  validateForm,
  validatePaymentForm,
  checkAmounts,
} from '../utils/formValidation';
import {
  FORM_LIMITS,
  initialSalesByItem,
  initialSfaByPayment,
  INITIAL_PAYMENT_ID_STATE,
} from '../constants/formInitialState';

/**
 * useSfaForm1: SFA 폼 관리를 위한 통합 커스텀 훅
 * 상태 관리는 useSfaStore를 통해 하고, 이 훅은 비즈니스 로직과 핸들러만 제공
 */
export const useSfaForm1 = () => {
  // === UI 상태 관리 (drawer만 필요) ===
  const { drawer, actions: uiActions } = useUiStore();

  // === 폼 상태는 직접 노출하지 않고 actions만 제공 ===
  const { form, actions } = useSfaStore();

  // === 로컬 상태 관리 ===
  const [itemsData, setItemsData] = useState({ data: [] });
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  // const [selectedPaymentIds, setSelectedPaymentIds] = useState(
  //   INITIAL_PAYMENT_ID_STATE,
  // );

  // === 아이템 데이터 조회 ===
  const loadItems = useCallback(async (classificationId) => {
    if (!classificationId) {
      setItemsData({ data: [] });
      return;
    }
    setIsItemsLoading(true);
    try {
      const response = await apiCommon.getSfaItems(classificationId);
      setItemsData(response);
    } catch (error) {
      console.error('아이템 로딩 실패:', error);
      setItemsData({ data: [] });
    } finally {
      setIsItemsLoading(false);
    }
  }, []);

  // === 유틸리티 함수 ===
  const clearFieldError = useCallback(
    (fieldName) => {
      const currentErrors = form.errors || {};
      if (currentErrors[fieldName]) {
        const newErrors = { ...currentErrors };
        delete newErrors[fieldName];
        actions.form.setErrors(newErrors);
      }
    },
    [form.errors, actions.form],
  );

  // === 메모이제이션된 핸들러 함수들 ===
  const updateFormField = useCallback(
    (eventOrName, value) => {
      let name, fieldValue;

      // 이벤트 객체인지 확인
      if (eventOrName && eventOrName.target) {
        name = eventOrName.target.name;
        fieldValue = eventOrName.target.value;
      } else {
        // 직접 name, value 전달
        name = eventOrName;
        fieldValue = value;
      }

      actions.form.updateField(name, fieldValue);

      // 특별한 로직 처리
      if (name === 'sfaClassification' && fieldValue) {
        loadItems(fieldValue.id || fieldValue);
        // sfaByItems의 itemName 초기화
        const currentItems = [...(form.data.sfaByItems || [])];
        const updatedItems = currentItems.map((item) => ({
          ...item,
          itemName: '',
        }));
        actions.form.updateField('sfaByItems', updatedItems);
      }

      // 에러 정리
      clearFieldError(name);
    },
    [actions.form, loadItems, clearFieldError, form.data.sfaByItems],
  );

  const handleProjectToggle = useCallback(() => {
    const currentValue = form.data.isProject || false;
    actions.form.updateField('isProject', !currentValue);
  }, [actions.form, form.data.isProject]);

  const handleCustomerTypeChange = useCallback(
    (isSame) => {
      actions.form.updateField('isSameBilling', isSame);
      actions.form.updateField('sfaByPayments', []);
    },
    [actions.form, form.data.isSameBilling],
  );

  const toggleIsSameBilling = useCallback(() => {
    const currentValue = form.data.isSameBilling || false;
    actions.form.updateField('isSameBilling', !currentValue);
    actions.form.updateField('sfaByPayments', []);
  }, [actions.form, form.data.isSameBilling]);

  const handleCustomerSelect = useCallback(
    (customer) => {
      actions.form.updateField('customer', {
        id: customer.id,
        name: customer.name,
      });
      clearFieldError('customer');
    },
    [actions.form, clearFieldError],
  );

  const resetForm = useCallback(() => {
    actions.form.reset();
  }, [actions.form]);

  const setFieldValue = useCallback(
    (fieldName, value) => {
      actions.form.updateField(fieldName, value);
    },
    [actions.form],
  );

  const setFieldValues = useCallback(
    (values) => {
      Object.entries(values).forEach(([key, value]) => {
        actions.form.updateField(key, value);
      });
    },
    [actions.form],
  );

  // === 판매 아이템 관련 핸들러 ===
  const handleAddSalesItem = useCallback(() => {
    const currentItems = form.data.sfaByItems || [];
    if (currentItems.length < FORM_LIMITS.MAX_SALES_ITEMS) {
      const newItems = [...currentItems, { ...initialSalesByItem }];
      actions.form.updateField('sfaByItems', newItems);
    }
  }, [actions.form, form.data.sfaByItems]);

  const handleRemoveSalesItem = useCallback(
    (index) => {
      const currentItems = [...(form.data.sfaByItems || [])];
      currentItems.splice(index, 1);
      actions.form.updateField('sfaByItems', currentItems);

      // 관련 에러 정리
      clearFieldError(`salesItems.${index}.productType`);
      clearFieldError(`salesItems.${index}.teamName`);
      clearFieldError(`salesItems.${index}.amount`);
    },
    [actions.form, clearFieldError, form.data.sfaByItems],
  );

  const handleSalesItemChange = useCallback(
    (index, fields, values) => {
      const currentItems = [...(form.data.sfaByItems || [])];
      if (typeof fields === 'string') {
        currentItems[index] = { ...currentItems[index], [fields]: values };
      } else if (typeof fields === 'object') {
        currentItems[index] = { ...currentItems[index], ...fields };
      }
      actions.form.updateField('sfaByItems', currentItems);
    },
    [actions.form, form.data.sfaByItems],
  );

  // === 결제 관련 핸들러 ===
  const handleAddPayment = useCallback(
    async (isSameBilling, customer) => {
      // drawer.mode에 따라 업데이트할 필드와 데이터 결정
      const isEditMode = drawer.mode === 'edit';
      const fieldName = isEditMode ? 'sfaDraftPayments' : 'sfaByPayments';
      const currentPayments = form.data[fieldName] || [];
      const maxLimit = isEditMode ? 3 : FORM_LIMITS.MAX_PAYMENTS;

      if (currentPayments.length >= maxLimit) return;

      const newPayment = { ...initialSfaByPayment };
      // isSameBilling이 true이고 customer가 있으면 revenueSource 설정
      if (isSameBilling && customer?.id) {
        newPayment.revenueSource = customer;
      }

      const newPayments = [...currentPayments, newPayment];
      actions.form.updateField(fieldName, newPayments);
    },
    [
      actions.form,
      form.data.sfaByPayments,
      form.data.sfaDraftPayments,
      drawer.mode,
    ],
  );

  const handleRemovePayment = useCallback(
    (index) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      currentPayments.splice(index, 1);
      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data.sfaByPayments],
  );

  const handlePaymentChange = useCallback(
    (index, fieldOrFields, value) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      const oldPayment = { ...currentPayments[index] };

      // 객체 형태의 여러 필드 업데이트 지원
      if (typeof fieldOrFields === 'object') {
        currentPayments[index] = {
          ...currentPayments[index],
          ...fieldOrFields,
        };
      } else {
        // 단일 필드 업데이트
        currentPayments[index] = {
          ...currentPayments[index],
          [fieldOrFields]: value,
        };
      }

      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data.sfaByPayments],
  );

  const handleRevenueSourceSelect = useCallback(
    (customer, paymentIndex) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      currentPayments[paymentIndex] = {
        ...currentPayments[paymentIndex],
        revenueSource: { id: customer.id, name: customer.name },
      };
      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data.sfaByPayments],
  );

  // === 결제매출 수정 관련 ===
  /**
   * 특정 결제매출을 수정용으로 선택하여 sfaDraftPayments에 로드
   * @param {Object} paymentSelection - 선택된 결제매출 정보 {documentId, id}
   */
  const selectPaymentForEdit = useCallback(
    async (paymentSelection) => {
      // drawer.data가 존재하지 않으면 early return
      if (!drawer.data?.sfaByPayments) {
        console.warn('drawer.data.sfaByPayments가 존재하지 않습니다.');
        return;
      }

      const payment = drawer.data.sfaByPayments.find(
        (p) => p.documentId === paymentSelection,
      );

      if (payment) {
        // 수정 기능이므로 sfaDraftPayments에 최대 1개만 업데이트
        const selectedPayment = {
          id: payment.id,
          documentId: payment.documentId,
          revenueSource: payment.revenueSource || null,
          billingType: payment.billingType || '',
          isConfirmed: payment.isConfirmed || false,
          probability: payment.probability?.toString() || '',
          amount: payment.amount?.toString() || '',
          profitAmount: payment.profitAmount?.toString() || '',
          isProfit: payment.profitConfig?.isProfit || false,
          marginProfitValue:
            payment.profitConfig?.marginProfitValue?.toString() || '',
          recognitionDate: payment.recognitionDate || '',
          scheduledDate: payment.scheduledDate || '',
          paymentLabel: payment.paymentLabel || '',
          memo: payment.memo || '',
        };

        // sfaDraftPayments에 단일 객체로 업데이트 (최대 1개)
        actions.form.updateField('sfaDraftPayments', [selectedPayment]);
      }
    },
    [drawer.data?.sfaByPayments, actions.form],
  );

  const resetPaymentForm = useCallback(() => {
    actions.form.updateField('sfaByPayments', []);
  }, [actions.form]);

  // === 검증 함수들 ===
  const validateFormData = useCallback((formData, hasPartner) => {
    return validateForm(formData, hasPartner);
  }, []);

  const validatePaymentFormData = useCallback((payments) => {
    return validatePaymentForm(payments);
  }, []);

  const checkAmountsData = useCallback((formData) => {
    return checkAmounts(formData);
  }, []);

  // === 반환 값 ===
  return {
    // 상태
    itemsData,
    isItemsLoading,
    // selectedPaymentIds,

    // 기본 핸들러
    updateFormField,
    handleProjectToggle,
    handleCustomerTypeChange,
    toggleIsSameBilling,
    handleCustomerSelect,
    resetForm,
    setFieldValue,
    setFieldValues,

    // 판매 아이템 핸들러
    handleAddSalesItem,
    handleRemoveSalesItem,
    handleSalesItemChange,

    // 결제 핸들러
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleRevenueSourceSelect,

    // 결제매출 수정 관련
    selectPaymentForEdit,
    resetPaymentForm,

    // 검증 함수
    validateForm: validateFormData,
    validatePaymentForm: validatePaymentFormData,
    checkAmounts: checkAmountsData,

    // 유틸리티
    loadItems,
  };
};
