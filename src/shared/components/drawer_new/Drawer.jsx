import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import { getWidthClass } from './utils/drawerUtils';
import { DRAWER_ANIMATIONS } from './constants/drawerConfig';

/**
 * 차세대 Drawer 컴포넌트 (drawer_new)
 * - Sticky Footer 공식 지원
 * - Framer Motion 애니메이션 내장
 * - 일관된 디자인 시스템 적용
 */
const Drawer = ({
    visible = false,
    title = '',
    width = 'MD',
    onClose,
    headerActions,
    footer,
    children,
    mode,
    enableOverlayClick = false,
    animationEnabled = true,
    className = '',
}) => {
    // ESC 키 지원
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && visible && onClose) onClose();
        };
        if (visible) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, onClose]);

    const widthClass = getWidthClass(width);

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* 오버레이 */}
                    <motion.div
                        initial={DRAWER_ANIMATIONS.overlay.initial}
                        animate={DRAWER_ANIMATIONS.overlay.animate}
                        exit={DRAWER_ANIMATIONS.overlay.exit}
                        transition={DRAWER_ANIMATIONS.overlay.transition}
                        className="absolute inset-0 bg-black"
                        onClick={enableOverlayClick ? onClose : undefined}
                    />

                    {/* 컨테이너 */}
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <motion.div
                            initial={DRAWER_ANIMATIONS.drawer.initial}
                            animate={DRAWER_ANIMATIONS.drawer.animate}
                            exit={DRAWER_ANIMATIONS.drawer.exit}
                            transition={DRAWER_ANIMATIONS.drawer.transition}
                            className={`relative ${widthClass} h-full bg-white shadow-2xl flex flex-col ${className}`}
                        >
                            {/* 헤더 */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white z-20">
                                <div className="flex-1 min-w-0">
                                    {typeof title === 'string' ? (
                                        <h2 className="text-xl font-bold text-gray-900 truncate">{title}</h2>
                                    ) : (
                                        title
                                    )}
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                    {headerActions && <div className="flex items-center">{headerActions}</div>}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 w-10 p-0 hover:bg-gray-100 rounded-xl"
                                        onClick={onClose}
                                    >
                                        <X className="h-6 w-6 text-gray-400" />
                                    </Button>
                                </div>
                            </div>

                            {/* 스크롤 가능한 본문 영역 */}
                            <div className="flex-1 overflow-y-auto relative bg-white">
                                <div className="p-8">
                                    {children}
                                </div>
                            </div>

                            {/* 하단 고정 푸터 (Sticky Footer) */}
                            {footer && (
                                <div className="border-t border-gray-100 bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-20">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

Drawer.propTypes = {
    visible: PropTypes.bool.isRequired,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    onClose: PropTypes.func.isRequired,
    width: PropTypes.string,
    headerActions: PropTypes.node,
    footer: PropTypes.node,
    children: PropTypes.node,
    mode: PropTypes.string,
    enableOverlayClick: PropTypes.bool,
    animationEnabled: PropTypes.bool,
    className: PropTypes.string,
};

export default Drawer;
