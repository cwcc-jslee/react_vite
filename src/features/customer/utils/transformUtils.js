// src/features/customer/utils/transformUtils.js
/**
 * Customer 데이터 변환 유틸리티
 * Form 데이터를 DB 필드 형식으로 변환하는 함수들을 정의합니다.
 */
import { normalizeBusinessNumber } from '../../../shared/services/businessNumberUtils';
import {
  parseNumber,
  removeEmptyFields,
} from '../../../shared/utils/dataTransformUtils';

/**
 * Form 데이터를 DB 필드로 변환하는 객체
 */
export const transformToDBFields = {
  /**
   * 필터 필드 매핑 정의
   */
  FILTER_FIELD_MAP: {
    name: 'name',
    coClassification: 'co_classification',
    businessScale: 'business_scale',
    businessScale: 'business_scale',
    businessNumber: 'business_number',
  },

  // handleMultiSelectChange
  transformMultiSelect: (items) => {
    // 입력값 로깅
    console.group('다중선택 json 형태태 Transform');
    console.log('Input:', {
      type: typeof items,
      value: items,
    });

    const transformed = items.map((item) => ({
      id: item.id || '',
      name: item.name || '',
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
   * Customer 기본 정보 변환
   * @param {Object} formData - 변환할 폼 데이터
   * @returns {Object} - 변환된 기본 필드 데이터
   */
  transformCustomerFields: (formData) => {
    console.log('Transform Customer fields input:', formData);

    const transformed = {
      name: formData.name,
      co_classification: parseNumber(formData.coClassification),
      business_scale: parseNumber(formData.businessScale),
      business_number: normalizeBusinessNumber(formData.businessNumber),
      funnel: JSON.stringify(formData.funnel),
      homepage: formData.homepage,
      business_type: JSON.stringify(formData.businessType),
      employee: parseNumber(formData.employee),
      commencement_date: formData.commencementDate,
      representative_name: formData.representativeName,
      region: parseNumber(formData.region),
      city: formData.city,
      address: formData.address,
      //   support_program : formData.supportProgram,
      description: formData.description || '',
      // sfa_by_items: transformToDBFields.transformSalesByItems(
      //     formData.salesByItems,
      //   ),
    };

    // 빈 값을 가진 필드 제거
    const filteredData = removeEmptyFields(transformed);

    console.log('Transform base fields output:', filteredData);
    return filteredData;
  },
};

// export { transformToDBFields, removeEmptyFields, parseNumber, isEmpty };
