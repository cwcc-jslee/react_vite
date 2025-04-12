// src/shared/components/ui/tooltip/Tooltip.jsx

import React, { useState, useRef, useEffect } from 'react';

/**
 * 툴팁 컴포넌트
 * 요소에 마우스를 올리면 추가 정보를 표시하는 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {ReactNode} props.children - 툴팁을 표시할 대상 요소
 * @param {ReactNode|string} props.content - 툴팁에 표시할 내용
 * @param {string} props.position - 툴팁 표시 위치 ('top', 'bottom', 'left', 'right')
 * @param {string} props.className - 추가 클래스명
 * @param {number} props.delay - 툴팁 표시 지연 시간 (ms)
 * @returns {JSX.Element} 툴팁 컴포넌트
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 300,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  // 위치에 따른 클래스 결정
  const getPositionClass = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-1';
      case 'top':
        return 'bottom-full mb-1';
      case 'left':
        return 'right-full mr-1';
      case 'right':
        return 'left-full ml-1';
      default:
        return 'bottom-full mb-1';
    }
  };

  // 애니메이션 클래스 결정
  const getAnimationClass = () => {
    switch (position) {
      case 'bottom':
        return 'animate-fade-in-down';
      case 'top':
        return 'animate-fade-in-up';
      case 'left':
        return 'animate-fade-in-left';
      case 'right':
        return 'animate-fade-in-right';
      default:
        return 'animate-fade-in-up';
    }
  };

  // 툴팁 위치 계산
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let style = { position: 'absolute' };

    switch (position) {
      case 'bottom':
        style = {
          ...style,
          left: '50%',
          transform: 'translateX(-50%)',
        };
        break;
      case 'top':
        style = {
          ...style,
          left: '50%',
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        style = {
          ...style,
          top: '50%',
          transform: 'translateY(-50%)',
        };
        break;
      case 'right':
        style = {
          ...style,
          top: '50%',
          transform: 'translateY(-50%)',
        };
        break;
      default:
        break;
    }

    setTooltipStyle(style);
  };

  // 마우스 진입 핸들러
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // 툴팁이 렌더링된 후에 위치를 계산
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  // 마우스 벗어남 핸들러
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // 창 크기 변경 시 위치 재계산
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
      {...rest}
    >
      {children}

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 whitespace-nowrap py-1 px-2 rounded text-xs
            bg-gray-800 text-white shadow-lg pointer-events-none
            ${getPositionClass()}
            ${getAnimationClass()}
            ${className}
          `}
          style={tooltipStyle}
          role="tooltip"
        >
          {/* 화살표 */}
          <div
            className={`
              absolute w-0 h-0 border-solid
              ${
                position === 'top'
                  ? 'border-t-4 border-x-4 border-transparent border-t-gray-800 bottom-[-8px] left-1/2 transform -translate-x-1/2'
                  : ''
              }
              ${
                position === 'bottom'
                  ? 'border-b-4 border-x-4 border-transparent border-b-gray-800 top-[-8px] left-1/2 transform -translate-x-1/2'
                  : ''
              }
              ${
                position === 'left'
                  ? 'border-l-4 border-y-4 border-transparent border-l-gray-800 right-[-8px] top-1/2 transform -translate-y-1/2'
                  : ''
              }
              ${
                position === 'right'
                  ? 'border-r-4 border-y-4 border-transparent border-r-gray-800 left-[-8px] top-1/2 transform -translate-y-1/2'
                  : ''
              }
            `}
          />
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
