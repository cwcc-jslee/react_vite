/**
 * 사용자의 페이지 접근 권한을 확인하는 유틸리티 함수들
 */

/**
 * 권한 객체를 안전하게 추출 (중첩 구조 처리)
 * @param {Object} userAccessControl
 * @returns {Object|null} permissions object
 */
export const getSafePermissions = (userAccessControl) => {
  if (!userAccessControl) return null;
  let { permissions } = userAccessControl;

  if (!permissions) return null;

  // ⚠️ 중첩된 permissions 구조 처리 (Strapi 데이터 구조 이슈 대응)
  if (permissions.permissions && typeof permissions.permissions === 'object') {
    return permissions.permissions;
  }

  return permissions;
};

/**
 * 사용자의 초기 진입 페이지 경로를 반환
 * @param {Object} userAccessControl
 * @param {string} defaultPath - 기본 경로
 * @returns {string}
 */
export const getInitialPage = (userAccessControl, defaultPath = '/todo') => {
  const permissions = getSafePermissions(userAccessControl);
  return permissions?.initialPage?.path || defaultPath;
};

/**
 * 통합 권한 체크 함수
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 페이지 ID
 * @param {string} action - 권한 유형 ('view', 'create', 'update', 'delete')
 * @returns {boolean} - 권한 여부
 */
export const hasPermission = (userAccessControl, pageId, action = 'view') => {
  const permissions = getSafePermissions(userAccessControl);
  if (!permissions) return false;

  // 기본 권한 확인
  const defaultPermission = permissions.default?.[action];

  // 페이지별 권한 확인
  const pagePermission = permissions.pages?.[pageId]?.[action];

  // 우선순위: 페이지별 권한 > 기본 권한
  if (pagePermission === false) return false; // 명시적 거부
  if (pagePermission === true) return true; // 명시적 허용

  // 페이지별 권한이 설정되지 않은 경우 기본 권한 사용
  return defaultPermission === true;
};

/**
 * 특정 페이지에 대한 조회 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 확인할 페이지 ID
 * @returns {boolean} - 페이지 접근 권한 여부
 */
export const hasPagePermission = (userAccessControl, pageId) => {
  return hasPermission(userAccessControl, pageId, 'view');
};

/**
 * 특정 페이지에 대한 생성 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 확인할 페이지 ID
 * @returns {boolean} - 생성 권한 여부
 */
export const hasCreatePermission = (userAccessControl, pageId) => {
  return hasPermission(userAccessControl, pageId, 'create');
};

/**
 * 특정 페이지에 대한 수정 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 확인할 페이지 ID
 * @returns {boolean} - 수정 권한 여부
 */
export const hasUpdatePermission = (userAccessControl, pageId) => {
  return hasPermission(userAccessControl, pageId, 'update');
};

/**
 * 특정 페이지에 대한 삭제 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 확인할 페이지 ID
 * @returns {boolean} - 삭제 권한 여부
 */
export const hasDeletePermission = (userAccessControl, pageId) => {
  return hasPermission(userAccessControl, pageId, 'delete');
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

/**
 * 페이지 메뉴 항목(탭)에 대한 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 페이지 ID (예: 'sfa', 'project')
 * @param {string} menuId - 메뉴 ID (예: 'list', 'search', 'forecast')
 * @returns {boolean} - 메뉴 항목 표시 여부
 */
export const hasMenuItemPermission = (
  userAccessControl,
  pageId,
  menuId,
) => {
  const permissions = getSafePermissions(userAccessControl);
  if (!permissions) return false;

  // 1. 페이지 자체 권한 확인 (페이지 접근 불가면 메뉴도 볼 수 없음)
  if (!hasPagePermission(userAccessControl, pageId)) return false;

  // 2. 메뉴별 세부 권한 확인
  const menuPermission = permissions.pages?.[pageId]?.menus?.[menuId]?.view;

  // 3. 우선순위: 메뉴별 권한 > 페이지 권한
  if (menuPermission === false) return false; // 명시적 거부
  if (menuPermission === true) return true; // 명시적 허용

  // 메뉴별 권한 미설정 시 페이지 권한 사용 (기본 허용)
  return true;
};

/**
 * 서브 메뉴에 대한 권한을 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 페이지 ID (예: 'project')
 * @param {string} menuId - 메뉴 ID (예: 'detail')
 * @param {string} subMenuId - 서브 메뉴 ID (예: 'table', 'board', 'timeline')
 * @returns {boolean} - 서브 메뉴 표시 여부
 */
export const hasSubMenuPermission = (
  userAccessControl,
  pageId,
  menuId,
  subMenuId,
) => {
  const permissions = getSafePermissions(userAccessControl);
  if (!permissions) return false;

  // 1. 상위 메뉴 권한 확인 (메뉴 접근 불가면 서브 메뉴도 볼 수 없음)
  if (!hasMenuItemPermission(userAccessControl, pageId, menuId)) return false;

  // 2. 서브 메뉴별 세부 권한 확인
  const subMenuPermission =
    permissions.pages?.[pageId]?.menus?.[menuId]?.subMenus?.[subMenuId]?.view;

  // 3. 우선순위: 서브 메뉴별 > 상위 메뉴 권한
  if (subMenuPermission === false) return false; // 명시적 거부
  if (subMenuPermission === true) return true; // 명시적 허용

  // 서브 메뉴별 권한 미설정 시 상위 메뉴 권한 상속 (기본 허용)
  return true;
};

/**
 * 여러 권한 중 하나라도 있는지 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 페이지 ID
 * @param {Array<string>} actions - 확인할 권한 배열 (예: ['view', 'create'])
 * @returns {boolean} - 하나라도 권한이 있으면 true
 */
export const hasAnyPermission = (userAccessControl, pageId, actions = []) => {
  return actions.some((action) =>
    hasPermission(userAccessControl, pageId, action),
  );
};

/**
 * 모든 권한을 가지고 있는지 확인
 * @param {Object} userAccessControl - 사용자의 권한 정보
 * @param {string} pageId - 페이지 ID
 * @param {Array<string>} actions - 확인할 권한 배열 (예: ['view', 'create', 'update'])
 * @returns {boolean} - 모든 권한이 있으면 true
 */
export const hasAllPermissions = (userAccessControl, pageId, actions = []) => {
  return actions.every((action) =>
    hasPermission(userAccessControl, pageId, action),
  );
};
