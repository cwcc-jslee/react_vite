import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import ProposalContainler from '../containers/program/ProposalContainer';

const ProposalPage = () => {
  return (
    <>
      <DefaultLayout>
        <ProposalContainler />
      </DefaultLayout>
    </>
  );
};

export default ProposalPage;
