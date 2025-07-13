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

  const { isSameBilling, customer } = formData;

  // isSameBilling 필수 체크
  if (isSameBilling === undefined || isSameBilling === null) {
    errors.push('매출처/고객사 동일 여부를 선택해주세요.');
    return errors;
  }

  // customer 필드 유효성 검사
  if (!customer || !customer.id || !customer.name) {
    errors.push('고객사 정보가 올바르지 않습니다.');
    return errors;
  }

  return errors;
};

const validateSalesItems = (formData) => {
  const errors = [];

  if (formData.sfaByItems.length === 0) {
    errors.push(ERROR_MESSAGES.MIN_SALES_ITEMS);
    return errors;
  }

  formData.sfaByItems.forEach((item, index) => {
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

const validatePayments = (sfaByPayments) => {
  const errors = [];

  if (!sfaByPayments || sfaByPayments.length === 0) {
    errors.push('결제 매출 정보가 필요합니다.');
    return errors;
  }

  sfaByPayments.forEach((payment, index) => {
    // revenueSource 필드 검증
    if (
      !payment.revenueSource ||
      !payment.revenueSource.id ||
      !payment.revenueSource.name
    ) {
      errors.push(
        `${index + 1}번째 결제 매출의 매출처 정보가 올바르지 않습니다.`,
      );
    }

    // 결제구분 검증
    if (!payment.billingType) {
      errors.push(`${index + 1}번째 결제 매출의 결제구분을 선택해주세요.`);
    }

    // 매출액 검증
    if (!payment.amount || payment.amount.trim() === '') {
      errors.push(`${index + 1}번째 결제 매출의 매출액을 입력해주세요.`);
    }

    // 매출인식일자 검증
    if (!payment.recognitionDate) {
      errors.push(`${index + 1}번째 결제 매출의 매출인식일자를 선택해주세요.`);
    }

    // 결제일자 검증
    // if (!payment.scheduledDate) {
    //   errors.push(`${index + 1}번째 결제 매출의 결제일자를 선택해주세요.`);
    // }

    // 매출확률 검증
    if (!payment.probability) {
      errors.push(`${index + 1}번째 결제 매출의 매출확률을 선택해주세요.`);
    }

    // 이익/마진 값 검증
    if (!payment.marginProfitValue) {
      errors.push(`${index + 1}번째 결제 매출의 이익/마진 값을 입력해주세요.`);
    } else {
      const marginValue = Number(payment.marginProfitValue);
      const amount = Number(payment.amount);

      if (payment.isProfit) {
        // 이익인 경우: 매출액보다 작거나 같아야 함
        if (marginValue > amount) {
          errors.push(
            `${index + 1}번째 결제 매출의 이익은 매출액보다 클 수 없습니다.`,
          );
        }
      } else {
        // 마진인 경우: 0~100 사이의 값이어야 함
        if (marginValue < 0 || marginValue > 100) {
          errors.push(
            `${
              index + 1
            }번째 결제 매출의 마진율은 0~100 사이의 값이어야 합니다.`,
          );
        }
      }
    }
  });

  return errors;
};

// 공개 함수들
export const validateForm = (formData) => {
  const errors = {
    [ERROR_GROUPS.BASIC_INFO]: validateBasicInfo(formData),
    [ERROR_GROUPS.PAYMENTS]: validatePayments(formData.sfaByPayments),
    [ERROR_GROUPS.SALES_ITEMS]: validateSalesItems(formData),
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
