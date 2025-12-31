// src/features/customer/containers/CustomerContainer.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Section } from '../../../shared/layout/components';

// Layouts
import CustomerOverviewLayout from '../layouts/CustomerOverviewLayout';

// Components
import CustomerDrawer from '../components/drawer/CustomerDrawer';

/**
 * CUSTOMER 메인 컨테이너 컴포넌트
 * 레이아웃 선택 및 드로어 관리
 */
const CustomerContainer = () => {
  // Redux에서 레이아웃 및 드로어 상태 가져오기
  const { layout } = useSelector((state) => state.ui.pageLayout);
  const drawer = useSelector((state) => state.ui.drawer);

  return (
    <>
      <Section>
        {/* 현재는 overview 레이아웃만 존재 */}
        {(!layout || layout === 'list' || layout === 'overview') && (
          <CustomerOverviewLayout />
        )}
      </Section>

      {/* Drawer */}
      {drawer.visible && <CustomerDrawer drawer={drawer} />}
    </>
  );
};

export default CustomerContainer;
