/**
 * Drawer 관련 유틸리티 함수
 */

import {
  DRAWER_SIZES,
  DRAWER_SIZE_CLASSES,
  LEGACY_SIZE_MAP,
  DRAWER_MODE_LABELS,
} from '../constants/drawerConfig';

/**
 * Feature별 한글 라벨 매핑
 */
const FEATURE_LABELS = {
  sfa: 'SFA',
  customer: '고객',
  project: '프로젝트',
  contact: '담당자',
  todo: '할일',
  work: '작업',
};

/**
 * Drawer width 값을 Tailwind 클래스로 변환
 *
 * @param {string} width - Drawer 너비 (DRAWER_SIZES 키 또는 픽셀 값)
 * @returns {string} Tailwind 클래스
 *
 * @example
 * getWidthClass('XL') // 'w-[900px]'
 * getWidthClass('900px') // 'w-[900px]' (하위 호환)
 * getWidthClass('1200px') // 'w-[1200px]' (커스텀)
 */
export const getWidthClass = (width) => {
  // 1. DRAWER_SIZE_CLASSES에 정의된 키인지 확인
  if (DRAWER_SIZE_CLASSES[width]) {
    return DRAWER_SIZE_CLASSES[width];
  }

  // 2. 하위 호환성: 픽셀 값을 키로 변환
  if (LEGACY_SIZE_MAP[width]) {
    const sizeKey = LEGACY_SIZE_MAP[width];
    return DRAWER_SIZE_CLASSES[sizeKey];
  }

  // 3. 커스텀 픽셀 값 (예: "1200px")
  if (typeof width === 'string' && width.endsWith('px')) {
    return `w-[${width}]`;
  }

  // 4. 기본값
  return DRAWER_SIZE_CLASSES.MD;
};

/**
 * Feature와 Mode를 조합하여 Drawer 타이틀 생성
 *
 * @param {string} feature - Feature 키 (sfa, customer, project 등)
 * @param {string} mode - Drawer 모드 (add, view, edit 등)
 * @returns {string} Drawer 타이틀
 *
 * @example
 * getDrawerTitle('customer', 'add') // '고객 등록'
 * getDrawerTitle('sfa', 'view') // 'SFA 상세정보'
 * getDrawerTitle('project', 'edit') // '프로젝트 수정'
 */
export const getDrawerTitle = (feature, mode) => {
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const modeLabel = DRAWER_MODE_LABELS[mode] || '';

  if (!modeLabel) {
    return featureLabel;
  }

  return `${featureLabel} ${modeLabel}`;
};

/**
 * Drawer 모드에 따라 제출 버튼 텍스트 반환
 *
 * @param {string} mode - Drawer 모드
 * @returns {string} 제출 버튼 텍스트
 *
 * @example
 * getSubmitButtonText('add') // '등록'
 * getSubmitButtonText('edit') // '수정'
 * getSubmitButtonText('view') // '확인'
 */
export const getSubmitButtonText = (mode) => {
  const buttonTextMap = {
    add: '등록',
    addSingle: '등록',
    addBulk: '등록',
    edit: '수정',
    view: '확인',
    status: '저장',
  };

  return buttonTextMap[mode] || '확인';
};

/**
 * Drawer 모드에 따라 메뉴 표시 여부 결정
 *
 * @param {string} mode - Drawer 모드
 * @param {boolean} hasMenu - 메뉴가 제공되었는지 여부
 * @returns {boolean} 메뉴 표시 여부
 *
 * @example
 * shouldShowMenu('add', true) // false (add 모드는 일반적으로 메뉴 숨김)
 * shouldShowMenu('view', true) // true
 * shouldShowMenu('edit', false) // false (메뉴가 없으면 표시 안 함)
 */
export const shouldShowMenu = (mode, hasMenu) => {
  if (!hasMenu) return false;

  // add 모드는 기본적으로 메뉴 숨김 (예외: addSingle, addBulk는 표시)
  const hideMenuModes = ['add'];

  return !hideMenuModes.includes(mode);
};

/**
 * Drawer 상태가 유효한지 확인
 *
 * @param {Object} drawerState - Redux drawer 상태
 * @returns {boolean} 유효성 여부
 */
export const isValidDrawerState = (drawerState) => {
  if (!drawerState) return false;
  if (typeof drawerState !== 'object') return false;
  if (!drawerState.visible) return false;

  return true;
};

/**
 * 키보드 이벤트가 ESC 키인지 확인
 *
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @returns {boolean} ESC 키 여부
 */
export const isEscapeKey = (event) => {
  return event.key === 'Escape' || event.keyCode === 27;
};

/**
 * Feature 라벨 추가 (동적으로 feature 라벨 등록 가능)
 *
 * @param {string} feature - Feature 키
 * @param {string} label - Feature 라벨
 *
 * @example
 * addFeatureLabel('dashboard', '대시보드')
 */
export const addFeatureLabel = (feature, label) => {
  FEATURE_LABELS[feature] = label;
};

/**
 * 등록된 모든 Feature 라벨 조회
 *
 * @returns {Object} Feature 라벨 맵
 */
export const getFeatureLabels = () => {
  return { ...FEATURE_LABELS };
};
