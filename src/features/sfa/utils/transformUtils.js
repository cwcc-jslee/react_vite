// src/features/sfa/utils/transformUtils.js
/**
 * SFA 데이터 변환 유틸리티
 * Form 데이터를 DB 필드 형식으로 변환하는 함수들을 정의합니다.
 */

/**
 * 숫자 타입으로 변환
 */
const parseNumber = (value) => {
  const num = Number(value);
  const result = isNaN(num) ? 0 : num;

  return result;
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
   * 매출 아이템 배열을 DB 형식으로 변환
   * @param {Array} items - salesByItems 배열
   * @returns {string} - JSON 문자열로 변환된 매출 아이템 데이터
   */
  transformSalesByItems: (items) => {
    // 입력값 로깅
    console.group('Sales Items Transform');
    console.log('Input:', {
      type: typeof items,
      value: items,
    });

    const transformed = items.map((item) => ({
      item_id: item.itemId || null,
      item_name: item.itemName || '',
      team_id: item.teamId || null,
      team_name: item.teamName || '',
      item_price: parseNumber(item.amount),
      // 추가 필드가 있다면 여기에 작성
    }));

    // JSON 문자열로 변환
    const jsonResult = JSON.stringify(transformed);
    // 출력값 로깅
    console.log('Output:', {
      type: typeof transformed,
      value: transformed,
      isArray: Array.isArray(transformed),
    });
    console.groupEnd();

    return jsonResult;
  },

  /**
   * 결제 매출 항목목 변환
   */
  transformSalesByPayments: (payment) => {
    // 입력값 로깅
    console.group('Sales Payments Transform');
    console.log('Input:', {
      type: typeof payment,
      value: payment,
    });

    const transformed = {
      billing_type: payment.billingType,
      is_confirmed: payment.isConfirmed,
      probability: parseNumber(payment.probability),
      amount: parseNumber(payment.amount),
      profit_config: (() => {
        const config = {
          is_profit: payment.isProfit,
          margin_profit_value: parseNumber(payment.marginProfitValue),
        };
        return JSON.stringify(config);
      })(),
      profit_amount: Math.floor(parseNumber(payment.profitAmount)),
      scheduled_date: payment.scheduledDate || null,
      recognition_date: payment.recognitionDate,
      memo: payment.memo,
      // 추가 필드가 있다면 여기에 작성
    };

    // 출력값 로깅
    console.log('Output:', {
      type: typeof transformed,
      value: transformed,
      isArray: Array.isArray(transformed),
    });
    console.groupEnd();

    return transformed;
  },

  /**
   * SFA 기본 정보 변환
   * @param {Object} formData - 변환할 폼 데이터
   * @returns {Object} - 변환된 기본 필드 데이터
   */
  transformSfaFields: (formData) => {
    console.log('Transform SFA fields input:', formData);

    const transformed = {
      name: formData.name,
      customer: formData.customer,
      has_partner: formData.hasPartner,
      selling_partner: formData.hasPartner ? formData.sellingPartner : null,
      sfa_sales_type: parseNumber(formData.sfaSalesType),
      sfa_classification: parseNumber(formData.sfaClassification),
      total_price: parseNumber(formData.itemAmount),
      sfa_by_items: transformToDBFields.transformSalesByItems(
        formData.salesByItems,
      ),
      is_project: formData.isProject,
      description: formData.description || '',
    };

    console.log('Transform base fields output:', transformed);
    return transformed;
  },
};
