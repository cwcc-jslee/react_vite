/**
 * API 오류 처리 유틸리티
 * 각종 API 호출 시 발생하는 오류를 표준화된 방식으로 처리합니다.
 *
 * @filename src/shared/api/errorHandlers.js
 */

import { normalizeError } from './normalize';

/**
 * API 오류를 처리하고 표준화된 에러 객체를 반환하거나 에러를 던집니다.
 *
 * @param {Error} error - 발생한 오류 객체
 * @param {string} customMessage - 사용자 정의 오류 메시지
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.throwError - true일 경우 에러를 던짐 (기본값: true)
 * @param {boolean} options.logError - true일 경우 콘솔에 에러 로깅 (기본값: true)
 * @returns {Error} 표준화된 에러 객체 (throwError가 false일 경우)
 * @throws {Error} 표준화된 에러 객체 (throwError가 true일 경우)
 */
export const handleApiError = (error, customMessage, options = {}) => {
  const { throwError = true, logError = true } = options;

  // 개발 환경에서만 오류 로깅
  if (logError && process.env.NODE_ENV !== 'production') {
    console.error(customMessage || 'API 오류:', error);
  }

  // 오류 객체 정규화
  const normalizedError = normalizeError(error);

  // 오류 메시지 구성
  const errorMessage =
    normalizedError.message ||
    customMessage ||
    '알 수 없는 오류가 발생했습니다.';

  // 상태 코드 추출 (있는 경우)
  const statusCode = error.response?.status || 500;

  // 향상된 오류 객체 생성
  const enhancedError = new Error(errorMessage);
  enhancedError.originalError = error;
  enhancedError.statusCode = statusCode;
  enhancedError.isApiError = true;

  // 오류 객체 반환 또는 던지기
  if (throwError) {
    throw enhancedError;
  }

  return enhancedError;
};

/**
 * 404 Not Found 오류를 처리합니다.
 *
 * @param {string} resourceType - 리소스 유형 (예: '프로젝트', '고객' 등)
 * @param {string|number} resourceId - 리소스 식별자
 * @param {Object} options - 추가 옵션
 * @returns {Error} 표준화된 에러 객체
 * @throws {Error} 표준화된 에러 객체
 */
export const handleNotFoundError = (resourceType, resourceId, options = {}) => {
  const message = `${resourceType} (ID: ${resourceId})를 찾을 수 없습니다.`;
  const notFoundError = new Error(message);
  notFoundError.statusCode = 404;
  notFoundError.isApiError = true;

  if (options.throwError !== false) {
    throw notFoundError;
  }

  return notFoundError;
};

/**
 * 인증 관련 오류를 처리합니다.
 *
 * @param {Error} error - 발생한 오류 객체
 * @param {Object} options - 추가 옵션
 * @returns {Error} 표준화된 에러 객체
 */
export const handleAuthError = (error, options = {}) => {
  return handleApiError(error, '인증에 실패했습니다. 다시 로그인해주세요.', {
    ...options,
    // 인증 오류는 사용자에게 알릴 필요가 있으므로 항상 로깅
    logError: true,
  });
};

export default {
  handleApiError,
  handleNotFoundError,
  handleAuthError,
};
