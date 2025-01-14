import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Divider,
  message,
  Radio,
  Drawer,
  Checkbox,
} from 'antd';
//templete import
import DescriptionItemTemp from '../templete/DescriptionItemTemp';
// import FormItemTemp from '../templete/FormItemTemp';
import FormItemTempProgram from '../templete/FormItemTempProgram';
import setDayjsFormat from '../../modules/common/setDayjsFormat';

const ProgramDrawerForm = (props) => {
  const { drawer, selectBook, handleOnChange, formItems, handleOnSubmit } =
    props;

  // console.log('>>>>(newFormItems)>>>', formItems);
  // console.log('>>>>(drawerInitialValues)>>>', props.initialValues);

  return (
    <>
      {(drawer.action === 'add' ||
        drawer.action === 'edit' ||
        drawer.action === 'proposal-add') &&
      selectBook ? (
        <>
          <FormItemTempProgram
            handleOnChange={handleOnChange}
            selectBook={selectBook}
            formItems={formItems}
            handleOnSubmit={handleOnSubmit}
            // action..edit
            initialValues={props.initialValues}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}
      {drawer.action === 'list' &&
      drawer.subaction &&
      drawer.subaction === 'edit' &&
      selectBook ? (
        <>
          <FormItemTempProgram
            handleOnChange={handleOnChange}
            selectBook={selectBook}
            formItems={formItems}
            handleOnSubmit={handleOnSubmit}
            // action..edit
            initialValues={props.initialValues}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}
      {drawer.action === 'view' && selectBook ? (
        <>
          {props.initialValues ? (
            <DescriptionItemTemp
              initialValues={props.initialValues}
              drawer={drawer}
            />
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default ProgramDrawerForm;
