import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Space, Divider, message, Radio, Drawer } from 'antd';
import { useLocation } from 'react-router-dom';
import DrawerFormSFA from '../../components/templete/DrawerFormSFA';
import fetchLists from '../../modules/fetchLists';
import { changeDrawerVisible, initDrawerVisible } from '../../modules/status';
import submitToDbSfa from '../../modules/common/submitToDbSfa';
import dayjs from 'dayjs';
import styled from 'styled-components';
import FormIteams from '../../components/drawer/FormItems';
// import FormSfaView from '../../components/drawer/FormSfaView';
import SfaDrawerForm from '../../components/SfaDrawerForm';
import submitToDB2 from '../../modules/common/submitToDB2';
// import { drawerInfo } from '../../config/salesConfig';
import composeSubmitDatas from '../../modules/common/composeSubmitDatas';

const DrawerBlock = styled.div`
  //
`;

// sales..
const DrawerContainer = ({
  drawer,
  selectBook,
  drawerInfo,
  formItems,
  initialValues,
  drawerTableData,
  setInitialValues,
  onChangeSubButton,
  // pr_list,
  dfAction,
  handleSelectOnChange,
  drMoreinfoColumns,
  drRecordColumns,
  drMoreFormItems,
}) => {
  const dispatch = useDispatch();
  // const { open, action, drloading, drawer } = useSelector(({ status }) => ({
  //   open: status.drawer.open,
  //   action: status.drawer.action,
  //   drloading: status.drawer.loading,
  //   drawer: status.drawer,
  // }));
  const pathName = useLocation().pathname;

  useEffect(() => {
    //
    return () => {
      // dispatch(initDrawerVisible());
    };
  }, []);

  //(공통) Drawer Form -> Close 시
  const handleOnclose = () => {
    dispatch(initDrawerVisible());
    setInitialValues();
  };

  // console.log('--subment----', dfAction);

  // (공통) drawer form 에서 수정 체크 박스 변경시
  const handleCheck = (e) => {
    const name = e.target['data-id'];
    console.log('>>>(handleCheck', e);
    // setCheckbox({ ...checkbox, [name]: e.target.checked });
  };

  // 코드북 2단계
  const handleOnChange = async (value, option) => {
    console.log('--value----', value, option);
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

    const reqData4th = await submitToDB2(req_submit_datas);

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

  // DR SUB MENU
  const DrawerAction = () => {
    return (
      <>
        <Radio.Group
          defaultValue="view"
          onChange={onChangeSubButton}
          buttonStyle="solid"
        >
          {dfAction.map((list, i) => (
            <Radio.Button key={i} value={list.value}>
              {list.name}
            </Radio.Button>
          ))}
        </Radio.Group>
        <Divider />
      </>
    );
  };

  return (
    <DrawerBlock>
      <Drawer
        title={drawer.title}
        open={drawer.open}
        width={drawer.width}
        onClose={handleOnclose}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {drawer.id ? DrawerAction() : ''}

        <SfaDrawerForm
          initialValues={initialValues}
          drawerTableData={drawerTableData}
          moreinfoColumns={drMoreinfoColumns}
          recordColumns={drRecordColumns}
          drawer={drawer}
          handleOnChange={handleSelectOnChange}
          drMoreFormItems={drMoreFormItems}
          selectBook={selectBook}
          handleOnSubmit={handleOnSubmit1}
          formItems={formItems}
        />

        {/* <Divider />
        {drawer.mode !== 'view' ? (
          <FormIteams
            selectBook={selectBook}
            formItems={formItems}
            handleOnSubmit={handleOnSubmit}
            handleOnChange={handleSelectOnChange}
            initialValues={initialValues}
          />
        ) : (
          <FormSfaView
            initialValues={initialValues}
            drawerTableData={drawerTableData}
          />
        )} */}
      </Drawer>
    </DrawerBlock>
  );
};

export default DrawerContainer;
