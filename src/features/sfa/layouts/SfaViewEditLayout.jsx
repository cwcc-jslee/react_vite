// src/features/sfa/layouts/SfaViewEditLayout.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import SfaViewDrawer from '../components/drawer/SfaViewDrawer.jsx';
import { useSfaStore } from '../hooks/useSfaStore.js';

/**
 * SFA 상세보기/수정 전용 레이아웃 컴포넌트
 * view 모드와 edit 모드일 때만 렌더링되며, 상세 정보 조회 및 수정에 특화된 UI/UX를 제공합니다.
 */
const SfaViewEditLayout = React.memo(() => {
  const drawer = useSelector((state) => state.ui.drawer);
  const { actions } = useSfaStore();

  // 🔄 Edit/View 모드 진입 시 데이터 설정, 레이아웃 종료 시 빈값으로 초기화
  React.useEffect(() => {
    actions.form.reset(drawer.data);

    return () => {
      actions.form.clear();
    };
  }, []);

  // view 또는 edit 모드가 아닐 때는 렌더링하지 않음
  if (!['view', 'edit'].includes(drawer.mode)) {
    return null;
  }

  return <SfaViewDrawer drawer={drawer} />;
});

SfaViewEditLayout.displayName = 'SfaViewEditLayout';

export default SfaViewEditLayout;
