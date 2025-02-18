/**
 * API 응답 데이터를 표준화된 형식으로 정규화합니다.
 *
 * @param {Object} response - API 응답 객체
 * @param {Object} response.data - 응답 데이터 객체
 * @param {Array} response.data.data - 실제 데이터 배열
 * @param {Object} response.data.meta - 메타 정보 (페이지네이션 등)
 * @returns {Object} 정규화된 데이터 객체
 * @property {Array} data - 정규화된 데이터 배열
 * @property {Object} meta - 메타 정보
 */
export const normalizeResponse = (response) => {
  if (!response?.data?.data) {
    return {
      data: [],
      meta: { pagination: { total: 0 } },
    };
  }

  return {
    data: response.data.data,
    meta: response.data.meta,
  };
};

/**
 * 페이지네이션 메타 데이터를 정규화합니다.
 *
 * @param {Object} meta - 메타 데이터 객체
 * @returns {Object} 정규화된 페이지네이션 객체
 */
export const normalizePagination = (meta) => {
  const { pagination } = meta || {};

  return {
    current: pagination?.current_page || 1,
    pageSize: pagination?.per_page || 10,
    total: pagination?.total || 0,
  };
};

/**
 * 에러 응답을 정규화합니다.
 *
 * @param {Object} error - API 에러 객체
 * @returns {Object} 정규화된 에러 객체
 */
export const normalizeError = (error) => {
  const { response } = error;

  return {
    message: response?.data?.message || '알 수 없는 오류가 발생했습니다.',
    errors: response?.data?.errors || {},
    status: response?.status || 500,
  };
};

/**
 * API 응답의 단일 데이터 아이템을 정규화합니다.
 *
 * @param {Object} response - API 응답 객체
 * @returns {Object} 정규화된 단일 데이터 객체
 */
export const normalizeItemResponse = (response) => {
  if (!response?.data?.data) {
    return null;
  }

  return response.data.data;
};
