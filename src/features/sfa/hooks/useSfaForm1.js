import React, { useCallback, useMemo, useState } from 'react';
import { apiCommon } from '../../../shared/api/apiCommon';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { notification } from '../../../shared/services/notification';
import { sfaApi } from '../api/sfaApi';
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
  initialSalesByPayment,
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
        // salesByItems의 itemName 초기화
        const currentItems = [...(form.data.salesByItems || [])];
        const updatedItems = currentItems.map((item) => ({
          ...item,
          itemName: '',
        }));
        actions.form.updateField('salesByItems', updatedItems);
      }

      // 에러 정리
      clearFieldError(name);
    },
    [actions.form, loadItems, clearFieldError, form.data.salesByItems],
  );

  const handleProjectToggle = useCallback(() => {
    const currentValue = form.data.isProject || false;
    actions.form.updateField('isProject', !currentValue);
  }, [actions.form, form.data.isProject]);

  const handleCustomerTypeChange = useCallback(
    (isSame) => {
      actions.form.updateField('isSameBilling', isSame);
      actions.form.updateField('salesByPayments', []);
    },
    [actions.form, form.data.isSameBilling],
  );

  const toggleIsSameBilling = useCallback(() => {
    const currentValue = form.data.isSameBilling || false;
    actions.form.updateField('isSameBilling', !currentValue);
    actions.form.updateField('salesByPayments', []);
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
    actions.form.resetForm();
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
    const currentItems = form.data.salesByItems || [];
    if (currentItems.length < FORM_LIMITS.MAX_SALES_ITEMS) {
      const newItems = [...currentItems, { ...initialSalesByItem }];
      actions.form.updateField('salesByItems', newItems);
    }
  }, [actions.form, form.data.salesByItems]);

  const handleRemoveSalesItem = useCallback(
    (index) => {
      const currentItems = [...(form.data.salesByItems || [])];
      currentItems.splice(index, 1);
      actions.form.updateField('salesByItems', currentItems);

      // 관련 에러 정리
      clearFieldError(`salesItems.${index}.productType`);
      clearFieldError(`salesItems.${index}.teamName`);
      clearFieldError(`salesItems.${index}.amount`);
    },
    [actions.form, clearFieldError, form.data.salesByItems],
  );

  const handleSalesItemChange = useCallback(
    (index, fields, values) => {
      const currentItems = [...(form.data.salesByItems || [])];
      if (typeof fields === 'string') {
        currentItems[index] = { ...currentItems[index], [fields]: values };
      } else if (typeof fields === 'object') {
        currentItems[index] = { ...currentItems[index], ...fields };
      }
      actions.form.updateField('salesByItems', currentItems);
    },
    [actions.form, form.data.salesByItems],
  );

  // === 결제 관련 핸들러 ===
  const handleAddPayment = useCallback(
    async (isSameBilling, customer) => {
      const currentPayments = form.data.salesByPayments || [];
      if (currentPayments.length >= FORM_LIMITS.MAX_PAYMENTS) return;

      const newPayment = { ...initialSalesByPayment };
      // isSameBilling이 true이고 customer가 있으면 revenueSource 설정
      if (isSameBilling && customer?.id) {
        newPayment.revenueSource = customer;
      }

      const newPayments = [...currentPayments, newPayment];
      actions.form.updateField('salesByPayments', newPayments);
    },
    [actions.form, form.data.salesByPayments],
  );

  const handleRemovePayment = useCallback(
    (index) => {
      const currentPayments = [...(form.data.salesByPayments || [])];
      currentPayments.splice(index, 1);
      actions.form.updateField('salesByPayments', currentPayments);
    },
    [actions.form, form.data.salesByPayments],
  );

  const handlePaymentChange = useCallback(
    (index, fieldOrFields, value) => {
      console.log('🔧 [useSfaForm1] handlePaymentChange called:', {
        index,
        fieldOrFields,
        value,
        currentPayments: form.data.salesByPayments,
        targetPayment: form.data.salesByPayments?.[index],
      });

      const currentPayments = [...(form.data.salesByPayments || [])];
      const oldPayment = { ...currentPayments[index] };

      // 객체 형태의 여러 필드 업데이트 지원
      if (typeof fieldOrFields === 'object') {
        currentPayments[index] = {
          ...currentPayments[index],
          ...fieldOrFields,
        };
        console.log('🔧 [useSfaForm1] Multiple fields update:', {
          index,
          updates: fieldOrFields,
          oldPayment,
          newPayment: currentPayments[index],
        });
      } else {
        // 단일 필드 업데이트
        currentPayments[index] = {
          ...currentPayments[index],
          [fieldOrFields]: value,
        };
        console.log('🔧 [useSfaForm1] Single field update:', {
          index,
          field: fieldOrFields,
          oldValue: oldPayment[fieldOrFields],
          newValue: value,
          oldPayment,
          newPayment: currentPayments[index],
        });
      }

      actions.form.updateField('salesByPayments', currentPayments);
    },
    [actions.form, form.data.salesByPayments],
  );

  const handleRevenueSourceSelect = useCallback(
    (customer, paymentIndex) => {
      const currentPayments = [...(form.data.salesByPayments || [])];
      currentPayments[paymentIndex] = {
        ...currentPayments[paymentIndex],
        revenueSource: { id: customer.id, name: customer.name },
      };
      actions.form.updateField('salesByPayments', currentPayments);
    },
    [actions.form, form.data.salesByPayments],
  );

  // === 결제매출 수정 관련 ===
  const togglePaymentSelection = useCallback(
    async (item) => {
      // drawer.data가 존재하지 않으면 early return
      if (!drawer.data?.sfaByPayments) {
        console.warn('drawer.data.sfaByPayments가 존재하지 않습니다.');
        return;
      }

      const payment = drawer.data.sfaByPayments.find(
        (p) => p.documentId === item.documentId,
      );

      if (payment) {
        actions.form.updateField('salesByPayments', [
          {
            id: payment.id,
            documentId: payment.documentId,
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
            memo: payment.memo || '',
            sfa: payment.sfa || null,
          },
        ]);
      }
    },
    [drawer.data?.sfaByPayments, actions.form],
  );

  const resetPaymentForm = useCallback(() => {
    actions.form.updateField('salesByPayments', []);
  }, [actions.form]);

  const processPaymentSubmit = useCallback(
    async (processMode, targetId, sfaId, formData) => {
      try {
        actions.form.setSubmitting(true);
        let response;
        let actionDescription;

        switch (processMode) {
          case 'create':
            response = await sfaSubmitService.addSfaPayment(
              targetId,
              formData.salesByPayments,
            );
            actionDescription = '등록';
            break;
          case 'update':
            response = await sfaSubmitService.updateSfaPayment(
              targetId,
              formData.salesByPayments[0],
            );
            actionDescription = '수정';
            break;
          case 'delete':
            response = await sfaSubmitService.deleteSfaPayment(targetId);
            actionDescription = '삭제';
            break;
          default:
            throw new Error('잘못된 처리 모드입니다.');
        }

        notification.success({
          message: '저장 성공',
          description: `성공적으로 ${actionDescription}되었습니다.`,
        });

        const updateData = await sfaApi.getSfaDetail(sfaId);
        uiActions.drawer.update({
          controlMode: 'view',
          data: updateData.data[0],
        });
      } catch (error) {
        const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';
        actions.form.setErrors({
          ...(form.errors || {}),
          submit: errorMessage,
        });
        notification.error({
          message: '저장 실패',
          description: errorMessage,
        });
      } finally {
        actions.form.setSubmitting(false);
      }
    },
    [actions.form, uiActions.drawer],
  );

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
    togglePaymentSelection,
    resetPaymentForm,

    // 제출 로직
    processPaymentSubmit,

    // 검증 함수
    validateForm: validateFormData,
    validatePaymentForm: validatePaymentFormData,
    checkAmounts: checkAmountsData,

    // 유틸리티
    loadItems,
  };
};
