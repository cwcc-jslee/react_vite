// src/features/sfa/containers/SfaContainer.jsx
import React from 'react';
import { useSfa } from '../context/SfaContext';
import { Section } from '../../../shared/components/ui/layout/components.jsx';
import SfaSubMenu from '../components/SfaSubMenu';
import SfaMonthlyStatus from '../components/SfaMonthlyStatus';
import SfaTable from '../components/SfaTable';
import SfaSearchForm from '../components/SfaSearchForm';
import SfaForecastTable from '../components/SfaForecastTable';
import SfaDrawer from './SfaDrawer';

const SfaContainer = () => {
  const { pageLayout } = useSfa();
  const { components } = pageLayout;

  return (
    <Section>
      <SfaSubMenu />
      {components.searchForm && <SfaSearchForm />}
      {components.monthlyStatus && <SfaMonthlyStatus />}
      {components.sfaTable && <SfaTable />}
      {components.forecastTable && <SfaForecastTable />}
      <SfaDrawer />
    </Section>
  );
};

export default SfaContainer;
