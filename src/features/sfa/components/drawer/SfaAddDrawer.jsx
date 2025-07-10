/**
 * SFA 신규등록 전용 Drawer 컴포넌트
 * add 모드에만 특화된 단순하고 최적화된 구조를 제공합니다.
 */

// src/features/sfa/components/drawer/SfaAddDrawer.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer } from '../../../../store/slices/uiSlice.js';
import { useUiStore } from '../../../../shared/hooks/useUiStore.js';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer.jsx';
import SfaAddForm from '../forms/SfaAddForm.jsx';

/**
 * SFA 신규등록 전용 Drawer
 * - add 모드에만 특화
 * - 단순한 구조로 성능 최적화
 * - 불필요한 메뉴나 상태 관리 제거
 */
const SfaAddDrawer = React.memo(
  ({ drawer }) => {
    const dispatch = useDispatch();
    const { actions: uiActions } = useUiStore();

    // drawer 닫기 핸들러
    const handleClose = () => {
      console.log('🆕 [SfaAddDrawer] 신규등록 Drawer 닫기');
      uiActions.drawer.close();
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
      <BaseDrawer
        visible={drawer.visible}
        title="SFA 신규등록"
        onClose={handleClose}
        width="900px"
        enableOverlayClick={false}
        controlMode="add"
      >
        <SfaAddForm />
      </BaseDrawer>
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
