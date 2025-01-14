import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Divider, message, Radio, Drawer } from 'antd';
//templete import
// import FormItemTemp from '../templete/FormItemTemp';
import FormItemTempProject from '../templete/FormItemTempProject';

const ProjectDrawerForm = (props) => {
  const {
    formItems,
    selectBook,
    // handleOnChange,
    handleOnSubmit,
    handleSelectOnChange,
  } = props;

  return (
    <>
      <FormItemTempProject
        handleOnChange={handleSelectOnChange}
        selectBook={selectBook}
        formItems={formItems}
        handleOnSubmit={handleOnSubmit}
        initialValues={props.initialValues}
        // formInputValue={formInputValue}
        // setFormInputValue={setFormInputValue}
      />
    </>
  );
};

export default ProjectDrawerForm;
