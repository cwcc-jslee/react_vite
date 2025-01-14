import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as api from '../lib/api/api';
import {
  changeDrawerVisible,
  initDrawerVisible,
  fetchCodebook,
} from '../modules/status';
import { Button, Space, Divider, Radio, Drawer, Row, Col } from 'antd';
import ListTableForm from '../components/templete/ListTableForm';
import * as CONF from '../config/workConfig';
import ActionButton from '../components/common/ActionButton';
import { useLocation } from 'react-router-dom';

const Base = styled.div`
  width: 100%;
`;

const DrawerBlock = styled.div`
  //
`;

const WorkContainer = () => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));

  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  //
  const [tableData, setTableData] = useState();
  const [selectBook, setSelectBook] = useState();
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  //**************************************************/
  useEffect(() => {
    // dispatch(getList('api/sfa-moreinfos', qs_sfaMoreinfos));
    dispatch(fetchCodebook('sfa'));
  }, [dispatch]);

  const tableActionForm = {
    title: 'Action',
    key: 'action',
    // width: 200,
    align: 'center',
    render: (text, record) => (
      <>
        <Space size="middle">
          <Button
            onClick={() =>
              handleButtonOnclick(
                {
                  mode: 'detailview',
                },
                record.id,
              )
            }
          >
            View
          </Button>
        </Space>
      </>
    ),
  };
  //**************************************************/

  //******************공통사항 **********************
  const handleButtonOnclick = async (value, id) => {
    if (value.action === 'DRAWER') {
      console.log(`>>>>`, value);
      const drawer = value.drawer;
      if (drawer.action === 'add') {
        let changeDrawer = {};
        // sfa isProject enable 고객사 정보
        // const query = qs_sfaCustomersByIsProject;
        // const path = 'api/sfas';
        // const get_sfa_customers = await fetchAllListR1({
        //   qs: query,
        //   path: path,
        //   filter: { isProject: true },
        // });
        // console.log(`>>>>(get_sfa_customers)`, get_sfa_customers);
        // const opt_sfa_customers = jsonFormatOptimize(get_sfa_customers);
        // console.log(`>>>>(get_sfa_customers > opt)`, opt_sfa_customers);

        changeDrawer.path = CONF.info.path;
        changeDrawer.loading = false;
        changeDrawer = { ...changeDrawer, ...value.drawer, open: true };
        setSelectBook({
          ...commonData,
          ...cb,
        });
        dispatch(changeDrawerVisible(changeDrawer));
      }
    } else if (value.mode === 'detailview') {
      //
      console.log('>>', id);
      // dispatch(changeMode(value.mode));
      // dispatch(addMoreinfo({ id: id }));
    }
  };
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };
  //******************공통사항 **********************

  return (
    <Base>
      <ActionButton
        items={CONF.subMenuItems}
        handleButtonOnclick={handleButtonOnclick}
      />
      <ListTableForm
        tableColumns={CONF.tableColumns}
        tableActionForm={tableActionForm}
        tableData={tableData}
      />
      {drawer.open && drawer.loading === false && selectBook ? (
        <DrawerBlock>
          <Drawer
            title={drawer.title}
            open={drawer.open}
            width={drawer.width}
            onClose={handleOnclose}
            bodyStyle={{ paddingBottom: 80 }}
          >
            {/* <SfaDrawerForm
              drawer={drawer}
              selectBook={selectBook}
              formItems={CONF.drawerFormItems}
              initialValues={drawerInitialValues}
              handleOnSubmit={handleOnSubmit}
              handleOnChange={handleSelectOnChange}
              //
              drawerTableData={drawerTableData}
              moreinfoColumns={drMoreinfoColumns}
              recordColumns={CONF.drRecordColumns}
              drMoreFormItems={CONF.drMoreFormItems}
            /> */}
          </Drawer>
        </DrawerBlock>
      ) : (
        ''
      )}
    </Base>
  );
};

export default WorkContainer;
