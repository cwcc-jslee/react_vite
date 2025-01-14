import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getCustomerlist } from '../../modules/customer';
import { changeDrawerVisible, getCodebook } from '../../modules/status';
import AutoComplete from '../../components/common/AutoComplete';
import * as api from '../../lib/api/api';
import { qs_customerDetail } from '../../lib/api/queryCustomer';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';
import ListTableForm from '../../components/templete/ListTableForm';
import {
  tableColumns,
  setTableLists,
  drawerInfo,
  drawerLists,
  drawerSubmit,
  setDrawerInitialValues,
} from '../../config/customerConfig';
import { Button, Space, Divider, message } from 'antd';
import DrawerForm from '../../components/templete/DrawerForm';
import { qs_getSelectFormLists } from '../../lib/api/queryCommon';
import fetchLists from '../../modules/fetchLists';
import dayjs from 'dayjs';
import { tbl_insert } from '../../modules/common/tbl_crud';
// import SubmitDrwaerContainer from '../common/SubmitDrawerContainer';
import submitDrwaerToDB from '../../modules/common/submitDrawerToDB';
import DrawerFormContainer from '../common/DrawerFormContainer';

const Base = styled.div`
  width: 100%;
`;

const CustomerContainer = () => {
  const dispatch = useDispatch();
  const { codebook } = useSelector(({ status }) => ({
    codebook: status.codebook,
  }));
  const { lists, status, error } = useSelector(({ customer }) => ({
    lists: customer.data,
    status: customer.status,
    error: customer.error,
  }));

  const { open, mode, drloading, drawer } = useSelector(({ status }) => ({
    open: status.drawer.open,
    mode: status.drawer.mode,
    drloading: status.drawer.loading,
    drawer: status.drawer,
  }));

  // const [customerInfo, setCustomerInfo] = useState();
  const [tableData, setTableData] = useState();
  const [selectBook, setSelectBook] = useState();
  const [initialValues, setInitialValues] = useState();
  const [btnDisabled, setBtnDisabled] = useState(false);

  useEffect(() => {
    dispatch(
      changeDrawerVisible({
        open: false,
        mode: null,
        path: null,
        loading: null,
      }),
    );
  }, []);

  // 컴포넌츠 처음 렌더링시 고객리스트 가져옴(디스패치..)
  useEffect(() => {
    dispatch(getCustomerlist());
    // getcodebook 부분 수정 필요 해당 메뉴 선택시 마다 dispatch 됨
    dispatch(getCodebook());
  }, [dispatch]);

  useEffect(() => {
    if (status) {
      console.log('고객리스트 가져오기 성공');
    }
    if (error) {
      console.log('고객리스트 가져오기 실패');
      console.log(error);
    }
  }, [status]);

  // ListTableForm 데이터
  useEffect(() => {
    if (lists) {
      const request = setTableLists(lists);
      setTableData(request);
    }
  }, [lists]);

  // 컴포넌트 1번만 렌더링
  useEffect(() => {
    if ((mode && mode === 'add') || mode === 'edit') {
      fetchSelectFormLists();
    }
  }, [open]);

  const tableActionForm = {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        {/* handleDrawer : /명령-add, view, edit / id */}
        <Button onClick={() => handleDrawer('view', record.id)}>View</Button>
      </Space>
    ),
  };

  // ****************************************************** //
  // const handleDrawer = async (action, id) => {
  //   console.log('*****', id);
  //   try {
  //     if (action === 'view') {
  //       const path = `api/customers/${id}`;
  //       const query = qs_customerDetail();
  //       const request = await fetchLists(path, query);
  //       console.log('**request**', request[0]);
  //       // Drawer initialValues 설정
  //       const init = setDrawerInitialValues(request[0]);
  //       setInitialValues(init);
  //       fetchSelectFormLists();
  //     }
  //     dispatch(
  //       changeDrawerVisible({
  //         open: true,
  //         mode: action,
  //         path: 'api/customers',
  //       }),
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // //(공통) Drawer Form -> Close 시
  // const handleOnclose = () => {
  //   dispatch(
  //     changeDrawerVisible({
  //       open: false,
  //       mode: null,
  //       path: null,
  //       loading: null,
  //       btnDisabled: false,
  //     }),
  //   );
  //   setInitialValues();
  // };

  // // (공통)view draser form 에서 모드 선택버튼 클릭시(view/edit)
  // const handleModeButton = (e) => {
  //   console.log('>>>>', e.target.value);
  //   dispatch(changeDrawerVisible({ mode: e.target.value }));
  // };

  // //onsubmit null 체크 // 모듈화 필요
  // const checkOnsubmitValue = (value) => {
  //   const temp = [{}, {}];
  //   for (const key in value) {
  //     if (value[key]) {
  //       const arrno = drawerLists.filter((v, i) => v['name'] === key)[0];
  //       if ('submit_index' in arrno) {
  //         const index = arrno.submit_index;
  //         temp[index][key] = value[key];
  //       } else {
  //         temp[0][key] = value[key];
  //       }
  //     }
  //   }
  //   return temp;
  // };

  // // (공통) Drawer Form 에서 onsubmit 시
  // // onsubmit 단계 설정
  // // name, cb_classification, cb_funnel, funnel_suffix, business_number, homepage, description
  // // cb_bu_type, cb_by_tiems, representative_name, sales_revenue, exports, employee, commencemtnt_date, cb_region, address
  // const handleOnSubmit = async (value, value2) => {
  //   if (mode === 'add') {
  //     console.log(`>>>>onsubmit mode:(${mode})`, value);
  //     const datas = checkOnsubmitValue(value);
  //     console.log('>>(datas)', datas);
  //     dispatch(
  //       changeDrawerVisible({
  //         btnDisabled: true,
  //       }),
  //     );

  //     // action:(insert, update), path :(api/customers), data:
  //     // (1단계) customers insert
  //     const customer_update = await submitDrwaerToDB(
  //       drawer.mode,
  //       drawer.path,
  //       datas[0],
  //     );
  //     // (2단계) customer_moreinfo insert
  //     // const moreinfo_update = await submitDrwaerToDB(drawer, datas[1]);
  //     if (customer_update && Object.keys(datas[1]).length >= 1)
  //       datas[1].customer = customer_update.data.id;
  //     const moreinfo_update = customer_update
  //       ? await submitDrwaerToDB(
  //           drawer.mode,
  //           `api/customer-moreinfos`,
  //           datas[1],
  //         )
  //       : false;

  //     //결과
  //     console.log('>>>>> message', moreinfo_update);
  //     if (customer_update && moreinfo_update) {
  //       dispatch(
  //         changeDrawerVisible({
  //           open: false,
  //           mode: null,
  //           path: null,
  //           loading: null,
  //           btnDisabled: false,
  //         }),
  //       );
  //     } else {
  //       setTimeout(() => {
  //         dispatch(
  //           changeDrawerVisible({
  //             btnDisabled: false,
  //           }),
  //         );
  //       }, 5000);
  //     }
  //   } else if (mode === 'edit') {
  //     console.log(`>>>>onsubmit mode:(${mode})`, value, value2);
  //   }
  // };

  // // (공통) drawer form 에서 수정 체크 박스 변경시
  // const handleCheck = (e) => {
  //   const name = e.target['data-id'];
  //   console.log('>>>(handleCheck', e);
  //   // setCheckbox({ ...checkbox, [name]: e.target.checked });
  // };

  // // Drawer -> EDIT, ADD 모드일경우 SELECT 정보 가져오기 기능
  // // 코드북 1단계
  // const fetchSelectFormLists = async () => {
  //   //
  //   const path1 = `api/top-programs`;
  //   const path2 = `api/customers`;
  //   // 고객사 테이블에서 '지원기관' 정보 필터
  //   const filter2 = { cb_classification: { id: { $eq: 3 } } };
  //   const query1 = qs_getSelectFormLists();
  //   const query2 = qs_getSelectFormLists(filter2);
  //   const request1 = await fetchLists(path1, query1, true);
  //   const request2 = await fetchLists(path2, query2, true);
  //   console.log('**request**', request2);
  //   const in_out = [
  //     { id: 1, attributes: { name: '내부' } },
  //     { id: 2, attributes: { name: '외부' } },
  //   ];
  //   setSelectBook({
  //     ...codebook,
  //     'top-programs': request1,
  //     // 'top-programs': null,
  //     customers: request2,
  //     'in-out': in_out,
  //   });
  //   dispatch(changeDrawerVisible({ loading: false }));
  // };

  // // 코드북 2단계
  // const handleOnChange = async (value) => {
  //   console.log('--value----', value);
  // };

  // ****************************************************** //

  return (
    <Base>
      <AutoComplete lists={tableData} />
      {status ? (
        <ListTableForm
          tableColumns={tableColumns}
          tableActionForm={tableActionForm}
          tableData={tableData}
          // handleDrawer={handleDrawer}
        />
      ) : (
        <h1>로객리스트 로딩중..</h1>
      )}
      {/* {customerInfo ? ( */}
      {drloading === false && selectBook ? (
        <DrawerForm
          // drawer={drawer}
          // open={open}
          // mode={mode}
          selectBook={selectBook}
          drawerLists={drawerLists}
          initialValues={initialValues}
          handleOnSubmit={handleOnSubmit}
          handleOnclose={handleOnclose}
          handleOnChange={handleOnChange}
          handleModeButton={handleModeButton}
          drawerInfo={drawerInfo}
          handleCheck={handleCheck}
        />
      ) : (
        // <CustomerDrawerForm
        //   handleOnclose={handleOnclose}
        //   customerInfo={customerInfo}
        //   handleModeButton={handleModeButton}
        //   handleOnSubmit={handleOnSubmit}
        // />
        ''
      )}
    </Base>
  );
};

export default CustomerContainer;
