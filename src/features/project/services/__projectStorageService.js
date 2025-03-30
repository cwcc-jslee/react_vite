// src/features/project/services/projectStorageService.js
/**
 * 프로젝트 로컬 스토리지 관리 서비스
 *
 * 브라우저 로컬 스토리지를 이용하여 프로젝트 임시 데이터를 저장/복원
 */

const STORAGE_KEYS = {
  FORM_DATA: 'project_form_data',
  KANBAN_DATA: 'project_kanban_data',
  FILTERS: 'project_filters',
  ACTIVE_VIEW: 'project_active_view',
};

/**
 * 폼 데이터 저장
 * @param {Object} formData - 저장할 폼 데이터
 */
const saveFormData = (formData) => {
  try {
    const sanitizedData = { ...formData };
    // 객체 타입 데이터 처리 (직렬화 가능하도록)
    if (sanitizedData.customer && typeof sanitizedData.customer === 'object') {
      sanitizedData.customer = JSON.parse(
        JSON.stringify(sanitizedData.customer),
      );
    }

    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(sanitizedData));
  } catch (error) {
    console.error('폼 데이터 저장 실패:', error);
  }
};

/**
 * 저장된 폼 데이터 가져오기
 * @returns {Object|null} 저장된 폼 데이터 또는 null
 */
const getFormData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('폼 데이터 가져오기 실패:', error);
    return null;
  }
};

/**
 * 폼 데이터 삭제
 */
const clearFormData = () => {
  localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
};

/**
 * 칸반 데이터 저장
 * @param {Array} buckets - 저장할 칸반 버킷 데이터
 */
const saveKanbanData = (buckets) => {
  try {
    localStorage.setItem(STORAGE_KEYS.KANBAN_DATA, JSON.stringify(buckets));
  } catch (error) {
    console.error('칸반 데이터 저장 실패:', error);
  }
};

/**
 * 저장된 칸반 데이터 가져오기
 * @returns {Array|null} 저장된 칸반 데이터 또는 null
 */
const getKanbanData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KANBAN_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('칸반 데이터 가져오기 실패:', error);
    return null;
  }
};

/**
 * 칸반 데이터 삭제
 */
const clearKanbanData = () => {
  localStorage.removeItem(STORAGE_KEYS.KANBAN_DATA);
};

/**
 * 필터 설정 저장
 * @param {Object} filters - 저장할 필터 객체
 */
const saveFilters = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('필터 저장 실패:', error);
  }
};

/**
 * 저장된 필터 설정 가져오기
 * @returns {Object|null} 저장된 필터 또는 null
 */
const getFilters = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILTERS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('필터 가져오기 실패:', error);
    return null;
  }
};

/**
 * 필터 설정 삭제
 */
const clearFilters = () => {
  localStorage.removeItem(STORAGE_KEYS.FILTERS);
};

/**
 * 활성 뷰 저장
 * @param {string} view - 저장할 활성 뷰
 */
const saveActiveView = (view) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
};

/**
 * 저장된 활성 뷰 가져오기
 * @returns {string|null} 저장된 활성 뷰 또는 null
 */
const getActiveView = () => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
};

/**
 * 모든 프로젝트 관련 스토리지 데이터 초기화
 */
const clearAllProjectData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const projectStorageService = {
  saveFormData,
  getFormData,
  clearFormData,
  saveKanbanData,
  getKanbanData,
  clearKanbanData,
  saveFilters,
  getFilters,
  clearFilters,
  saveActiveView,
  getActiveView,
  clearAllProjectData,
};
