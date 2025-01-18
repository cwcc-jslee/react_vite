// src/features/sfa/utils/validationUtils.js
import { SECTION_TITLES } from '../constants/validationConstants';

/**
 * 검증 에러 메시지를 포맷팅하는 함수
 * @param {Object} errors - 섹션별 에러 메시지 객체
 * @returns {string} 포맷팅된 에러 메시지
 */
export const formatValidationErrors = (errors) => {
  const sections = Object.entries(errors)
    .filter(([_, messages]) => messages.length > 0)
    .map(([section, messages]) => {
      const title = SECTION_TITLES[section];
      const messageList = messages.map((msg) => `• ${msg}`).join('\n');
      return `[${title}]\n${messageList}`;
    });

  return sections.join('\n\n');
};

/**
 * 에러 메시지의 첫 번째 줄을 추출하는 함수
 * @param {Object} errors - 섹션별 에러 메시지 객체
 * @returns {string} 첫 번째 에러 메시지
 */
export const getFirstErrorMessage = (errors) => {
  for (const section in errors) {
    if (errors[section].length > 0) {
      return errors[section][0];
    }
  }
  return '입력 내용을 확인해주세요';
};
