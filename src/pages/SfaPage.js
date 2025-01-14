import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import SfaContainer from '../containers/sfa/SfaContainer';

const SfaPage = () => {
  return (
    <>
      <DefaultLayout>
        <SfaContainer />
      </DefaultLayout>
    </>
  );
};

export default SfaPage;
