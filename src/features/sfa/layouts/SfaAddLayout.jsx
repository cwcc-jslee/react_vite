// src/features/sfa/layouts/SfaAddLayout.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SfaAddDrawer from '../components/drawer/SfaAddDrawer.jsx';
import { useSfaStore } from '../hooks/useSfaStore.js';

/**
 * SFA 신규등록 전용 레이아웃 컴포넌트 (조건부 마운트 방식)
 * 조건을 만족할 때만 마운트되므로 내부 조건 검사 불필요
 */
const SfaAddLayout = React.memo(() => {
  const drawer = useSelector((state) => state.ui.drawer);
  const { actions } = useSfaStore();

  // 🎯 컴포넌트 마운트 시 기본값으로 초기화, 언마운트 시 빈값으로 초기화
  useEffect(() => {
    actions.form.reset();

    return () => {
      actions.form.clear();
    };
  }, []); // ✅ 빈 배열로 마운트/언마운트 시에만 실행

  // 조건부 마운트 방식이므로 내부 조건 검사 없이 바로 렌더링
  return <SfaAddDrawer drawer={drawer} />;
});

SfaAddLayout.displayName = 'SfaAddLayout';

export default SfaAddLayout;
