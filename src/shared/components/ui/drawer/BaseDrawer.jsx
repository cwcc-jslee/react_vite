/**
 * 기본 Drawer 컴포넌트 - 모든 Drawer의 기본이 되는 컴포넌트입니다.
 * 헤더, 컨텐츠 영역, 오버레이 등 Drawer의 기본 구조를 제공합니다.
 */

// src/shared/components/ui/drawer/BaseDrawer.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../index';
import { X } from 'lucide-react';

/**
 * BaseDrawer Component
 *
 * @param {Object} props
 * @param {boolean} props.visible - Drawer 표시 여부
 * @param {string} props.title - Drawer 제목
 * @param {string|number} props.width - Drawer 너비 (default: '600px')
 * @param {Function} props.onClose - 닫기 핸들러
 * @param {React.ReactNode} props.menu - 상단 메뉴 영역
 * @param {React.ReactNode} props.children - Drawer 내용
 * @param {boolean} [props.enableOverlayClick=false] - 오버레이 클릭 시 닫기 활성화 여부
 */
const BaseDrawer = ({
  visible = false,
  title = '',
  width = '900px',
  onClose,
  // controlMenu,
  // featureMenu,
  menu,
  children,
  enableOverlayClick = false,
  controlMode = 'view',
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

  // Convert width to tailwind class if possible
  const getWidthClass = (w) => {
    const widthMap = {
      '600px': 'w-[600px]',
      '800px': 'w-[800px]',
      '400px': 'w-[400px]',
    };
    return widthMap[w] || `w-[${w}]`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={enableOverlayClick ? onClose : undefined}
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className={`relative ${getWidthClass(width)} h-full`}>
          {/* Drawer Content */}
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              <Button
                variant="outline"
                size="sm"
                className="h-12 w-12 p-1 hover:bg-gray-100 hover:text-gray-900 border-gray-200"
                onClick={onClose}
              >
                <X className="h-8 w-8" />
              </Button>
            </div>

            {/* Menu Area */}
            {/* {menu && ( */}
            {menu && controlMode !== 'add' && (
              <div className="border-b border-gray-200 px-4 py-2">{menu}</div>
            )}

            {/* Content Area with Scrolling */}
            <div className="relative flex-1 overflow-y-auto">
              <div className="p-4">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BaseDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  menu: PropTypes.node,
  children: PropTypes.node,
  enableOverlayClick: PropTypes.bool,
  controlMode: PropTypes.oneOf(['view', 'edit', 'add']),
};

export default BaseDrawer;
