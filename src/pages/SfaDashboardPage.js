import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import SfaDashboardContainer from '../containers/SfaDashboardContainer';
import SalesForecastContainer from '../containers/SfaContainer/SalesForecastContainer/SalesForecastContainer';

const SfaDashboardPage = () => {
  return (
    <>
      <DefaultLayout>
        <SalesForecastContainer />
      </DefaultLayout>
    </>
  );
};

export default SfaDashboardPage;
