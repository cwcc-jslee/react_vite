// hooks/useFormValidation.js
// 구조개선(25.01.23)
import { useState } from 'react';
import {
  ERROR_GROUPS,
  ERROR_MESSAGES,
  REQUIRED_FIELDS,
  PAYMENT_REQUIRED_FIELDS,
  VALIDATION_RULES,
} from '../constants/validationConstants';
import { notification } from '../../../shared/services/notification';
import { formatValidationErrors } from '../utils/validationUtils';

export const useFormValidation = (formData) => {
  const [validationErrors, setValidationErrors] = useState({
    [ERROR_GROUPS.BASIC_INFO]: [],
    [ERROR_GROUPS.SALES_ITEMS]: [],
    [ERROR_GROUPS.PAYMENTS]: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 전체 폼 검증 (신규등록)
  const validateForm = (hasPartner = false) => {
    const errors = {
      [ERROR_GROUPS.BASIC_INFO]: validateBasicInfo(hasPartner),
      [ERROR_GROUPS.SALES_ITEMS]: validateSalesItems(),
      [ERROR_GROUPS.PAYMENTS]: validatePayments(formData.salesByPayments),
    };

    const hasErrors = Object.values(errors).some((group) => group.length > 0);
    if (hasErrors) {
      setValidationErrors(errors);
      showErrorNotification(errors);
      return false;
    }

    setValidationErrors({
      [ERROR_GROUPS.BASIC_INFO]: [],
      [ERROR_GROUPS.SALES_ITEMS]: [],
      [ERROR_GROUPS.PAYMENTS]: [],
    });
    return true;
  };

  // 결제매출 전용 검증
  const validatePayments = (payments) => {
    const errors = [];

    if (payments.length === 0) {
      errors.push(ERROR_MESSAGES.MIN_PAYMENTS);
      return errors;
    }

    payments.forEach((payment, index) => {
      const paymentErrors = [];

      Object.entries(PAYMENT_REQUIRED_FIELDS).forEach(([field, label]) => {
        if (!payment[field]) paymentErrors.push(label);
      });

      if (paymentErrors.length > 0) {
        errors.push(ERROR_MESSAGES.ITEM_FIELDS(index + 1, paymentErrors));
      }

      if (payment.amount && !Number.isInteger(Number(payment.amount))) {
        errors.push(`${index + 1}번 항목: ${ERROR_MESSAGES.INTEGER_ONLY}`);
      }

      validatePaymentMargin(payment, index, errors);
    });

    return errors;
  };

  // 금액 일치 확인
  const checkAmounts = () => {
    const itemAmount = parseInt(formData.itemAmount) || 0;
    const paymentAmount = parseInt(formData.paymentAmount) || 0;
    return itemAmount === paymentAmount;
  };

  return {
    validationErrors,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    validatePayments, // 결제매출 등록시 사용
    checkAmounts,
  };
};

// 내부 헬퍼 함수들
const validateBasicInfo = (hasPartner) => {
  const errors = [];

  Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
    if (!formData[field]) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD(label));
    }
  });

  if (hasPartner && !formData.sellingPartner) {
    errors.push(PARTNER_ERROR_MESSAGE);
  }

  return errors;
};

const validateSalesItems = () => {
  const errors = [];

  if (formData.salesByItems.length === 0) {
    errors.push(ERROR_MESSAGES.MIN_SALES_ITEMS);
    return errors;
  }

  formData.salesByItems.forEach((item, index) => {
    const missingFields = [];
    if (!item.itemName) missingFields.push('매출품목');
    if (!item.teamName) missingFields.push('사업부');
    if (!item.amount) missingFields.push('매출금액');

    if (missingFields.length > 0) {
      errors.push(ERROR_MESSAGES.ITEM_FIELDS(index + 1, missingFields));
    }
  });

  return errors;
};

const validatePaymentMargin = (payment, index, errors) => {
  if (!payment.margin) return;

  const marginValue = Number(payment.margin);
  const amountValue = Number(payment.amount);

  if (payment.isProfit && marginValue >= amountValue) {
    errors.push(
      `${index + 1}번 항목: ${ERROR_MESSAGES.MARGIN_LESS_THAN_AMOUNT}`,
    );
  } else if (
    !payment.isProfit &&
    (marginValue < VALIDATION_RULES.MIN_MARGIN ||
      marginValue > VALIDATION_RULES.MAX_MARGIN)
  ) {
    errors.push(`${index + 1}번 항목: ${ERROR_MESSAGES.MARGIN_RANGE}`);
  }
};

const showErrorNotification = (errors) => {
  notification.error({
    message: '매출등록오류',
    description: formatValidationErrors(errors),
    duration: 0,
    style: { width: 500 },
  });
};
