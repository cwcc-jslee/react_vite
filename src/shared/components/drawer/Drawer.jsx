/**
 * 신규 Drawer 컴포넌트 (Priority 1 개선사항 적용)
 * - Framer Motion 애니메이션
 * - 표준화된 크기 시스템
 * - useUiStore와 통합
 * - ESC 키 지원
 * - 로딩 상태 지원
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import { getWidthClass, shouldShowMenu } from './utils/drawerUtils';
import { DRAWER_ANIMATIONS, DRAWER_DEFAULTS, DRAWER_Z_INDEX } from './constants/drawerConfig';

/**
 * @typedef {import('./types/drawer.types').DrawerProps} DrawerProps
 */

/**
 * Drawer 컴포넌트
 *
 * @param {DrawerProps} props
 * @returns {React.ReactElement | null}
 */
const Drawer = ({
  visible = false,
  title = '',
  width = DRAWER_DEFAULTS.width,
  level = 'primary', // 'primary' | 'secondary' - 중첩 Drawer 지원
  onClose,
  menu,
  headerActions,
  footer,
  children,
  mode,
  enableOverlayClick = DRAWER_DEFAULTS.enableOverlayClick,
  showCloseButton = DRAWER_DEFAULTS.showCloseButton,
  animationEnabled = DRAWER_DEFAULTS.animationEnabled,
  className = '',
}) => {
  // ==================== Body 스크롤 제어 ====================
  // 중첩 Drawer(secondary)는 body 스크롤 제어를 하지 않음
  // Primary Drawer만 body 스크롤을 제어
  useEffect(() => {
    // Secondary level Drawer는 body 스크롤 제어 건너뛰기
    if (level === 'secondary') {
      return;
    }

    if (visible) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // 스크롤 위치 복원
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      // cleanup: drawer가 언마운트될 때 스타일 초기화
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [visible, level]);

  // ==================== ESC 키 핸들러 ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible && onClose) {
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  // ==================== 메뉴 표시 여부 결정 ====================
  const showMenu = shouldShowMenu(mode, !!menu);

  // ==================== Width 클래스 계산 ====================
  const widthClass = getWidthClass(width);

  // ==================== z-index 계산 (level에 따라) ====================
  const zIndex = level === 'secondary'
    ? DRAWER_Z_INDEX.SECONDARY_DRAWER
    : DRAWER_Z_INDEX.PRIMARY_DRAWER;

  const overlayOpacity = level === 'secondary' ? 0.3 : 0.5;

  // ==================== 렌더링 ====================
  if (!visible) return null;

  // 애니메이션 비활성화 시 일반 렌더링
  if (!animationEnabled) {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex }}>
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          onClick={enableOverlayClick ? onClose : undefined}
        />

        {/* Drawer Container */}
        <div className="absolute inset-y-0 right-0 flex max-w-full">
          <div className={`relative ${widthClass} h-full ${className}`}>
            <DrawerContent
              title={title}
              onClose={onClose}
              showCloseButton={showCloseButton}
              showMenu={showMenu}
              menu={menu}
              headerActions={headerActions}
              footer={footer}
            >
              {children}
            </DrawerContent>
          </div>
        </div>
      </div>
    );
  }

  // 애니메이션 활성화 시 Framer Motion 렌더링
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex }}>
          {/* Overlay with fade animation */}
          <motion.div
            initial={DRAWER_ANIMATIONS.overlay.initial}
            animate={{ ...DRAWER_ANIMATIONS.overlay.animate, opacity: overlayOpacity }}
            exit={DRAWER_ANIMATIONS.overlay.exit}
            transition={DRAWER_ANIMATIONS.overlay.transition}
            className="absolute inset-0 bg-black"
            onClick={enableOverlayClick ? onClose : undefined}
          />

          {/* Drawer with slide animation */}
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <motion.div
              initial={DRAWER_ANIMATIONS.drawer.initial}
              animate={DRAWER_ANIMATIONS.drawer.animate}
              exit={DRAWER_ANIMATIONS.drawer.exit}
              transition={DRAWER_ANIMATIONS.drawer.transition}
              className={`relative ${widthClass} h-full ${className}`}
            >
              <DrawerContent
                title={title}
                onClose={onClose}
                showCloseButton={showCloseButton}
                showMenu={showMenu}
                menu={menu}
                headerActions={headerActions}
                footer={footer}
              >
                {children}
              </DrawerContent>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * Drawer 내부 컨텐츠 컴포넌트
 * (공통 구조를 재사용하기 위해 분리)
 */
const DrawerContent = ({
  title,
  onClose,
  showCloseButton,
  showMenu,
  menu,
  headerActions,
  footer,
  children,
}) => (
  <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-2">
        {/* Header Actions (더보기 메뉴 등) */}
        {headerActions && <div className="flex items-center">{headerActions}</div>}
        {/* 닫기 버튼 */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-gray-100 rounded-md"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>

    {/* Menu Area */}
    {showMenu && menu && (
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        {menu}
      </div>
    )}

    {/* Content Area with Scrolling */}
    <div className="relative flex-1 overflow-y-auto">
      <div className="p-6">{children}</div>
    </div>

    {/* Footer (optional) */}
    {footer && (
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        {footer}
      </div>
    )}
  </div>
);

DrawerContent.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showCloseButton: PropTypes.bool,
  showMenu: PropTypes.bool,
  menu: PropTypes.node,
  headerActions: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
};

Drawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  level: PropTypes.oneOf(['primary', 'secondary']),
  menu: PropTypes.node,
  headerActions: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
  mode: PropTypes.string,
  enableOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  animationEnabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Drawer;
