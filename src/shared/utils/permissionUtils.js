/**
 * 사용자의 페이지 접근 권한을 확인하는 유틸리티 함수들
 */

/**
 * 특정 페이지에 대한 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 확인할 페이지 ID
 * @returns {boolean} - 페이지 접근 권한 여부
 */
export const hasPagePermission = (userAccessControl, pageId) => {
  if (!userAccessControl) return false;

  const { permissions } = userAccessControl;
  if (!permissions) return false;

  // 기본 권한 확인
  const defaultPermission = permissions.default?.view;

  // 페이지별 권한 확인
  const pagePermission = permissions.pages?.[pageId]?.view;

  // 페이지별 권한이 명시적으로 false인 경우 접근 불가
  if (pagePermission === false) return false;

  // 페이지별 권한이 true인 경우 접근 가능
  if (pagePermission === true) return true;

  // 페이지별 권한이 설정되지 않은 경우 기본 권한 사용
  return defaultPermission === true;
};

/**
 * 사이드바 메뉴 아이템에 대한 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {Object} menuItem - 사이드바 메뉴 아이템
 * @returns {boolean} - 메뉴 표시 여부
 */
export const hasMenuPermission = (userAccessControl, menuItem) => {
  if (!userAccessControl || !menuItem) return false;

  // 페이지 ID가 없는 경우 (예: 그룹 메뉴)는 항상 표시
  if (!menuItem.id) return true;

  return hasPagePermission(userAccessControl, menuItem.id);
};
