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
   * 필터 필드 매핑 정의
   */
  FILTER_FIELD_MAP: {
    name: 'name',
    customer: 'customer',
    hasPartner: 'has_partner',
    sellingPartner: 'selling_partner',
    sfaSalesType: 'sfa_sales_type',
    sfaClassification: 'sfa_classification',
    // salesItem:'sfa_by_items', team..json
    itemAmount: 'total_price',
    isProject: 'is_project',
    description: 'description',
    probability: 'probability',
    //
    billingType: 'billing_type',
  },

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
   * 결제 매출 항목 변환
   */
  transformSalesByPayments: (payment) => {
    // 입력값 로깅
    console.group('Sales Payments Transform');
    console.log('Input:', {
      type: typeof payment,
      value: payment,
    });

    const transformed = {
      revenue_source: payment.revenueSource.id,
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
   * 결제 매출 항목 변환_수정_임시_삭제 예정
   */
  transformSalesByPaymentsEdit: (payment) => {
    // 입력값 로깅
    console.group('Sales Payments Transform');
    console.log('Input:', {
      type: typeof payment,
      value: payment,
    });

    const transformed = {
      // revenue_source: payment.revenueSource.id,
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
      customer: formData.customer.id,
      is_same_billing: formData.isSameBilling,
      // has_partner: formData.hasPartner,
      // selling_partner: formData.hasPartner ? formData.sellingPartner : null,
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

  /**
   * 필터를 Strapi 쿼리 형식으로 변환
   * @param {Object} filters - 변환할 필터 객체
   * @returns {Array} - Strapi 필터 배열
   */
  transformToStrapiFilter: (filters) => {
    console.group('Strapi Filter Transform');
    console.log('Input filters:', filters);

    if (!filters || typeof filters !== 'object') {
      console.log('No filters to transform');
      console.groupEnd();
      return {};
    }

    const sfaFilters = {};

    // 매출처 필터
    if (filters.customer && filters.customer !== '') {
      sfaFilters.customer = {
        id: { $eq: filters.customer },
      };
    }

    // 건명 필터
    if (filters.name && filters.name !== '') {
      sfaFilters.name = { $contains: filters.name };
    }

    // 매출구분, 매출품목 필터
    if (filters.sfa_item && filters.sfa_item !== '') {
      sfaFilters.sfa_item_price = {
        $contains: `"sfa_item_name":"${filters.sfa_item}"`,
      };
    } else if (
      filters.sfa_classification &&
      filters.sfa_classification !== ''
    ) {
      sfaFilters.sfa_classification = {
        id: { $eq: filters.sfa_classification },
      };
    }

    const result =
      Object.keys(sfaFilters).length > 0 ? { sfa: sfaFilters } : {};

    console.log('Output Strapi filters:', result);
    console.groupEnd();

    return result;
  },

  /**
   * filters 객체를 DB 필드명으로 변환
   * @param {Object} filters - 변환할 필터 객체
   * @returns {Object} - 변환된 필터 객체
   * --> transformToDBFields 로 변경경
   */
  transformFilters: (filters) => {
    console.group('Filters Transform');
    console.log('Input filters:', filters);

    if (!filters || typeof filters !== 'object') {
      console.log('No filters to transform');
      console.groupEnd();
      return {};
    }

    // null이 아닌 값만 변환하여 새 객체 생성
    const transformedFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value == null || value === '') {
          return acc;
        }

        const dbField = transformToDBFields.FILTER_FIELD_MAP[key];
        if (dbField) {
          // 숫자 타입 필드는 parseNumber 적용
          if (
            ['sfa_sales_type', 'sfa_classification', 'total_price'].includes(
              dbField,
            )
          ) {
            acc[dbField] = parseNumber(value);
          } else {
            acc[dbField] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    console.log('Output transformed filters:', transformedFilters);
    console.groupEnd();

    return transformedFilters;
  },
};

/**
 * 매출처 데이터 중복 제거 및 정렬
 * @param {Array} salesByPayments - 결제 매출 배열
 * @returns {Array} - 중복 제거되고 정렬된 매출처 배열
 */
export const getUniqueRevenueSources = (salesByPayments) => {
  // salesByPayments에서 revenueSource 추출
  const paymentSources = salesByPayments
    .map((payment) => payment.revenueSource)
    .filter((source) => source?.id && source?.name);

  // 중복 제거 및 이름 순 정렬
  return paymentSources
    .reduce((acc, current) => {
      const exists = acc.find((item) => item.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
};
