import React from 'react';
import DefaultLayout from '../components/Layout/DefaultLayout';
import AdminContainer from '../containers/admin/AdminContainer';
import FormItemTempProject from '../components/templete/FormItemTempProject';
import * as CONF from '../config/projectConfig';
import RndContainer from '../containers/RndContainer';

const RndPage = () => {
  const selectBook = [];
  const handleOnSubmit = () => {
    //
  };
  const handleSelectOnChange = () => {
    //
  };

  return (
    <DefaultLayout>
      {/* <AdminContainer /> */}
      <h1>연구개발 페이지</h1>
      <RndContainer />
      {/* <FormItemTempProject
        handleOnChange={handleSelectOnChange}
        selectBook={selectBook}
        formItems={CONF.drawerFormItems}
        handleOnSubmit={handleOnSubmit}
        // initialValues={props.initialValues}
      /> */}
    </DefaultLayout>
  );
};

export default RndPage;
