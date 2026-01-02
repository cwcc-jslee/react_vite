/**
 * Drawer 컴포넌트 관련 타입 정의 (JSDoc)
 * TypeScript 마이그레이션 전까지 JSDoc으로 타입 안정성 확보
 */

/**
 * @typedef {'SM' | 'MD' | 'LG' | 'XL' | 'FULL'} DrawerSize
 * Drawer 크기 타입
 */

/**
 * @typedef {'add' | 'view' | 'edit' | 'addSingle' | 'addBulk' | 'status'} DrawerMode
 * Drawer 모드 타입
 */

/**
 * @typedef {'toggle' | 'dropdown' | 'tabs'} DrawerMenuType
 * Drawer 메뉴 타입
 */

/**
 * @typedef {Object} DrawerMenuItem
 * Drawer 메뉴 아이템
 * @property {string} key - 메뉴 항목 고유 키
 * @property {string} label - 메뉴 항목 표시 텍스트
 * @property {Function} [onClick] - 클릭 핸들러
 * @property {React.ComponentType} [icon] - 아이콘 컴포넌트 (lucide-react)
 * @property {boolean} [disabled] - 비활성화 여부
 * @property {boolean} [active] - 활성 상태 여부
 */

/**
 * @typedef {Object} DrawerProps
 * 메인 Drawer 컴포넌트 Props
 * @property {boolean} visible - Drawer 표시 여부
 * @property {string} title - Drawer 제목
 * @property {Function} onClose - 닫기 핸들러
 * @property {DrawerSize | string} [width='MD'] - Drawer 너비 (DRAWER_SIZES 키 또는 픽셀 값)
 * @property {boolean} [enableOverlayClick=false] - 오버레이 클릭 시 닫기 활성화
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부
 * @property {React.ReactNode} [menu] - 메뉴 영역 컴포넌트
 * @property {React.ReactNode} [footer] - 푸터 영역 컴포넌트
 * @property {React.ReactNode} children - Drawer 내용
 * @property {DrawerMode} [mode] - Drawer 모드 (menu 표시 제어용)
 * @property {boolean} [animationEnabled=true] - 애니메이션 활성화 여부
 * @property {string} [className] - 추가 CSS 클래스
 */

/**
 * @typedef {Object} DrawerMenuProps
 * DrawerMenu 컴포넌트 Props
 * @property {DrawerMenuType} [type='toggle'] - 메뉴 타입
 * @property {DrawerMenuItem[]} items - 메뉴 항목 배열
 * @property {string} [activeKey] - 현재 활성화된 메뉴 키
 * @property {Function} [onItemClick] - 메뉴 항목 클릭 핸들러 (key) => void
 * @property {string} [className] - 추가 CSS 클래스
 */

/**
 * @typedef {Object} DrawerHeaderProps
 * DrawerHeader 컴포넌트 Props
 * @property {string} title - 헤더 제목
 * @property {string} [subtitle] - 헤더 부제목
 * @property {React.ComponentType} [icon] - 제목 아이콘
 * @property {Function} onClose - 닫기 핸들러
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부
 * @property {React.ReactNode} [actions] - 추가 액션 버튼 영역
 */

/**
 * @typedef {Object} DrawerContentProps
 * DrawerContent 컴포넌트 Props
 * @property {React.ReactNode} children - 컨텐츠 내용
 * @property {boolean} [isLoading=false] - 로딩 상태
 * @property {string} [loadingMessage='데이터를 불러오는 중...'] - 로딩 메시지
 * @property {string} [className] - 추가 CSS 클래스
 */

/**
 * @typedef {Object} DrawerFooterProps
 * DrawerFooter 컴포넌트 Props
 * @property {React.ReactNode} [children] - 푸터 내용
 * @property {Function} [onCancel] - 취소 버튼 핸들러
 * @property {Function} [onSubmit] - 제출 버튼 핸들러
 * @property {string} [cancelText='취소'] - 취소 버튼 텍스트
 * @property {string} [submitText='확인'] - 제출 버튼 텍스트
 * @property {boolean} [isSubmitting=false] - 제출 중 상태
 * @property {boolean} [isValid=true] - 유효성 검사 상태
 * @property {boolean} [showActions=true] - 액션 버튼 표시 여부
 */

/**
 * @typedef {Object} UseDrawerReturn
 * useDrawer hook 반환값
 * @property {Object} drawer - Drawer 상태 (Redux state.ui.drawer)
 * @property {Object} actions - Drawer 액션
 * @property {Function} actions.open - Drawer 열기 (config) => void
 * @property {Function} actions.close - Drawer 닫기 () => void
 * @property {Function} actions.update - Drawer 상태 업데이트 (config) => void
 * @property {Function} actions.setMode - Drawer 모드 변경 (mode) => void
 * @property {Function} actions.setData - Drawer 데이터 설정 (data) => void
 */

// Export for JSDoc usage
export {};
