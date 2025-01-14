// src/features/sfa/utils/transformUtils.js
/**
 * SFA 데이터 변환 유틸리티
 * Form 데이터를 DB 필드 형식으로 변환하는 함수들을 정의합니다.
 */

/**
 * 숫자 타입으로 변환
 */
const toNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * 날짜 포맷 검증 및 변환
 */
const toDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : dateStr;
};

/**
 * Form 데이터를 DB 필드로 변환하는 객체
 */
export const transformToDBFields = {
  /**
   * SFA 기본 정보 변환
   */
  transformBaseFields: (formData) => {
    console.log('Transform base fields input:', formData);

    const transformed = {
      sfa_sales_type: formData.sfaSalesType,
      customer: formData.customer,
      name: formData.name || '',
      sfa_classification: formData.sfaClassification,
      description: formData.description || '',
      //   status: 'active',
    };

    console.log('Transform base fields output:', transformed);
    return transformed;
  },

  /**
   * 매출 아이템 변환
   */
  transformSalesItem: (item) => {
    console.log('Transform sales item input:', item);

    const transformed = {
      product_type: item.productType,
      department: item.department,
      amount: toNumber(item.amount),
      created_by: item.createdBy,
      status: item.status || 'active',
    };

    console.log('Transform sales item output:', transformed);
    return transformed;
  },

  /**
   * 매출 항목 변환
   */
  transformSalesEntry: (entry) => {
    console.log('Transform sales entry input:', entry);

    const transformed = {
      payment_type: entry.paymentType,
      confirmed: Boolean(entry.confirmed),
      probability: toNumber(entry.probability),
      amount: toNumber(entry.amount),
      is_profit: Boolean(entry.isProfit),
      margin: toNumber(entry.margin),
      margin_amount: toNumber(entry.marginAmount),
      recognition_date: toDate(entry.recognitionDate),
      payment_date: toDate(entry.paymentDate),
      memo: entry.memo || '',
      status: entry.status || 'active',
    };

    console.log('Transform sales entry output:', transformed);
    return transformed;
  },
};
