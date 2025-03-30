// src/shared/components/ui/grid/Grid.jsx
/**
 * Ant Design 스타일의 그리드 시스템 구현 (Row, Col)
 * 반응형 레이아웃과 정렬, 간격 등 다양한 레이아웃 옵션을 제공합니다.
 */

import React from 'react';

/**
 * Row: 수평 방향 컨테이너 컴포넌트
 * 그리드 시스템의 행(row)을 구현하며 Col 컴포넌트를 포함합니다.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Row 내부 컴포넌트들
 * @param {'start'|'end'|'center'|'space-around'|'space-between'} [props.justify='start'] - 수평 정렬 방식
 * @param {'top'|'middle'|'bottom'|'stretch'} [props.align='top'] - 수직 정렬 방식
 * @param {number|string} [props.gutter] - 컬럼 간격 (px 단위 숫자 또는 [수평값, 수직값] 형태)
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const Row = ({
  children,
  justify = 'start',
  align = 'top',
  gutter = 0,
  className = '',
  ...props
}) => {
  // justify 속성에 따른 스타일 매핑
  const justifyStyles = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-around': 'justify-around',
    'space-between': 'justify-between',
  };

  // align 속성에 따른 스타일 매핑
  const alignStyles = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch',
  };

  // 기본 스타일
  const baseStyles = 'flex flex-wrap w-full';

  // gutter 처리
  let horizontalGutter = 0;
  let verticalGutter = 0;

  if (typeof gutter === 'number') {
    horizontalGutter = gutter / 2;
    verticalGutter = gutter / 2;
  } else if (Array.isArray(gutter) && gutter.length === 2) {
    horizontalGutter = gutter[0] / 2;
    verticalGutter = gutter[1] / 2;
  }

  // Row 스타일
  const rowStyle = {
    marginLeft: horizontalGutter ? -horizontalGutter : null,
    marginRight: horizontalGutter ? -horizontalGutter : null,
  };

  // 자식 요소에 gutter 적용
  const childrenWithGutter = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const childStyle = {
      paddingLeft: horizontalGutter ? horizontalGutter : null,
      paddingRight: horizontalGutter ? horizontalGutter : null,
      paddingTop: verticalGutter ? verticalGutter : null,
      paddingBottom: verticalGutter ? verticalGutter : null,
    };

    return React.cloneElement(child, {
      style: { ...childStyle, ...child.props.style },
    });
  });

  return (
    <div
      className={`${baseStyles} ${justifyStyles[justify] || ''} ${
        alignStyles[align] || ''
      } ${className}`}
      style={rowStyle}
      {...props}
    >
      {childrenWithGutter}
    </div>
  );
};

/**
 * Col: 그리드 컬럼 컴포넌트
 * 24칸 그리드 시스템을 기반으로 너비를 계산합니다.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 컬럼 내부 컴포넌트들
 * @param {number} [props.span] - 컬럼이 차지하는 그리드 칸 수 (1-24)
 * @param {number} [props.offset] - 왼쪽 오프셋 (1-24)
 * @param {number} [props.xs] - 모바일 화면에서의 칸 수
 * @param {number} [props.sm] - 태블릿 화면에서의 칸 수
 * @param {number} [props.md] - 작은 데스크탑 화면에서의 칸 수
 * @param {number} [props.lg] - 큰 데스크탑 화면에서의 칸 수
 * @param {number} [props.xl] - 초대형 화면에서의 칸 수
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export const Col = ({
  children,
  span,
  offset,
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  style = {},
  ...props
}) => {
  // 기본 스타일 객체
  const colStyle = { ...style };

  // 기본 span 값 처리
  if (span) {
    // 24칸 그리드 시스템 기준으로 퍼센트 계산
    colStyle.width = `${(span / 24) * 100}%`;
  }

  // offset 처리
  if (offset) {
    colStyle.marginLeft = `${(offset / 24) * 100}%`;
  }

  // 반응형 클래스와 스타일
  let responsiveClasses = '';

  // 기본값 지정 (아무 값도 없을 경우 full width)
  if (!span && !xs && !sm && !md && !lg && !xl) {
    colStyle.width = '100%';
  }

  // xs: 모바일 (<640px)
  if (xs !== undefined) {
    responsiveClasses += ` w-[${(xs / 24) * 100}%] sm:w-auto`;
  }

  // sm: 태블릿 (≥640px)
  if (sm !== undefined) {
    responsiveClasses += ` sm:w-[${(sm / 24) * 100}%]`;
  }

  // md: 작은 데스크탑 (≥768px)
  if (md !== undefined) {
    responsiveClasses += ` md:w-[${(md / 24) * 100}%]`;
  }

  // lg: 큰 데스크탑 (≥1024px)
  if (lg !== undefined) {
    responsiveClasses += ` lg:w-[${(lg / 24) * 100}%]`;
  }

  // xl: 초대형 화면 (≥1280px)
  if (xl !== undefined) {
    responsiveClasses += ` xl:w-[${(xl / 24) * 100}%]`;
  }

  return (
    <div
      className={`box-border ${responsiveClasses} ${className}`}
      style={colStyle}
      {...props}
    >
      {children}
    </div>
  );
};
