/**
 * Drawer 설정 상수
 * 크기, 모드, 애니메이션 설정 등을 정의
 */

// ==================== Drawer 크기 ====================

/**
 * Drawer 크기 상수 (픽셀 값)
 */
export const DRAWER_SIZES = {
  SM: '400px', // 간단한 폼, 빠른 입력
  MD: '600px', // 기본 상세보기
  LG: '800px', // 복잡한 폼
  XL: '900px', // 매우 복잡한 폼 (탭, 섹션 포함)
  XXL: '1200px', // 매우 큰 폼 (프로젝트 상세 등)
  WIDE: 'calc(100vw - 256px)', // 사이드바 제외 전체 (사이드바 펼침 상태)
  FULL: '100vw', // 전체 화면
};

/**
 * Drawer 크기에 대응하는 Tailwind 클래스
 */
export const DRAWER_SIZE_CLASSES = {
  SM: 'w-[400px]',
  MD: 'w-[600px]',
  LG: 'w-[800px]',
  XL: 'w-[900px]',
  XXL: 'w-[1200px]',
  // WIDE: 'w-[calc(100vw-256px)]',
  WIDE: 'w-[calc(100vw-300px)]',
  FULL: 'w-screen',
};

/**
 * 하위 호환성을 위한 픽셀 값 매핑
 * 기존 코드에서 "900px" 같은 문자열을 직접 사용하는 경우 대응
 */
export const LEGACY_SIZE_MAP = {
  '400px': 'SM',
  '600px': 'MD',
  '800px': 'LG',
  '900px': 'XL',
};

// ==================== Drawer 모드 ====================

/**
 * Drawer 모드 상수
 */
export const DRAWER_MODES = {
  ADD: 'add',
  VIEW: 'view',
  EDIT: 'edit',
  ADD_SINGLE: 'addSingle',
  ADD_BULK: 'addBulk',
  STATUS: 'status',
};

/**
 * Drawer 모드별 한글 라벨
 */
export const DRAWER_MODE_LABELS = {
  [DRAWER_MODES.ADD]: '등록',
  [DRAWER_MODES.VIEW]: '상세정보',
  [DRAWER_MODES.EDIT]: '수정',
  [DRAWER_MODES.ADD_SINGLE]: '단일 등록',
  [DRAWER_MODES.ADD_BULK]: '일괄 등록',
  [DRAWER_MODES.STATUS]: '상태 관리',
};

// ==================== 애니메이션 설정 ====================

/**
 * Framer Motion 애니메이션 variants
 */
export const DRAWER_ANIMATIONS = {
  // Overlay fade in/out
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Drawer slide in/out
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },

  // Drawer slide in/out (CSS only - Framer Motion 없는 경우)
  drawerCSS: {
    enterClass: 'translate-x-0',
    exitClass: 'translate-x-full',
    transitionClass: 'transform transition-transform duration-300 ease-out',
  },
};

// ==================== 기본 설정 ====================

/**
 * Drawer 기본 설정값
 */
export const DRAWER_DEFAULTS = {
  width: DRAWER_SIZES.MD,
  enableOverlayClick: false,
  showCloseButton: true,
  showMenu: true,
  animationEnabled: true,
};

// ==================== z-index 설정 ====================

/**
 * Drawer z-index 값
 * PRIMARY: 기본 Drawer (프로젝트 상세보기 등)
 * SECONDARY: 중첩 Drawer (진행상태 관리 등)
 */
export const DRAWER_Z_INDEX = {
  // Primary Drawer (기본)
  PRIMARY_OVERLAY: 50,
  PRIMARY_DRAWER: 50,

  // Secondary Drawer (중첩)
  SECONDARY_OVERLAY: 60,
  SECONDARY_DRAWER: 60,

  // 하위 호환성
  OVERLAY: 50,
  DRAWER: 50,
};

// ==================== 기타 설정 ====================

/**
 * Drawer 내부 컨텐츠 패딩
 */
export const DRAWER_PADDING = {
  HEADER: 'px-6 py-4',
  CONTENT: 'p-6',
  FOOTER: 'px-6 py-4',
  MENU: 'px-6 py-3',
};
