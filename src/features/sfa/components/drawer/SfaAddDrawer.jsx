/**
 * SFA 신규등록 전용 Drawer 컴포넌트 (신규 Drawer 시스템 적용)
 * - Framer Motion 애니메이션 적용
 * - useDrawer Hook 사용
 * - 표준화된 크기 시스템
 */

// src/features/sfa/components/drawer/SfaAddDrawer.jsx
import React from 'react';
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import SfaAddForm from '../forms/SfaAddForm.jsx';

/**
 * SFA 신규등록 전용 Drawer
 * - add 모드에만 특화
 * - 신규 Drawer 시스템으로 애니메이션 및 성능 개선
 */
const SfaAddDrawer = React.memo(
  ({ drawer }) => {
    const { close } = useDrawer();

    // drawer 닫기 핸들러
    const handleClose = () => {
      console.log('🆕 [SfaAddDrawer] 신규등록 Drawer 닫기');
      close();
    };

    // 렌더링 추적
    const renderCount = React.useRef(0);
    renderCount.current += 1;

    console.log(`🆕 [SfaAddDrawer] 렌더링 횟수: ${renderCount.current}`);
    console.log(`🆕 [SfaAddDrawer] drawer 상태:`, {
      visible: drawer.visible,
      mode: drawer.mode,
    });

    return (
      <Drawer
        visible={drawer.visible}
        title="SFA 신규등록"
        onClose={handleClose}
        width={DRAWER_SIZES.XL}
        enableOverlayClick={false}
        mode="add"
        animationEnabled={true}
      >
        <SfaAddForm />
      </Drawer>
    );
  },
  (prevProps, nextProps) => {
    // 최적화된 비교 함수 - add 모드에 필요한 props만 비교
    const prevDrawer = prevProps.drawer;
    const nextDrawer = nextProps.drawer;

    const isEqual =
      prevDrawer.visible === nextDrawer.visible &&
      prevDrawer.mode === nextDrawer.mode;

    console.log('🆕 [SfaAddDrawer] memo 비교:', {
      visible: { prev: prevDrawer.visible, next: nextDrawer.visible },
      mode: { prev: prevDrawer.mode, next: nextDrawer.mode },
      shouldRender: !isEqual,
    });

    return isEqual;
  },
);

SfaAddDrawer.displayName = 'SfaAddDrawer';

export default SfaAddDrawer;
