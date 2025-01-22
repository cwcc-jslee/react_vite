// src/shared/components/ui/drawer/BaseDrawer.jsx
import React, { useEffect } from 'react';

/**
 * BaseDrawer Component
 *
 * @param {Object} props
 * @param {boolean} props.visible - Drawer 표시 여부
 * @param {string} props.title - Drawer 제목
 * @param {string} props.width - Drawer 너비 (default: '400px')
 * @param {Function} props.onClose - Drawer 닫기 콜백 함수
 * @param {React.ReactNode} props.controlMenu - 상단 메뉴 영역 컴포넌트
 * @param {React.ReactNode} props.children - Drawer 내부 컨텐츠
 * @param {boolean} props.enableOverlayClick - Overlay 클릭시 닫기 여부 (default: false)
 * @returns {React.ReactElement|null}
 */
const BaseDrawer = ({
  visible = false,
  title = '',
  width = '900px',
  onClose,
  controlMenu,
  featureMenu,
  children,
  enableOverlayClick = false,
}) => {
  // Drawer가 열리고 닫힐 때 body 스크롤 제어
  useEffect(() => {
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
  }, [visible]);

  if (!visible) return null;

  // Drawer 외부 영역(Overlay) 클릭 핸들러
  const handleOverlayClick = (e) => {
    // enableOverlayClick이 true인 경우에만 닫기 동작 실행
    if (enableOverlayClick && onClose) {
      onClose(e);
    }
  };

  // Drawer 내부 클릭 이벤트 전파 방지
  const handleDrawerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Portal Root를 사용하여 최상위에 렌더링 */}
      {/* Drawer (z-index: 9000-9002) , Modal (z-index: 9999-10000)*/}
      <div className="fixed inset-0 z-[9000] overflow-hidden">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={enableOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          className="fixed inset-y-0 right-0 flex flex-col w-full bg-white shadow-xl"
          style={{ maxWidth: width }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="drawer-title" className="text-lg font-medium text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Close panel</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu */}
          {controlMenu && (
            <>
              <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-200 bg-gray-50">
                {controlMenu}
              </div>
              <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-200 bg-gray-50">
                {featureMenu}
              </div>
            </>
          )}

          {/* Content */}
          <div className="relative flex-1 h-0 overflow-y-auto">
            <div className="absolute inset-0 p-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseDrawer;
