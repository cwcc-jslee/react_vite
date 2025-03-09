// src/features/contact/services/contactSubmitService.js
/**
 * 담당자(Contact) 데이터 제출 관련 서비스
 * API 통신 및 데이터 변환 로직을 처리하는 모듈
 */

import {
  baseSubmitService,
  createEntity,
} from '../../../shared/services/baseSubmitService';
import { transformToDBFields } from '../../../shared/utils/entityTransformUtils';
import { notification } from '../../../shared/services/notification';

// Contact 서비스 인스턴스 생성
const contactService = baseSubmitService(
  '/contacts',
  transformToDBFields.transformContact,
);

/**
 * 담당자 폼 데이터를 서버에 제출하는 함수
 * UI 데이터 전처리, API 호출, 결과 처리를 수행
 *
 * @param {Object} formData - 폼에서 수집된 담당자 데이터
 * @returns {Promise<Object>} 성공 시 { success: true, data: response } 형태의 객체 반환
 * @throws {Error} 실패 시 오류 발생
 */
export const submitContactData = async (formData) => {
  try {
    // 1. UI 관련 데이터 전처리
    const preparedData = prepareContactData(formData);

    // 2. API 호출 (내부에서 DB 필드 변환 수행)
    const response = await createContact(preparedData);

    // 3. 성공 알림
    notification.success({
      message: '담당자 등록 성공',
      description: '담당자 정보가 성공적으로 저장되었습니다.',
    });

    return response;
  } catch (error) {
    // 4. 오류 알림
    const errorMessage =
      error?.message || '담당자 등록 중 오류가 발생했습니다.';

    notification.error({
      message: '담당자 등록 실패',
      description: errorMessage,
    });

    // 오류를 다시 throw하여 호출자가 처리할 수 있게 함
    throw error;
  }
};

/**
 * 담당자 데이터 UI 전처리 함수
 * DB 변환 전 필요한 UI 관련 데이터 정리 작업 수행
 *
 * @param {Object} data - 원본 폼 데이터
 * @returns {Object} 처리된 데이터
 */
const prepareContactData = (data) => {
  // 1. 불필요한 임시 필드 제거
  const { __temp, ...cleanData } = { ...data };

  // 2. 태그 데이터가 있는 경우 처리
  // UI에서는 태그 객체 배열로 관리하지만, API에서는 별도 처리가 필요할 수 있음
  if (cleanData.tags && Array.isArray(cleanData.tags)) {
    // 필요한 경우 태그 데이터 가공
    // 예: cleanData.tagIds = cleanData.tags.map(tag => tag.id);
  }

  // 3. 전화번호 포맷 정리 (하이픈 제거 등)
  if (cleanData.phone) {
    cleanData.phone = cleanData.phone.replace(/\s+/g, '');
  }

  if (cleanData.mobile) {
    cleanData.mobile = cleanData.mobile.replace(/\s+/g, '');
  }

  // 4. Boolean 값 처리 (문자열 -> 불리언)
  if (cleanData.primaryForCompany === 'true') {
    cleanData.primaryForCompany = true;
  } else if (cleanData.primaryForCompany === 'false') {
    cleanData.primaryForCompany = false;
  }

  return cleanData;
};

/**
 * Contact 생성 함수 (기존 코드)
 * 내부적으로 baseSubmitService의 createEntity 사용
 * transformToDBFields를 통해 DB 필드 변환 수행
 */
export const createContact = async (formData) => {
  return createEntity(contactService, formData, 'Contact');
};

/**
 * Contact 관련 서비스 메서드 모음
 */
export const contactSubmitService = {
  submitContactData,
  createContact,
  createContactBase: (formData) => contactService.createBase(formData),
  updateContactBase: (id, formData) => contactService.updateBase(id, formData),
  deleteContact: (id) => contactService.softDelete(id),
};
