// src/features/customer/containers/CustomerContainer.jsx

import React, { useEffect } from 'react';
import { useCustomer } from '../context/CustomerProvider';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import CustomerSubMenu from '../components/CustomerSubMenu';
import CustomerTable from '../components/table/CustomerTable';
import CustomerStatisticsOverview from '../components/table/CustomerStatisticsOverview';

/**
 * CUSTOMER 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const CustomerContainer = () => {
  // 레이아웃 관련 상태 가져오기
  const { pageLayout, drawerState } = useCustomer();
  const { components } = pageLayout;

  return (
    <>
      <Section>
        <CustomerSubMenu />
        <CustomerStatisticsOverview />
        <br></br>
        {/* {components.searchForm && <SfaSearchForm />}
        {components.forecastTable && <SfaAnnualOverview />}
        {components.monthlyStatus && <SfaQuarterlyOverview />} */}
        {components.customerTable && <CustomerTable />}
      </Section>
      {/* {drawerState.visible && <CustomerDrawer />} */}
    </>
  );
};

export default CustomerContainer;
