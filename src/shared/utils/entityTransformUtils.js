// src/shared/utils/entityTransformUtils.js
import {
  parseNumber,
  transformMultiSelect,
  removeEmptyFields,
} from './transformUtils';
import { normalizeBusinessNumber } from '../services/businessNumberUtils';

/**
 * 모든 엔티티를 위한 DB 필드 변환 유틸리티
 * 참고: Project 엔티티는 이제 useProjectForm에서 직접 변환됩니다.
 */
export const transformToDBFields = {
  /**
   * 필드 매핑 정의 - 모든 엔티티의 매핑을 통합
   */
  FIELD_MAP: {
    // Customer 필드 매핑
    CUSTOMER: {
      name: 'name',
      coClassification: 'co_classification',
      businessScale: 'business_scale',
      businessNumber: 'business_number',
      businessType: 'business_type',
      employee: 'employee',
      region: 'region',
    },

    // Contact 필드 매핑
    CONTACT: {
      firstName: 'first_name',
      lastName: 'last_name',
      fullName: 'full_name',
      email: 'email',
      phone: 'phone',
      mobile: 'mobile',
      position: 'position',
      customerId: 'customer_id',
    },

    // SFA 필드 매핑
    SFA: {
      title: 'title',
      customerId: 'customer_id',
      amount: 'amount',
      probability: 'probability',
      expectedDate: 'expected_date',
    },

    // Project 필드 매핑 (참조용으로 유지)
    PROJECT: {
      name: 'name',
      sfa: 'sfa',
      planStartDate: 'plan_start_date',
      planEndDate: 'plan_end_date',
      service: 'service',
      team: 'team',
    },
  },

  /**
   * SFA 데이터 변환
   */
  //   transformSFA: (formData) => {
  //     console.log('Transform SFA fields input:', formData);

  //     const transformed = {
  //       title: formData.title,
  //       customer_id: formData.customer?.id || formData.customerId,
  //       sales_type: parseNumber(formData.salesType),
  //       sales_classification: parseNumber(formData.salesClassification),
  //       expected_amount: parseNumber(formData.expectedAmount),
  //       expected_date: formData.expectedDate,
  //       profit_margin: parseNumber(formData.profitMargin),
  //       probability: parseNumber(formData.probability),
  //       status: parseNumber(formData.status),
  //       assigned_to: formData.assignedTo?.id || formData.assignedTo,
  //       note: formData.note,
  //       tags: transformMultiSelect(formData.tags),
  //     };

  //     const filteredData = removeEmptyFields(transformed);
  //     console.log('Transform SFA fields output:', filteredData);

  //     return filteredData;
  //   },

  /**
   * Customer 데이터 변환
   */
  transformCustomer: (formData) => {
    console.log('Transform Customer fields input:', formData);

    const transformed = {
      name: formData.name,
      co_classification: parseNumber(formData.coClassification),
      business_scale: parseNumber(formData.businessScale),
      business_number: normalizeBusinessNumber(formData.businessNumber),
      funnel: transformMultiSelect(formData.funnel),
      homepage: formData.homepage,
      business_type: transformMultiSelect(formData.businessType),
      employee: parseNumber(formData.employee),
      commencement_date: formData.commencementDate,
      representative_name: formData.representativeName,
      region: parseNumber(formData.region),
      city: formData.city,
      address: formData.address,
      //   support_program : formData.supportProgram,
      // sfa_by_items: transformToDBFields.transformSalesByItems(
      //     formData.salesByItems,
      //   ),
      description: formData.description || '',
    };

    // 빈 값을 가진 필드 제거
    const filteredData = removeEmptyFields(transformed);
    console.log('Transform Customer fields output:', filteredData);

    return filteredData;
  },

  /**
   * Contact 데이터 변환
   */
  transformContact: (formData) => {
    console.log('Transform Contact fields input:', formData);

    const transformed = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: formData.fullName,
      customer: parseNumber(formData.customer),
      position: formData.position,
      department: formData.department,
      email: formData.email,
      email_alternative: formData.emailAlternative,
      phone: formData.phone,
      mobile: formData.mobile,
      contact_type: parseNumber(formData.contactType),
      relationship_status: formData.relationshipStatus,
      primary_for_company: formData.primaryForCompany || false,
      note: formData.note,
      // tags: transformMultiSelect(formData.tags),
    };

    const filteredData = removeEmptyFields(transformed);
    console.log('Transform Contact fields output:', filteredData);

    return filteredData;
  },

  /**
   * Project 데이터 변환 - 이제 useProjectForm.js에서 처리됨
   * 참조용으로 주석 처리합니다.
   */
  // transformProject: (formData) => {
  //   console.log('Transform Project fields input:', formData);
  //
  //   const transformed = {
  //     name: formData.name,
  //     sfa: formData.sfa?.id,
  //     plan_start_date: formData.planStartDate,
  //     plan_end_date: formData.planEndDate,
  //     service: formData.service,
  //     team: formData.team,
  //     // 추가 필드가 있으면 여기에 매핑
  //   };
  //
  //   const filteredData = removeEmptyFields(transformed);
  //   console.log('Transform Project fields output:', filteredData);
  //
  //   return filteredData;
  // },
};

// 기본 내보내기
export default transformToDBFields;
