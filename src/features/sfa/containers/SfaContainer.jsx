// src/features/sfa/containers/SfaContainer.jsx
import React from 'react';
import styled from 'styled-components';
import { useSfa } from '../context/SfaContext';
import SfaSubMenu from '../components/SfaSubMenu';
import SfaMonthlyStatus from '../components/SfaMonthlyStatus';
import SfaTable from '../components/SfaTable';
import SfaSearchForm from '../components/SfaSearchForm';
import SfaForecastTable from '../components/SfaForecastTable';
import SfaDrawer from './SfaDrawer';

const Container = styled.div`
  padding: 24px;
`;

const SfaContainer = () => {
  const { pageLayout } = useSfa();
  const { components } = pageLayout;

  return (
    <Container>
      <SfaSubMenu />
      {components.searchForm && <SfaSearchForm />}
      {components.monthlyStatus && <SfaMonthlyStatus />}
      {components.sfaTable && <SfaTable />}
      {components.forecastTable && <SfaForecastTable />}

      {/* Drawer */}
      <SfaDrawer />
    </Container>
  );
};

export default SfaContainer;
