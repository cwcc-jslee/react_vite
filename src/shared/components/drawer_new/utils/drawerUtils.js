/**
 * Drawer 관련 유틸리티 (drawer_new 버전)
 */
import { DRAWER_SIZE_CLASSES } from '../constants/drawerConfig';

export const getWidthClass = (width) => {
    if (DRAWER_SIZE_CLASSES[width]) return DRAWER_SIZE_CLASSES[width];
    if (typeof width === 'string' && width.endsWith('px')) return `w-[${width}]`;
    return DRAWER_SIZE_CLASSES.MD;
};

export const isEscapeKey = (event) => {
    return event.key === 'Escape' || event.keyCode === 27;
};
