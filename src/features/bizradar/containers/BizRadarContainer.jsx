/**
 * BizRadar 컨테이너 - 레이아웃 오케스트레이터
 * Redux 상태에 따라 적절한 레이아웃을 렌더링
 */
import React, { useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Section } from '@shared/layout/components';
import { closeDrawer } from '@/store/slices/uiSlice';
import { useBizRadarStore } from '../hooks/useBizRadarStore';

// 레이아웃 컴포넌트
import BizRadarDiscoveryLayout from '../layouts/BizRadarDiscoveryLayout';
import BizRadarDashboardV2Layout from '../layouts/BizRadarDashboardV2Layout';
import BizRadarDashboardLayout from '../layouts/BizRadarDashboardLayout';
import BizRadarListLayout from '../layouts/BizRadarListLayout';
import BizRadarReviewLayout from '../layouts/BizRadarReviewLayout';
import BizRadarSearchLayout from '../layouts/BizRadarSearchLayout';
import BizRadarArchiveLayout from '../layouts/BizRadarArchiveLayout';
import BizRadarViewEditLayout from '../layouts/BizRadarViewEditLayout';
import BizRadarMatchingLayout from '../layouts/BizRadarMatchingLayout';

const BizRadarContainer = memo(() => {
  const dispatch = useDispatch();
  const { layout } = useSelector((state) => state.ui.pageLayout);
  const drawer = useSelector((state) => state.ui.drawer);
  const { actions } = useBizRadarStore();

  // 초기 데이터 로드 - 각 레이아웃에서 자체적으로 필터 설정 후 데이터 로드
  // useEffect(() => {
  //   actions.data.fetchList();
  // }, []);

  // 드로어 닫기 핸들러
  const handleCloseDrawer = () => {
    dispatch(closeDrawer());
    actions.data.clearSelected();
    actions.form.reset();
  };

  return (
    <>
      <Section>
        {layout === 'discovery' && <BizRadarDiscoveryLayout />}
        {layout === 'dashboard_v2' && <BizRadarDashboardV2Layout />}
        {layout === 'dashboard' && <BizRadarDashboardLayout />}
        {layout === 'list' && <BizRadarListLayout />}
        {layout === 'review' && <BizRadarReviewLayout />}
        {layout === 'search' && <BizRadarSearchLayout />}
        {layout === 'matching' && <BizRadarMatchingLayout />}
        {layout === 'archive' && <BizRadarArchiveLayout />}
      </Section>

      {/* 상세/수정 드로어 */}
      {drawer.visible && ['view', 'edit', 'review'].includes(drawer.mode) && (
        <BizRadarViewEditLayout onClose={handleCloseDrawer} />
      )}
    </>
  );
});

BizRadarContainer.displayName = 'BizRadarContainer';

export default BizRadarContainer;
