import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import ProgramContainer from '../containers/program/ProgramContainer';

const ProgramPage = () => {
  return (
    <>
      <DefaultLayout>
        <ProgramContainer />
      </DefaultLayout>
    </>
  );
};

export default ProgramPage;
