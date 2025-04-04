// src/features/customer/containers/CustomerContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useCustomer } from '../context/CustomerProvider';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import CustomerSubMenu from '../components/CustomerSubMenu';
import CustomerTable from '../components/tables/CustomerTable';
import CustomerStatisticsOverview from '../components/tables/CustomerStatisticsOverview';
import CustomerDrawer from '../components/drawer/CustomerDrawer';

/**
 * CUSTOMER 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const CustomerContainer = () => {
  // 레이아웃 관련 상태 가져오기
  const { pageLayout, drawerState } = useCustomer();
  // const { components } = pageLayout;

  // 레이아웃, 드로우어 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);
  const drawer = useSelector((state) => state.ui.drawer);

  return (
    <>
      <Section>
        {/* <CustomerSubMenu /> */}
        <CustomerStatisticsOverview />
        <br></br>
        {components.customerTable && <CustomerTable />}
      </Section>
      {drawer.visible && <CustomerDrawer drawer={drawer} />}
    </>
  );
};

export default CustomerContainer;
