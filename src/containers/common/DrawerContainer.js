import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Button, Space, Divider, Table, Radio, Drawer } from 'antd';
import {
  getList,
  changeDrawerVisible,
  getCodebook,
  initDrawerVisible,
  fetchCodebook,
} from '../../modules/status';
import { useLocation } from 'react-router-dom';
import composeSubmitDatas from '../../modules/common/composeSubmitDatas';
import SfaDrawerForm from '../../components/SfaDrawerForm';

const DrawerBlock = styled.div`
  //
`;

const DrawerContainer = (props) => {
  const dispatch = useDispatch();
  const pathName = useLocation().pathname;
  const drawer = props.drawer;
  //Drawer Form 관련
  const [drawerInitialValues, setDrawerInitialValues] = useState();
  //   const [selectBook, setSelectBook] = useState();

  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setDrawerInitialValues();
  };

  // ************************************************************** //
  const handleOnSubmit1 = async (props) => {
    const value = props.value;
    const isChecked = props.isChecked ? props.isChecked : null;
    const preiousInitialValues = props.initialValues;
    const action = drawer.action;
    const subAction = drawer.sub ? drawer.sub.action : null;
    const more = drawer.more ? drawer.more : null;
    const actionTo = more ? more.actionTo : null;
    const addkey = more ? more.addkey : null;
    console.log(`>>>>onsubmit mode:(${action}), value:`, value);
    console.log(`>>>>onsubmit isChecked`, isChecked);
    console.log(
      `>>>>(actionTo:${actionTo}), addkey : `,
      addkey ? addkey[0] : null,
    );
    // dispatch(
    //   changeDrawerVisible({
    //     btnDisabled: true,
    //   }),
    // );
    // console.log(`>>>>onsubmit salesProfitValue`, salesProfitValue);

    //************************************************** */
    // composeSubmitDatas...

    const req_submit_datas = composeSubmitDatas({
      pathName: pathName,
      drawer: drawer,
      submit_data: value,
      isChecked: isChecked,
      preiousInitialValues,
    });
    console.log(`>>>>_req_submit_data`, req_submit_datas);

    //************************************************** */

    // const reqData4th = await submitToDB2(req_submit_datas);

    // 임시
    setTimeout(() => {
      dispatch(
        changeDrawerVisible({
          btnDisabled: false,
        }),
      );
    }, 5000);
  };

  // ************************************************************** //

  return (
    <>
      <DrawerBlock>
        <Drawer
          title={drawer.title}
          open={drawer.open}
          width={drawer.width}
          onClose={handleOnclose}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <SfaDrawerForm
            drawer={drawer}
            selectBook={props.selectBook}
            initialValues={drawerInitialValues}
            drawerTableData={props.drawerTableData}
            moreinfoColumns={props.moreinfoColumns}
            recordColumns={props.recordColumns}
            drMoreFormItems={props.drMoreFormItems}
            handleOnSubmit={handleOnSubmit1}
            handleOnChange={props.handleOnChange}
            formItems={props.formItems}
          />
        </Drawer>
      </DrawerBlock>
    </>
  );
};

export default DrawerContainer;
