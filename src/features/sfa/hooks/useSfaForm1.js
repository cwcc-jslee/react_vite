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
import {
  createTeamAllocationTemplate,
  autoAllocateByRatio,
  autoAllocateEqually,
} from '../utils/teamAllocationUtils';
import { notification } from '@shared/services/notification';

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

  // === 팀 모드 관련 핸들러 ===
  /**
   * 단일/다중 사업부 모드 토글
   */
  const handleTeamModeToggle = useCallback(
    (isMulti) => {
      console.log('🔄 [handleTeamModeToggle] 호출됨:', { isMulti });
      const currentItems = form.data.sfaByItems || [];

      if (isMulti) {
        // 단일 → 다중: 2개 항목 자동 생성
        if (currentItems.length === 0) {
          // 처음부터 다중 선택: 2개 빈 항목 생성
          actions.form.updateField('sfaByItems', [
            { ...initialSalesByItem },
            { ...initialSalesByItem },
          ]);
        } else if (currentItems.length === 1) {
          // 단일에서 다중으로 전환: 기존 1개 + 새로운 1개
          actions.form.updateField('sfaByItems', [
            currentItems[0],
            { ...initialSalesByItem },
          ]);
        }
        // 이미 2개 이상이면 유지
      } else {
        // 다중 → 단일: 1개 항목만 유지
        if (currentItems.length === 0) {
          // 빈 상태: 1개 빈 항목 생성
          actions.form.updateField('sfaByItems', [{ ...initialSalesByItem }]);
        } else {
          // 첫 번째 항목만 유지
          actions.form.updateField('sfaByItems', [currentItems[0]]);
        }
      }

      // 결제 매출 초기화 (팀 구성 변경)
      actions.form.updateField('sfaByPayments', []);
      actions.form.updateField('isMultiTeam', isMulti);

      console.log('✅ [handleTeamModeToggle] 완료:', {
        isMulti,
        itemsCount: form.data.sfaByItems?.length,
      });
    },
    [actions.form, form.data.sfaByItems],
  );

  /**
   * 결제 추가 시 팀 할당 자동 생성 (개선)
   */
  const handleAddPaymentWithAllocation = useCallback(
    (isSameBilling, customer) => {
      const isMultiTeam = form.data.isMultiTeam;
      const sfaByItems = form.data.sfaByItems || [];

      // 사업부 매출 정보 입력 확인
      const hasValidItems =
        sfaByItems.length > 0 &&
        sfaByItems.every(
          (item) => item.teamId && item.itemId && item.amount > 0,
        );

      if (!hasValidItems) {
        notification.warning({
          message: '알림',
          description: '사업부 매출 정보를 먼저 입력해주세요.',
        });
        return;
      }

      const fieldName = 'sfaByPayments';
      const currentPayments = form.data[fieldName] || [];

      if (currentPayments.length >= FORM_LIMITS.MAX_PAYMENTS) return;

      const newPayment = { ...initialSfaByPayment };

      if (isSameBilling && customer?.id) {
        newPayment.revenueSource = customer;
      }

      // 팀 할당 자동 생성
      if (isMultiTeam) {
        // 다중 사업부: 템플릿 생성 (금액은 0)
        newPayment.teamAllocations = createTeamAllocationTemplate(sfaByItems);
      } else {
        // 단일 사업부: 단일 할당
        if (sfaByItems[0]) {
          newPayment.teamAllocations = [
            {
              teamId: sfaByItems[0].teamId,
              teamName: sfaByItems[0].teamName,
              itemId: sfaByItems[0].itemId,
              itemName: sfaByItems[0].itemName,
              allocatedAmount: 0,
            },
          ];
        }
      }

      const newPayments = [...currentPayments, newPayment];
      actions.form.updateField(fieldName, newPayments);
    },
    [actions.form, form.data],
  );

  /**
   * 결제 금액 변경 시 처리
   */
  const handlePaymentAmountChange = useCallback(
    (paymentIndex, newAmount) => {
      console.log('🔄 [handlePaymentAmountChange] 호출됨:', { paymentIndex, newAmount });

      const isMultiTeam = form.data.isMultiTeam;
      const sfaByItems = form.data.sfaByItems || [];
      const currentPayments = [...(form.data.sfaByPayments || [])];
      const payment = { ...currentPayments[paymentIndex] }; // 깊은 복사

      payment.amount = newAmount;

      if (!isMultiTeam) {
        // 단일 사업부: 자동 동기화
        if (payment.teamAllocations && payment.teamAllocations[0]) {
          payment.teamAllocations = [
            {
              ...payment.teamAllocations[0],
              allocatedAmount: parseFloat(newAmount || 0),
            },
          ];
        }
      }
      // 다중 사업부는 사용자가 직접 배분하거나 버튼 클릭

      currentPayments[paymentIndex] = payment; // 업데이트된 객체로 교체

      console.log('✅ [handlePaymentAmountChange] Redux 업데이트:', currentPayments[paymentIndex]);
      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data],
  );

  /**
   * 팀 할당 수동 변경
   */
  const handleAllocationChange = useCallback(
    (paymentIndex, teamIndex, amount) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      const payment = currentPayments[paymentIndex];

      if (!payment.teamAllocations || !payment.teamAllocations[teamIndex]) {
        return;
      }

      payment.teamAllocations[teamIndex].allocatedAmount = parseFloat(
        amount || 0,
      );

      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data.sfaByPayments],
  );

  /**
   * 자동 비율 배분
   */
  const handleAutoAllocateByRatio = useCallback(
    (paymentIndex) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      const payment = currentPayments[paymentIndex];
      const sfaByItems = form.data.sfaByItems || [];

      payment.teamAllocations = autoAllocateByRatio(
        parseFloat(payment.amount || 0),
        sfaByItems,
      );

      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data],
  );

  /**
   * 균등 배분
   */
  const handleEqualDistribute = useCallback(
    (paymentIndex) => {
      const currentPayments = [...(form.data.sfaByPayments || [])];
      const payment = currentPayments[paymentIndex];
      const sfaByItems = form.data.sfaByItems || [];

      payment.teamAllocations = autoAllocateEqually(
        parseFloat(payment.amount || 0),
        sfaByItems,
      );

      actions.form.updateField('sfaByPayments', currentPayments);
    },
    [actions.form, form.data],
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
    selectPaymentForEdit,
    resetPaymentForm,

    // 팀 모드 및 할당 관련 핸들러
    handleTeamModeToggle,
    handleAddPaymentWithAllocation,
    handlePaymentAmountChange,
    handleAllocationChange,
    handleAutoAllocateByRatio,
    handleEqualDistribute,

    // 검증 함수
    validateForm: validateFormData,
    validatePaymentForm: validatePaymentFormData,
    checkAmounts: checkAmountsData,

    // 유틸리티
    loadItems,
  };
};
