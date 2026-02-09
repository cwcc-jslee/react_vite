/**
 * Drawer 설정 상수 (drawer_new 버전)
 */

export const DRAWER_SIZES = {
    SM: '400px',
    MD: '600px',
    LG: '800px',
    XL: '1100px',
    XXL: '1200px',
    WIDE: 'calc(100vw - 300px)',
    FULL: '100vw',
};

export const DRAWER_SIZE_CLASSES = {
    SM: 'w-[400px]',
    MD: 'w-[600px]',
    LG: 'w-[800px]',
    XL: 'w-[1100px]',
    XXL: 'w-[1200px]',
    WIDE: 'w-[calc(100vw-300px)]',
    FULL: 'w-screen',
};

export const DRAWER_MODES = {
    ADD: 'add',
    VIEW: 'view',
    EDIT: 'edit',
    REVIEW: 'review', // 신규 추가
};

export const DRAWER_ANIMATIONS = {
    overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 0.5 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    },
    drawer: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { type: 'spring', damping: 30, stiffness: 300 }
    }
};
