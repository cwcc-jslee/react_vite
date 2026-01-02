/**
 * Drawer 시스템 통합 Export
 * 신규 Drawer 컴포넌트, Hook, 유틸리티, 상수를 하나의 진입점에서 제공
 */

// ==================== 메인 컴포넌트 ====================
export { default as Drawer } from './Drawer';
export { default as DrawerMenu } from './DrawerMenu';

// ==================== Hooks ====================
export { useDrawer } from './hooks/useDrawer';

// ==================== 상수 ====================
export {
  DRAWER_SIZES,
  DRAWER_SIZE_CLASSES,
  DRAWER_MODES,
  DRAWER_MODE_LABELS,
  DRAWER_ANIMATIONS,
  DRAWER_DEFAULTS,
  DRAWER_Z_INDEX,
  DRAWER_PADDING,
} from './constants/drawerConfig';

// ==================== 유틸리티 ====================
export {
  getWidthClass,
  getDrawerTitle,
  getSubmitButtonText,
  shouldShowMenu,
  isValidDrawerState,
  isEscapeKey,
  addFeatureLabel,
  getFeatureLabels,
} from './utils/drawerUtils';

// ==================== 타입 (JSDoc) ====================
// 타입은 JSDoc으로만 사용되므로 export하지 않음
// 필요 시: export * from './types/drawer.types';
