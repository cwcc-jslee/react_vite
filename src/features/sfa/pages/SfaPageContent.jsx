// src/features/sfa/pages/SfaPageContent.jsx
// SfaPage.jsx 에서 분리
// SfaPage 컴포넌트가 useSfa hook을 사용하기 전에 SfaProvider로 감싸져 있지 않아서 발생하는 문제해결
import React from 'react';
import { useSfa } from '../context/SfaContext';
import { Section } from '../../../shared/components/ui/layout/components.jsx';

// Components
import SfaQuarterlyOverview from '../components/tables/SfaQuarterlyOverview.jsx';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview.jsx';
import SfaTableList from '../components/tables/SfaTableList';
//
import SfaDrawer from '../components/drawer/SfaDrawer.jsx';
import SfaSubMenu from '../components/SfaSubMenu';
// import SfaMonthlyStatus from '../components/SfaMonthlyStatus';
// import SfaTable from '../components/SfaTable';
import SfaSearchForm from '../components/forms/SfaSearchForm/index.jsx';
// import SfaForecastTable from '../components/SfaForecastTable';

/**
 * SfaPageContent Component
 * Renders the main content of the SFA page and handles drawer functionality
 */
const SfaPageContent = () => {
  const { pageLayout } = useSfa();
  const { components } = pageLayout;

  return (
    <>
      <Section>
        <SfaSubMenu />
        {components.searchForm && <SfaSearchForm />}
        {components.monthlyStatus && <SfaQuarterlyOverview />}
        {components.sfaTable && <SfaTableList />}
        {components.forecastTable && <SfaAnnualOverview />}
      </Section>
      <SfaDrawer />
    </>
  );
};

export default SfaPageContent;
