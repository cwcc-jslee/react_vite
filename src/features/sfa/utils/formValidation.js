/**
 * SFA 폼 검증 관련 유틸리티 함수들
 *
 * 주요 기능:
 * 1. validateForm: 전체 폼 데이터 검증
 *    - 기본 정보 검증 (매출유형, 품목유형, 고객사 등)
 *    - 매출 항목 검증 (품목, 사업부, 금액 등)
 *    - 결제 매출 검증 (결제방법, 금액, 마진 등)
 *
 * 2. validatePaymentForm: 결제 매출 폼만 검증
 *    - 결제 매출 필수 항목 검증
 *    - 금액 정수 여부 검증
 *    - 마진 검증 (이익/비용)
 *
 * 3. checkAmounts: 사업부매출금액과 결제매출금액 일치 여부 확인
 *
 * 4. showErrorNotification: 검증 오류 알림 표시
 *
 * @module formValidation
 */

import {
  ERROR_GROUPS,
  ERROR_MESSAGES,
  REQUIRED_FIELDS,
  PAYMENT_REQUIRED_FIELDS,
  VALIDATION_RULES,
} from '../constants/validationConstants';
import { notification } from '../../../shared/services/notification';
import { formatValidationErrors } from './validationUtils';

// 내부 헬퍼 함수들
const validateBasicInfo = (formData) => {
  const errors = [];

  // 기본 필수 필드 검증
  Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
    if (!formData[field]) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD(label));
    }
  });

  // 고객사 검증
  const { isSameBilling, sfaCustomers } = formData;

  if (isSameBilling) {
    // 매출/고객 동일인 경우
    if (!sfaCustomers || sfaCustomers.length !== 1) {
      errors.push('매출처/고객사 정보가 올바르지 않습니다.');
      return errors;
    }

    const customer = sfaCustomers[0];
    if (!customer.customer) {
      errors.push('매출처/고객사 정보가 없습니다.');
    }
    if (!customer.isEndCustomer || !customer.isRevenueSource) {
      errors.push('매출처/고객사 정보가 올바르지 않습니다.');
    }
  } else {
    // 매출/고객 다른 경우
    if (!sfaCustomers || sfaCustomers.length < 2) {
      errors.push('매출처와 고객사 정보가 모두 필요합니다.');
      return errors;
    }

    // 각 고객 정보 검증
    const hasEndCustomer = sfaCustomers.some((c) => c.isEndCustomer);
    const hasRevenueSource = sfaCustomers.some((c) => c.isRevenueSource);
    const allHaveCustomer = sfaCustomers.every((c) => c.customer);

    if (!allHaveCustomer) {
      errors.push('모든 고객 정보가 필요합니다.');
    }
    if (!hasEndCustomer) {
      errors.push('최소 1개 이상의 고객사 정보가 필요합니다.');
    }
    if (!hasRevenueSource) {
      errors.push('최소 1개 이상의 매출처 정보가 필요합니다.');
    }
  }

  return errors;
};

const validateSalesItems = (formData) => {
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

// 공개 함수들
export const validateForm = (formData) => {
  const errors = {
    [ERROR_GROUPS.BASIC_INFO]: validateBasicInfo(formData),
    [ERROR_GROUPS.SALES_ITEMS]: validateSalesItems(formData),
    [ERROR_GROUPS.PAYMENTS]: validatePayments(formData.salesByPayments),
  };

  const hasErrors = Object.values(errors).some((group) => group.length > 0);

  if (hasErrors) {
    showErrorNotification(errors);
  }

  return {
    isValid: !hasErrors,
    errors,
  };
};

export const validatePaymentForm = (payments) => {
  const paymentErrors = validatePayments(payments);

  if (paymentErrors.length > 0) {
    const errors = {
      [ERROR_GROUPS.PAYMENTS]: paymentErrors,
    };
    showErrorNotification(errors);
    return false;
  }

  return true;
};

export const checkAmounts = (formData) => {
  const itemAmount = parseInt(formData.itemAmount) || 0;
  const paymentAmount = parseInt(formData.paymentAmount) || 0;
  return itemAmount === paymentAmount;
};

export const showErrorNotification = (errors) => {
  notification.error({
    message: '매출등록오류',
    description: formatValidationErrors(errors),
    duration: 0,
    style: { width: 500 },
  });
};
